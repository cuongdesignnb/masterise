# SEO & Schema Hardening — Round 4 QA Walkthrough

## SHA provenance

- Historical local full-QA SHA: `aae40a369c6f9dac62a5dfc742870084e1a0ad96`.
- Previous final CI-verified SHA: `ed423d194307b03e21cedb4231221c76eb3eb118`.
- Previous immutable tag: `seo-schema-rc3-20260722-015111`.
- Round 4 local full-QA SHA: read from [`test-logs/commit-sha.txt`](test-logs/commit-sha.txt).
- Final Round 4 CI SHA, RC4 tag, and both workflow URLs: recorded in the UTF-8 pull-request body after CI completes.

Historical logs are not represented as having been generated from a later SHA.

## Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-seo-rc3-qa.ps1
```

The runner performs:

1. `npm ci`.
2. `npm run lint`.
3. `npm run build`.
4. `npx tsc --noEmit`.
5. `npm run test:seo:schema`.
6. Starts Docker only for backend and integration QA.
7. Composer install.
8. `migrate:fresh` on an isolated SQLite testing database.
9. Full Laravel test suite.
10. Filesystem and local-HTTP asset validation.
11. SEO smoke against verified local fixtures.
12. `docker compose down` in `finally`.

## Result sources

| Check | Evidence |
|---|---|
| Frontend install | [`test-logs/frontend-install.log`](test-logs/frontend-install.log) |
| Frontend lint | [`test-logs/frontend-lint.log`](test-logs/frontend-lint.log) |
| TypeScript | [`test-logs/frontend-tsc.log`](test-logs/frontend-tsc.log) |
| Production build | [`test-logs/frontend-build.log`](test-logs/frontend-build.log) |
| Offer availability regression | [`test-logs/offer-schema-tests.log`](test-logs/offer-schema-tests.log) |
| Composer install | [`test-logs/backend-composer.log`](test-logs/backend-composer.log) |
| Isolated testing migration | [`test-logs/backend-migration-testing.log`](test-logs/backend-migration-testing.log) |
| Backend suite | [`test-logs/backend-tests.log`](test-logs/backend-tests.log) |
| Asset validation | [`test-logs/asset-validation.log`](test-logs/asset-validation.log) |
| SEO integration smoke | [`test-logs/seo-smoke.log`](test-logs/seo-smoke.log) |

The Offer regression suite verifies all four supported full Schema.org URLs, internal `sold_out`, unknown input, empty input, and a rendered Product-schema assertion.

Fixture skips in the SEO smoke are recorded transparently. No fake production-like records are seeded solely to force a pass. Required pre-enable rendered fixtures remain an operational gate.

## Visual evidence

- [Homepage desktop](screenshots/homepage-desktop.png)
- [Project mobile 375×812](screenshots/project-mobile.png)
- [Default OG image over HTTP](screenshots/og-default-browser.png)
- [Twitter image over HTTP](screenshots/twitter-image-browser.png)
- [Admin review unauthenticated guard](screenshots/admin-project-reviews-login.png)

Browser checks cover title, description, canonical, robots, one H1, parseable JSON-LD, and the Admin `noindex,nofollow` login guard.

## Docker policy

Docker remains off during code review and frontend-only checks. It is enabled only for backend/integration QA and is shut down by the runner even when a QA command fails. A final `docker compose ps` check must show no project containers running.

## Feature flags and asset policy

All sensitive entity/Product/Review/Event/Job and public-review flags remain `false` for initial deployment. Neutral artwork is not represented as an officially approved Masterise brand asset; brand/operator approval is required before entity schema is enabled.
