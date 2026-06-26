#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/masterise-homes.net.vn}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BRANCH="${DEPLOY_BRANCH:-main}"

PUBLIC_API_URL="${PUBLIC_API_URL:-https://api.masterise-homes.net.vn/api/v1/projects}"
ADMIN_API_URL="${ADMIN_API_URL:-https://api.masterise-homes.net.vn/api/v1/admin/projects?page=1&per_page=10}"
FRONTEND_URL="${FRONTEND_URL:-https://masterise-homes.net.vn}"

NGINX_PROXY_CACHE_DIR="${NGINX_PROXY_CACHE_DIR:-/www/server/nginx/proxy_cache_dir}"
LOCK_FILE="${LOCK_FILE:-/tmp/masterise-production-deploy.lock}"

SERVICES_TO_BUILD="${SERVICES_TO_BUILD:-php nginx queue scheduler frontend}"
SERVICES_TO_RESTART="${SERVICES_TO_RESTART:-php nginx queue scheduler}"

log() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

fail() {
  echo ""
  echo "[FAIL] DEPLOY FAILED: $1"
  echo ""
  exit 1
}

on_error() {
  local exit_code=$?
  local line_no=$1
  echo ""
  echo "[FAIL] ERROR at line ${line_no}, exit code ${exit_code}"
  echo "Deploy stopped."
  echo ""
  exit "${exit_code}"
}

trap 'on_error $LINENO' ERR

if [ -f "${LOCK_FILE}" ]; then
  OLD_PID="$(cat "${LOCK_FILE}" 2>/dev/null || true)"

  if [ -n "${OLD_PID}" ] && kill -0 "${OLD_PID}" 2>/dev/null; then
    fail "Another deploy is running with PID ${OLD_PID}"
  fi

  echo "Old stale lock found, removing..."
  rm -f "${LOCK_FILE}"
fi

echo "$$" > "${LOCK_FILE}"

cleanup() {
  rm -f "${LOCK_FILE}"
}

trap cleanup EXIT

log "START MASTERISE HOMES PRODUCTION DEPLOY"

echo "Time: $(date)"
echo "User: $(whoami)"
echo "Host: $(hostname)"
echo "App dir: ${APP_DIR}"
echo "Branch: ${BRANCH}"
echo "Compose file: ${COMPOSE_FILE}"
echo "Services to build: ${SERVICES_TO_BUILD}"
echo "Services to restart: ${SERVICES_TO_RESTART}"

log "1. CHECK APP DIRECTORY"

cd "${APP_DIR}"

if [ ! -f "${COMPOSE_FILE}" ]; then
  fail "Missing ${COMPOSE_FILE} in ${APP_DIR}"
fi

if [ ! -d ".git" ]; then
  fail "${APP_DIR} is not a git repository"
fi

log "2. CHECK REQUIRED COMMANDS"

command -v git >/dev/null 2>&1 || fail "git is not installed"
command -v docker >/dev/null 2>&1 || fail "docker is not installed"
docker compose version >/dev/null 2>&1 || fail "docker compose is not available"
command -v curl >/dev/null 2>&1 || fail "curl is not installed"

log "3. GIT STATUS BEFORE PULL"

git status --short || true

log "4. PULL LATEST CODE"

git fetch origin "${BRANCH}"
git pull origin "${BRANCH}"

echo ""
echo "Latest commit:"
git log -1 --oneline

log "5. BUILD / RECREATE APP CONTAINERS"

docker compose -f "${COMPOSE_FILE}" up -d --build ${SERVICES_TO_BUILD}

log "6. WAIT FOR CONTAINERS"

sleep 6

docker compose -f "${COMPOSE_FILE}" ps

log "7. CHECK PHP CONTAINER AND LARAVEL"

docker compose -f "${COMPOSE_FILE}" exec -T php sh -lc '
cd /var/www/html

if [ ! -f artisan ]; then
  echo "[FAIL] Missing artisan in /var/www/html"
  exit 1
fi

php artisan --version
'

log "8. CLEAR LARAVEL CACHE BEFORE MIGRATE"

docker compose -f "${COMPOSE_FILE}" exec -T php sh -lc '
cd /var/www/html

php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear
'

log "9. RUN SAFE MIGRATIONS"

docker compose -f "${COMPOSE_FILE}" exec -T php sh -lc '
cd /var/www/html

php artisan migrate --force
'

log "10. ENSURE STORAGE LINK"

docker compose -f "${COMPOSE_FILE}" exec -T php sh -lc '
cd /var/www/html

php artisan storage:link || true
'

log "11. FINAL LARAVEL CACHE CLEAR AND ROUTE CHECK"

docker compose -f "${COMPOSE_FILE}" exec -T php sh -lc '
cd /var/www/html

php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear

echo ""
echo "Checking required admin project routes:"
php artisan route:list | grep -i "api/v1/admin/projects" || php artisan route:list | grep -i "admin/projects" || exit 1
'

log "12. RESTART PHP / NGINX / QUEUE / SCHEDULER RUNTIME"

docker compose -f "${COMPOSE_FILE}" restart ${SERVICES_TO_RESTART}

log "13. WAIT AFTER RESTART"

sleep 8

docker compose -f "${COMPOSE_FILE}" ps

log "14. CLEAR HOST NGINX PROXY CACHE"

if [ -d "${NGINX_PROXY_CACHE_DIR}" ]; then
  rm -rf "${NGINX_PROXY_CACHE_DIR:?}/"*
  echo "Cleared proxy cache: ${NGINX_PROXY_CACHE_DIR}"
else
  echo "Proxy cache dir not found, skipped: ${NGINX_PROXY_CACHE_DIR}"
fi

log "15. TEST AND RELOAD HOST NGINX"

if command -v nginx >/dev/null 2>&1; then
  nginx -t
  nginx -s reload
  echo "Host nginx reloaded."
else
  echo "Host nginx command not found, skipped."
fi

log "16. HEALTH CHECK PUBLIC API"

PUBLIC_BODY="/tmp/masterise_public_api_check.txt"
PUBLIC_CODE="$(curl -s -o "${PUBLIC_BODY}" -w "%{http_code}" "${PUBLIC_API_URL}" -H "Accept: application/json" || true)"

echo "PUBLIC API: ${PUBLIC_API_URL}"
echo "HTTP CODE: ${PUBLIC_CODE}"

if [ "${PUBLIC_CODE}" != "200" ]; then
  echo ""
  echo "Public API response preview:"
  head -c 1200 "${PUBLIC_BODY}" || true
  echo ""
  fail "Public API must return 200"
fi

log "17. HEALTH CHECK ADMIN API WITHOUT TOKEN"

ADMIN_BODY="/tmp/masterise_admin_api_check.txt"
ADMIN_CODE="$(curl -s -o "${ADMIN_BODY}" -w "%{http_code}" "${ADMIN_API_URL}" -H "Accept: application/json" || true)"

echo "ADMIN API: ${ADMIN_API_URL}"
echo "HTTP CODE: ${ADMIN_CODE}"

if [ "${ADMIN_CODE}" = "404" ]; then
  echo ""
  echo "Admin API response preview:"
  head -c 1200 "${ADMIN_BODY}" || true
  echo ""
  fail "Admin API returned 404. This means route/runtime/cache/deploy problem."
fi

if [ "${ADMIN_CODE}" != "200" ] && [ "${ADMIN_CODE}" != "401" ] && [ "${ADMIN_CODE}" != "403" ]; then
  echo ""
  echo "Admin API response preview:"
  head -c 1200 "${ADMIN_BODY}" || true
  echo ""
  fail "Admin API must return 200, 401 or 403. Current: ${ADMIN_CODE}"
fi

log "18. HEALTH CHECK FRONTEND"

FRONTEND_BODY="/tmp/masterise_frontend_check.txt"
FRONTEND_CODE="$(curl -s -o "${FRONTEND_BODY}" -w "%{http_code}" "${FRONTEND_URL}" || true)"

echo "FRONTEND: ${FRONTEND_URL}"
echo "HTTP CODE: ${FRONTEND_CODE}"

if [ "${FRONTEND_CODE}" != "200" ] && [ "${FRONTEND_CODE}" != "301" ] && [ "${FRONTEND_CODE}" != "302" ]; then
  echo ""
  echo "Frontend response preview:"
  head -c 1200 "${FRONTEND_BODY}" || true
  echo ""
  fail "Frontend check failed. Expected 200/301/302."
fi

log "19. SHOW FINAL CONTAINER STATUS"

docker compose -f "${COMPOSE_FILE}" ps

log "DEPLOY SUCCESS"

echo "Public API: ${PUBLIC_CODE}"
echo "Admin API without token: ${ADMIN_CODE}"
echo "Frontend: ${FRONTEND_CODE}"
echo ""
echo "Expected:"
echo "- Public API should be 200"
echo "- Admin API without token should be 401/403 or 200"
echo "- Admin API must never be 404"
echo ""
echo "Done at: $(date)"
