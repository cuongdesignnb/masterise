# QA Report: Unified Project Status

Date: 2026-07-13

## Scope

- Unified `projects.status` and `projects.sales_status` into the canonical `projects.project_status` field.
- Canonical values: `coming_soon`, `selling`, `sold_out`, `handing_over`, `handover`.
- Updated database migration/backfill, API validation and filtering, admin UI, public filters, cards, homepage, project detail, types, adapters, seeders, and regression coverage.
- Preserved the existing dynamic-region changes in the working tree.

## Pre-migration audit

- Projects audited: 10.
- Legacy `status`: `completed=2`, `selling=6`, `upcoming=2`.
- Legacy `sales_status`: `coming_soon=2`, `handover=2`, `selling=6`.
- Null, empty, unknown, or conflicting values: 0.
- Final canonical values: `coming_soon=2`, `selling=6`, `sold_out=0`, `handing_over=0`, `handover=2`.

## Migration and API

- Migration adds and indexes `project_status`, audits every record before destructive changes, logs conflicts, and aborts before dropping legacy columns when a value cannot be mapped.
- A valid legacy `sales_status` takes precedence; legacy construction values are used as fallback.
- `status` and `sales_status` are removed after successful validation.
- Create/update accept only canonical `project_status`; legacy payload fields are prohibited.
- Public and admin filters use canonical `project_status`.
- Transitional legacy query aliases remain available with a `Deprecation: true` response header.
- Invalid canonical query values return HTTP 422.
- API responses contain `project_status` and do not contain `status` or `sales_status`.

## Automated verification

- Unified status regression: 23 passed, 71 assertions.
- Full backend suite: 56 passed, 281 assertions.
- `php artisan route:list`: passed, 136 routes.
- TypeScript (`npx tsc --noEmit`): passed.
- Frontend lint (`npm run lint -- --quiet`): passed.
- Production build (`npm run build`): passed.
- `git diff --check`: passed after whitespace cleanup.

## Manual browser QA

- Admin list has exactly one canonical project-status filter with all five options.
- Admin edit form has exactly one `Trạng thái dự án` field with all five options; the detailed construction timeline remains separate.
- Public filter exposes all five canonical options.
- `project_status=selling` returned six cards and every returned card had `selling`; no `coming_soon` or `handover` cards remained.
- `project_status=sold_out` returned the expected empty state because the local dataset contains no sold-out project.
- The Global City detail page displayed `Đang mở bán` and did not display the old `Đang thi công` label.
- Browser console errors: 0.
- Save/reload behavior is covered by the backend regression suite; no persistent local test mutation was left behind.

## Evidence

- `admin-project-status-filter.png`
- `admin-single-project-status.png`
- `public-status-filter-options.png`
- `public-filter-selling.png`
- `public-filter-sold-out.png`

## Technical notes

- During QA, the running PHP container initially served stale application code; restarting only the PHP service refreshed the runtime. No production deployment was performed.
- Docker's PHP test environment inherits a MySQL connection, so the final regression runs were executed with host PHP and the test suite's isolated SQLite database. The local seeded baseline was restored and verified at 10 published projects with the canonical counts above.
- The known API posts cache payload warning (about 26.5 MB) is non-blocking and was not refactored in this task.
- Optional OCI/Firebird PHP extension warnings are non-blocking; no extensions were installed.
- Nothing was staged, committed, pushed, or deployed.
