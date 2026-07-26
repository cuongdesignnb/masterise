# Project typography QA — PR #3

Date: 2026-07-24

## Environment and fixture isolation

- Branch: `feat/project-typography-scale`
- Verified source SHA before this QA fix: `fb8d3af5119afc46bb0a2102870100b356688ae1`
- Local URL: `http://localhost:8746/typography-full-data`
- Local API: `http://127.0.0.1:8747/api/v1`
- Fixture: `typography-full-data` (local-only project record)
- Fixture creation used `LocalTypographyQaSeeder`, guarded against `production` and not called by `DatabaseSeeder`.
- No production seeder, API, sitemap, or production record was changed.

## Computed styles

Values are `font-size / line-height`; viewport sizes are the actual browser sizes (768px rounds to 1025px high and 1440px rounds to 1439px wide).

| Requested viewport | Actual viewport | H1 count | H1 | H2 (15 rendered) | FAQ question / answer | Pricing table header / cell | Policy / floor-plan title | Review body | Rich paragraph | Form input | Document overflow |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 375×812 | 375×812 | 1 | 36 / 38.88px | 26 / 31.2px | 16 / 21.6px · 15 / 24.75px | 14 / 21.7px · 14 / 21.7px | 19 / 24.7px | 15 / 24.75px | 18 / 31.5px | 16 / 24px | Pass |
| 390×844 (regression) | 390×844 | 1 | 36 / 38.88px | 26 / 31.2px | 16 / 21.6px · 15 / 24.75px | 14 / 21.7px · 14 / 21.7px | 19 / 24.7px | 15 / 24.75px | 18 / 31.5px | 16 / 24px | Pass |
| 768×1024 | 768×1025 | 1 | 36 / 38.88px | 26 / 31.2px | 16 / 21.6px · 15 / 24.75px | 14 / 21.7px · 14 / 21.7px | 19 / 24.7px | 15 / 24.75px | 20.25 / 35.4375px | 14 / 20px | Pass |
| 1024×768 (regression) | 1024×768 | 1 | 46.08 / 49.7664px | 26 / 31.2px | 16 / 21.6px · 15 / 24.75px | 14 / 21.7px · 14 / 21.7px | 19 / 24.7px | 15 / 24.75px | 20.25 / 35.4375px | 14 / 20px | Pass |
| 1440×900 | 1439×900 | 1 | 56 / 60.48px | 28.7822 / 34.5387px | 16 / 21.6px · 15 / 24.75px | 14 / 21.7px · 14 / 21.7px | 19 / 24.7px | 15 / 24.75px | 20.25 / 35.4375px | 14 / 20px | Pass |

The pricing table is intentionally horizontally scrollable inside its wrapper on narrow layouts; the document itself remains within the viewport. The scoped `project-pricing-table` class now enforces the required minimum 14px table typography without changing news/rich-content tables.

## Rich-content and full-data coverage

- Exactly one document `h1` is emitted at every target viewport.
- Fifteen project section `h2` elements render with the project section scale.
- Legacy rich HTML `<h1>`, `<h2>`, and `<h3>` normalize to rendered `H3` (19 / 24.7px); legacy `H4` remains `H4` (16 / 20.8px). `legacyRichH1 = 0`.
- The fixture includes long title/subtitle, legacy rich HTML, `ql-size-large`, `ql-size-huge`, 10 FAQ entries, multi-row pricing table, policy cards, four floor-plan items, amenities, two approved reviews, and the consultation form.
- Fresh QA tab console errors: none.

## Required screenshot evidence

Mobile 375×812:

- `375-full-fixture-hero.png`
- `375-full-fixture-overview.png`
- `375-full-fixture-pricing.png`
- `375-full-fixture-faq.png`
- `375-full-fixture-floorplans.png`
- `375-full-fixture-reviews.png`
- `375-full-fixture-contact.png`

Tablet 768×1024:

- `768-full-fixture-overview.png`
- `768-full-fixture-pricing.png`
- `768-full-fixture-floorplans.png`

Desktop 1440×900:

- `1440-full-fixture-hero.png`
- `1440-full-fixture-overview.png`
- `1440-full-fixture-pricing.png`
- `1440-full-fixture-faq-reviews.png`

All files are local QA artifacts under `artifacts/qa/project-typography/`; the temporary fixture and screenshots are not production data.
