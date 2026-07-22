param(
    [string]$BaseUrl = 'http://localhost:8746'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $repoRoot 'artifacts/qa/seo-schema-hardening-rc3/test-logs'
$testedSha = (git -C $repoRoot rev-parse HEAD).Trim()
$utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)

[System.IO.Directory]::CreateDirectory($logDirectory) | Out-Null

function Invoke-QaLog {
    param(
        [Parameter(Mandatory)] [string]$FileName,
        [Parameter(Mandatory)] [string]$Command,
        [Parameter(Mandatory)] [scriptblock]$Action
    )

    $timestamp = (Get-Date).ToUniversalTime().ToString('o')
    $previousErrorPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $captured = @(& $Action 2>&1 | ForEach-Object { $_.ToString().TrimEnd() })
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorPreference
    }
    if ($null -eq $exitCode) {
        $exitCode = 0
    }

    $lines = @(
        "timestamp: $timestamp"
        "commit SHA: $testedSha"
        "command: $Command"
        ''
    ) + $captured + @(
        ''
        "exit code: $exitCode"
    )

    [System.IO.File]::WriteAllLines((Join-Path $logDirectory $FileName), $lines, $utf8WithoutBom)

    if ($exitCode -ne 0) {
        throw "QA command failed with exit code ${exitCode}: $Command"
    }
}

Invoke-QaLog -FileName 'commit-sha.txt' -Command 'git rev-parse HEAD' -Action {
    git -C $repoRoot rev-parse HEAD
}

Invoke-QaLog -FileName 'frontend-install.log' -Command 'npm ci' -Action {
    Push-Location $repoRoot
    try { npm ci } finally { Pop-Location }
}

Invoke-QaLog -FileName 'frontend-lint.log' -Command 'npm run lint' -Action {
    Push-Location $repoRoot
    try { npm run lint } finally { Pop-Location }
}

Invoke-QaLog -FileName 'frontend-build.log' -Command 'npm run build' -Action {
    Push-Location $repoRoot
    try { npm run build } finally { Pop-Location }
}

Invoke-QaLog -FileName 'frontend-tsc.log' -Command 'npx tsc --noEmit' -Action {
    Push-Location $repoRoot
    try { npx tsc --noEmit } finally { Pop-Location }
}

Invoke-QaLog -FileName 'offer-schema-tests.log' -Command 'npm run test:seo:schema' -Action {
    Push-Location $repoRoot
    try { npm run test:seo:schema } finally { Pop-Location }
}

$dockerStarted = $false
try {
    Push-Location $repoRoot
    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to start the local Docker QA stack.'
    }
    $dockerStarted = $true

    $frontendReady = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/" -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                $frontendReady = $true
                break
            }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }
    if (-not $frontendReady) {
        throw 'The local frontend did not become ready for integration QA.'
    }

    Invoke-QaLog -FileName 'backend-composer.log' -Command 'docker compose exec -T php composer install --no-interaction --prefer-dist' -Action {
        docker compose exec -T php composer install --no-interaction --prefer-dist
    }

    $testingDatabase = '/tmp/seo-rc3-' + (Get-Date -Format 'yyyyMMddHHmmss') + '.sqlite'
    Invoke-QaLog -FileName 'backend-migration-testing.log' -Command 'docker compose exec -T php php artisan migrate:fresh --env=testing --force (isolated SQLite)' -Action {
        docker compose exec -T php sh -lc "touch '$testingDatabase' && DB_CONNECTION=sqlite DB_DATABASE='$testingDatabase' php artisan migrate:fresh --env=testing --force"
    }

    Invoke-QaLog -FileName 'backend-tests.log' -Command 'docker compose exec -T php php artisan test' -Action {
        docker compose exec -T php php artisan test
    }

    Invoke-QaLog -FileName 'asset-validation.log' -Command 'SEO_BASE_URL=http://localhost:8746 npm run test:seo:assets' -Action {
        $env:SEO_BASE_URL = $BaseUrl
        npm run test:seo:assets
    }

    Invoke-QaLog -FileName 'seo-smoke.log' -Command 'SEO_BASE_URL=http://localhost:8746 SEO_SMOKE_STRICT=0 npm run test:seo (verified local fixtures)' -Action {
        $env:SEO_BASE_URL = $BaseUrl
        $env:SEO_SMOKE_STRICT = '0'
        $env:SEO_PROJECT_NO_PRODUCT_SLUG = 'lumiere-midtown'
        $env:SEO_PROJECT_OFFER_SLUG = 'lumiere-riverside'
        Remove-Item Env:SEO_PROJECT_REVIEW_SLUG -ErrorAction SilentlyContinue
        $env:SEO_NEWS_SLUG = 'masterise-homes-va-chuan-song-bat-dong-san-hang-hieu'
        $env:SEO_EVENT_SLUG = 'su-kien-gioi-thieu-dong-san-pham-lumiere-series'
        Remove-Item Env:SEO_ACTIVE_JOB_SLUG -ErrorAction SilentlyContinue
        Remove-Item Env:SEO_EXPIRED_JOB_SLUG -ErrorAction SilentlyContinue
        $env:SEO_PAGE_SLUG = 'chinh-sach-bao-mat'
        npm run test:seo
    }
}
finally {
    if ($dockerStarted) {
        docker compose down
    }
    Pop-Location
}
