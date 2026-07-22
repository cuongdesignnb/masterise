# SEO & Schema Hardening - Round 5 QA Walkthrough

## SHA provenance

- Historical local full-QA SHA: `aae40a369c6f9dac62a5dfc742870084e1a0ad96`.
- Previous final CI-verified SHA: `ed423d194307b03e21cedb4231221c76eb3eb118`.
- Previous immutable tag: `seo-schema-rc3-20260722-015111`.
- Round 4 corrective-code SHA: `eb74f0d6c36db7a2c6e50611e0f7382e783b1fc8`.
- RC4 SHA and tag: `72c69a1c90c8db3a9361549d9cfee0d3de62d094`, `seo-schema-rc4-20260722-085111`.
- Final Round 5 CI SHA, RC5 tag, and both workflow URLs: recorded in the UTF-8 pull-request body after CI completes.

Historical logs are not represented as having been generated from a later SHA.

## Local frontend command set

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm run test:seo:schema
npm run test:seo:assets
npm run build
```

## Local frontend results for Round 5

| Check | Evidence |
|---|---|
| Frontend install | [`test-logs/frontend-install.log`](test-logs/frontend-install.log) |
| Frontend lint | [`test-logs/frontend-lint.log`](test-logs/frontend-lint.log) |
| TypeScript | [`test-logs/frontend-tsc.log`](test-logs/frontend-tsc.log) |
| Production build | [`test-logs/frontend-build.log`](test-logs/frontend-build.log) |
| Offer availability regression | [`test-logs/offer-schema-tests.log`](test-logs/offer-schema-tests.log) |
| Asset validation | [`test-logs/asset-validation.log`](test-logs/asset-validation.log) |

The schema regression suite verifies all four supported full Schema.org Offer availability URLs, internal `sold_out`, unknown input, empty input, a rendered Product-schema assertion, homepage without dangling breadcrumb, conditional JobPosting references, and canonical-origin graph reference validation.

## Local backend/integration status

Docker Desktop was started only for backend/integration QA. The local Docker engine failed before the stack could start:

```text
unable to get image 'mysql:8.0': request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.54/images/mysql:8.0/json
Unable to start the local Docker QA stack.
```

No new local Round 4 backend/integration pass was produced at `eb74f0d...`. Backend and integration verification for Round 4 is provided by the post-push GitHub Actions push and pull-request runs.

The historical backend logs below remain useful context from the previous local full-QA SHA, but they are not represented as Round 4 local pass evidence:

- [`test-logs/backend-composer.log`](test-logs/backend-composer.log)
- [`test-logs/backend-migration-testing.log`](test-logs/backend-migration-testing.log)
- [`test-logs/backend-tests.log`](test-logs/backend-tests.log)
- [`test-logs/seo-smoke.log`](test-logs/seo-smoke.log)

## Visual evidence

- [Homepage desktop](screenshots/homepage-desktop.png)
- [Project mobile 375x812](screenshots/project-mobile.png)
- [Default OG image over HTTP](screenshots/og-default-browser.png)
- [Twitter image over HTTP](screenshots/twitter-image-browser.png)
- [Admin review unauthenticated guard](screenshots/admin-project-reviews-login.png)

Browser checks cover title, description, canonical, robots, one H1, parseable JSON-LD, and the Admin `noindex,nofollow` login guard.

## Docker policy

Docker remains off during code review and frontend-only checks. It is enabled only for backend/integration QA and must be stopped after the attempt. A final `docker compose ps` check must show no project containers running.

## Feature flags and asset policy

All sensitive entity/Product/Review/Event/Job and public-review flags remain `false` for initial deployment. Neutral artwork is not represented as an officially approved Masterise brand asset; brand/operator approval is required before entity schema is enabled.
