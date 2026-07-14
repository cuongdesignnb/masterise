# QA report: Project price normalization and filter

Date: 2026-07-14
Environment: local Docker (`D:\BDS`)

## Root cause and final convention

- The old client sent hard-coded VND/m² values through `price_min` and `price_max` while the labels described total prices in billions.
- The backend applied an overlap filter to those mixed fields, so a project could match unrelated ranges.
- `price_min` and `price_max` now store total product prices in VND. The public filter and price sorting use `price_min` only.
- `price_per_sqm_min` and `price_per_sqm_max` store VND/m² and never participate in the project-level total-price filter.
- `price_text` is display-only. `price_rows` is detail-only. `schema_price` is SEO-only and falls back to `price_min` when omitted.

## Local data mapping

| Project slug | Total min (VND) | Total max | Price/m² min (VND) | Price/m² max (VND) | Evidence |
| --- | ---: | --- | ---: | ---: | --- |
| `the-global-city` | 8,900,000,000 | null | 100,000,000 | 150,000,000 | `Từ 8,9 tỷ/căn` + legacy fields |
| `masteri-centre-point` | 5,500,000,000 | null | 60,000,000 | 80,000,000 | `Từ 5,5 tỷ/căn` + legacy fields |
| `grand-marina-saigon` | 25,000,000,000 | null | 350,000,000 | 450,000,000 | `Từ 25,0 tỷ/căn` + legacy fields |
| `lumiere-boulevard` | 5,500,000,000 | null | 50,000,000 | 70,000,000 | Current `Tu 5,5 ty/can` + legacy fields |
| `masteri-waterfront` | 4,800,000,000 | null | 55,000,000 | 75,000,000 | `Từ 4,8 tỷ/căn` + legacy fields |
| `masterise-grand-view` | 6,800,000,000 | null | null | null | `Tu 6,8 ty/can` |
| `masterise-central-point` | 7,200,000,000 | null | null | null | `Tu 7,2 ty/can` |
| `masterise-riverside` | 8,500,000,000 | null | null | null | `Tu 8,5 ty/can` |
| `lumiere-riverside` | 7,900,000,000 | null | null | null | `Tu 7,9 ty/can` |
| `lumiere-midtown` | null | null | null | null | `Dang cap nhat`; no price inferred |

No maximum total price was inferred where no explicit source existed.

## API results after local migration

| Query | Total | Slugs |
| --- | ---: | --- |
| `price_range=under-5` | 1 | `masteri-waterfront` |
| `price_range=5-10` | 7 | `the-global-city`, `masteri-centre-point`, `lumiere-boulevard`, `masterise-grand-view`, `masterise-central-point`, `masterise-riverside`, `lumiere-riverside` |
| `price_range=10-20` | 0 | none |
| `price_range=20-50` | 1 | `grand-marina-saigon` |
| `price_range=above-50` | 0 | none |
| `category=can-ho-cao-cap&price_range=5-10` | 7 | same seven apartment projects in the 5–10 range |
| `project_status=selling&price_range=10-20` | 0 | none in current local data |

The no-price project remains in the unfiltered list and is absent from every specific price range.

## Automated checks

- Price regression suite: 19 tests, 50 assertions — pass.
- Full backend suite: 98 tests, 416 assertions — pass.
- Frontend lint (`npm run lint -- --quiet`) — pass.
- TypeScript (`npx tsc --noEmit`) — pass.
- Production build (`npm run build`) — pass; 43/43 pages generated.
- Laravel routes: 137 total; project routes listed successfully.
- Local migration `2026_07_14_000013_normalize_project_prices` — pass.

Build warnings about API payloads exceeding the 2 MB Next.js data-cache limit were recorded and are not treated as failures.

## Browser QA note

The in-app browser runtime failed before navigation with `Cannot redefine property: process`. Therefore this report does not claim visual-console or request-loop verification from that tool. Query behavior was verified against the local HTTP API, and the client code path was verified by lint, TypeScript, and the production build.
