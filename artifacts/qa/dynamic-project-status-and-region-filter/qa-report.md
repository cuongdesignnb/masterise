# QA Report — Dynamic Project Status and Region Filter

Date: 2026-07-15

## Scope

- Dynamic project-status definitions and admin CRUD.
- Canonical `/du-an` region filters based on `Region -> Location -> Project`.
- Backfill of published projects that previously had no `location_id`.

## Data audit and migration

Before migration:

- Published projects: 10.
- Published projects without `location_id`: 10.
- Locations: 0.
- Regions: 4, all with zero linked published projects.

After migration:

- Locations created/reused: 10.
- Published projects without `location_id`: 0.
- Published projects whose location has no region: 0.
- Public region counts: `Miền Bắc (1)`, `Miền Nam (9)`.
- Existing project slugs and project records were preserved.

The backfill resolves a region from canonical project data such as province, address, and existing location text. It does not hard-code project IDs. The migration aborts with an explicit unresolved-project list instead of silently assigning incorrect data.

## Dynamic project statuses

Five legacy-compatible status definitions are seeded:

| Slug | Name | Published projects |
| --- | --- | ---: |
| `coming_soon` | Sắp mở bán | 2 |
| `selling` | Đang mở bán | 6 |
| `sold_out` | Đã hết giỏ hàng | 0 |
| `handing_over` | Đang bàn giao | 0 |
| `handover` | Đã bàn giao | 2 |

Verified behavior:

- Public API returns active status definitions and project counts.
- Public filters only show active statuses with at least one published project.
- Admin list shows all five definitions, including statuses with count zero.
- Admin can create, rename, recolor, activate/deactivate, choose a default, and delete an unused status.
- A status used by projects or selected as the default cannot be deleted.
- An inactive status cannot be assigned to a project.
- Unknown legacy status values are preserved and registered during migration rather than rewritten.
- Badge labels and colors use API metadata with a constrained safe-color palette.
- Browser QA verified create and edit; delete and protection rules are covered by backend regression tests. The temporary QA status was removed after verification.

## Public filter QA

Verified on `/du-an`:

- Status options: `Sắp mở bán (2)`, `Đang mở bán (6)`, `Đã bàn giao (2)`.
- Region options: `Miền Bắc (1)`, `Miền Nam (9)`.
- Selecting `Miền Bắc` updates the URL to `?region=mien-bac` and returns only the matching northern project.
- Combining `region=mien-bac&project_status=handover` returns exactly `Masteri Waterfront`.
- Selected filters survive a page reload.
- Reset removes the query parameters and restores the complete listing.
- Region filtering uses `projects.location_id -> locations.region_id`; legacy free-text region fields are not used by the filter.

Responsive checks:

| Viewport | Grid columns | Horizontal overflow |
| ---: | ---: | --- |
| 375 px | 1 | None |
| 768 px | 2 | None |
| 1024 px | 3 | None |
| 1440 px | 3 | None |

Browser console errors: none.

## Automated verification

- Frontend lint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Production build: passed.
- Backend tests: 115 passed, 508 assertions.
- Focused regression tests: 12 passed, 60 assertions.
- Laravel route list: passed, 142 routes.
- Git whitespace check: passed before staging.

Known non-blocking warnings:

- Next.js cache payload warnings for large projects/posts API responses.
- Optional OCI/Firebird PHP extensions are not installed; the project does not use those database drivers.
