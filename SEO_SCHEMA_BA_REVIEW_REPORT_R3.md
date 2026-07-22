# SEO & Schema Hardening - Round 4 Final Verification

> Authoritative approval report. The older `SEO_SCHEMA_BA_REVIEW_REPORT.md` is superseded and removed from the pull request. Historical local files are not approval evidence.

## Scope and Git traceability

- Repository: `cuongdesignnb/masterise`
- Pull request: `#1`
- Base branch: `main`
- Feature branch: `chore/seo-schema-hardening`
- Starting SHA: `ed75d58b6aa59f7a6aab75663e6030a0f3c513eb`
- Historical local full-QA SHA: `aae40a369c6f9dac62a5dfc742870084e1a0ad96`
- Previous final CI-verified SHA: `ed423d194307b03e21cedb4231221c76eb3eb118`
- Previous immutable tag: `seo-schema-rc3-20260722-015111`
- Round 4 corrective-code SHA: `eb74f0d6c36db7a2c6e50611e0f7382e783b1fc8`
- Final Round 4 CI SHA, immutable RC4 tag, workflow run IDs and URLs: recorded in the UTF-8 pull-request body after the final CI run.

The local logs generated at `aae40a...` are historical evidence only. They are not represented as having been generated from `ed423d...` or the final Round 4 head.

No merge, push to `main`, force-push, production deployment, or production migration is part of this verification.

## Round 4 blocker resolution

`buildOffersNode()` now normalizes availability without inventing commercial status:

- preserves the supported full Schema.org URLs `InStock`, `OutOfStock`, `PreOrder`, and `LimitedAvailability`;
- maps known internal values such as `sold_out` to the correct Schema.org URL;
- omits empty and unknown values;
- never defaults an unknown value to `InStock`.

The regression suite covers all four full URLs, internal `sold_out`, unknown input, empty input, and a rendered Product schema assertion. The test is also part of the frontend CI job.

## Verification results

### Local frontend QA at Round 4 corrective-code SHA

The following local checks were run at `eb74f0d6c36db7a2c6e50611e0f7382e783b1fc8` and are recorded in `artifacts/qa/seo-schema-hardening-rc3/test-logs/`:

- `npm ci`: pass.
- `npm run lint`: pass with 0 errors; 406 existing warnings remain.
- `npx tsc --noEmit`: pass.
- `npm run test:seo:schema`: 8 tests pass, 0 fail.
- `npm run test:seo:assets`: pass; HTTP checks skipped because no local base URL was provided.
- `npm run build`: pass on Next.js 16.2.7 with the existing ImageResponse `z-index` warning.

### Local Docker backend/integration QA status

Docker Desktop was enabled only for backend/integration QA, but the Docker engine failed before the local stack could start:

```text
unable to get image 'mysql:8.0': request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.54/images/mysql:8.0/json
Unable to start the local Docker QA stack.
```

Because the stack did not start, there is no new local Round 4 backend/integration pass at `eb74f0d...`. Backend and integration verification for the final Round 4 head is therefore taken from the two required GitHub Actions runs after push.

Docker is stopped after the local attempt; no project containers are expected to remain running.

### Remote CI

For the previous RC3 head, both workflow triggers were independently verified:

- Push run `29858763967`: frontend 1/1, backend 1/1, integration-smoke 1/1 - 3/3 jobs passed.
- Pull-request run `29858766186`: frontend 1/1, backend 1/1, integration-smoke 1/1 - 3/3 jobs passed.

The final Round 4 approval must use the two new workflow run IDs/URLs in the PR body. "6 jobs passed" is valid only when both the push run and pull-request run are cited as 3/3.

PR file/addition/deletion/commit totals are read from GitHub after the final push and recorded in the PR body; no stale totals are treated as authoritative in this repository report.

## Functional and security status

- Sensitive schema and public-review feature flags exist and default to `false`.
- Public and Admin review resources are separated.
- Public review aggregate and item queries use the same published scope.
- Public review submission is disabled by default and protected when enabled.
- Admin review requests use the authenticated API helper and role-protected routes.
- Event and JobPosting schemas have eligibility gates and structured fields.
- Sitemap timestamps are sourced from real data or omitted.
- Asset checks validate signature, decodeability, dimensions, entropy, MIME, and HTTP responses.
- Product/Offer availability now preserves valid Admin Schema.org values.

## Evidence

- [QA walkthrough](artifacts/qa/seo-schema-hardening-rc3/walkthrough.md)
- [Homepage desktop](artifacts/qa/seo-schema-hardening-rc3/screenshots/homepage-desktop.png)
- [Project mobile](artifacts/qa/seo-schema-hardening-rc3/screenshots/project-mobile.png)
- [Default Open Graph image](artifacts/qa/seo-schema-hardening-rc3/screenshots/og-default-browser.png)
- [Twitter image](artifacts/qa/seo-schema-hardening-rc3/screenshots/twitter-image-browser.png)
- [Admin review login guard](artifacts/qa/seo-schema-hardening-rc3/screenshots/admin-project-reviews-login.png)

All links are repository-relative so they work in GitHub.

## Operational conditions before enabling schema flags

Keep these values `false` during the initial deployment:

- `seo_site_entity_enabled`
- `seo_project_product_schema_enabled`
- `seo_project_review_schema_enabled`
- `seo_event_schema_enabled`
- `seo_job_schema_enabled`
- `public_project_review_submission_enabled`

Before enabling brand/entity schema, obtain operator identity and neutral artwork approval. Before enabling Product/Review, run staging fixtures for an ineligible project, valid Offer, approved public review, pending review, and rejected review. Before enabling Event/JobPosting, run strict rendered smoke tests for eligible/ineligible events and active/expired/closed jobs.

Production must explicitly review `SEO_SITEMAP_STRICT`, `SEO_SITEMAP_MIN_DYNAMIC_URLS`, and `SEO_SITEMAP_EXPECTED_DYNAMIC_URLS`. Configure the Next revalidation secret consistently between Laravel and Next.js.

## Deployment recommendation

Do not deploy from this local review. After code review and BA approval, use the maintained deployment script:

```bash
DEPLOY_BRANCH=main bash deploy-production.sh
```

Pre-deploy gates:

1. Database backup created and restore verification completed.
2. Current production SHA recorded.
3. Brand/operator approval completed.
4. Sensitive schema and public-review flags confirmed `false`.
5. Migration reviewed successfully on staging.
6. Rollback owner assigned.
7. Sitemap production configuration reviewed.
8. Next revalidation secret configured consistently.

Do not enable entity, Product, Review, Event, or Job schema during the initial deployment.

## Non-blocking backlog

- 406 existing lint warnings.
- 6 npm dependency advisories from the latest local `npm ci`.
- Neutral artwork pending brand approval.
- ImageResponse `z-index` warning.

Do not run `npm audit fix --force` in this pull request. Track these separately.

## Rollback

Do not rewrite history. If the Round 4 corrective commit must be withdrawn:

```bash
git switch chore/seo-schema-hardening
git revert <round-4-corrective-commit-sha>
git push origin chore/seo-schema-hardening
```

The RC3 and RC4 tags are immutable audit points and must not be moved or deleted.
