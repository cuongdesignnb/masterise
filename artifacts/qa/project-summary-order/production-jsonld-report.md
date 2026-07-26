# Project summary order & production structured-data audit

## Local UI verification

- Branch baseline: `main` at `c527919750b2cf416e8f3df424ff511e0c2ea531`.
- Quick summary renders once in a semantic `<section aria-labelledby="project-quick-summary-title">`.
- The visible label `Tóm tắt nhanh cho AI & người đọc` is absent.
- The summary section follows the lower project content flow and precedes `#project-consult-form`.
- Runtime checks at the local project route reported one H1 and no horizontal overflow at 375px, 768px and 1440px viewports.
- Screenshots: `bottom-section-375.png`, `bottom-section-768.png`, `bottom-section-1440.png`.

## Production JSON-LD audit (read-only)

The live inspector fetched each page with both a browser user-agent and Googlebot user-agent. All selected pages returned HTTP 200, an index/follow robots policy, one JSON-LD script, and no duplicate or dangling `@id` references.

| Page | Observed JSON-LD types |
| --- | --- |
| `/` | `WebSite`, `WebPage`, `FAQPage` |
| `/lumiere-orient-pearl` | `WebSite`, `WebPage`, `BreadcrumbList`, `Place`, `Residence`, `FAQPage` |
| `/bang-gia-chinh-sach-ban-hang-phan-khu-the-bloom-lumiere-hanoi-seasons-garden-moi-nhat-2026` | `WebSite`, `WebPage`, `BreadcrumbList`, `NewsArticle` |

The old `/hanoi-seasons-garden` URL returned 404/noindex and was not used as a published-project fixture. Production did not expose an eligible video watch URL in `video-sitemap.xml` or `sitemap.xml`; video schema is therefore classified `DATA_INELIGIBLE`, not fabricated.

`site_entity.enabled` and all sensitive SEO/review/event/job/product feature flags remain `false`; the absence of `Organization`, Product, Review, Event and JobPosting nodes is intentional. The authoritative deployed Git SHA could not be verified without SSH access and is classified `UNKNOWN`.

## Scope note

No schema-producing code was changed. `scripts/inspect-live-jsonld.mjs` and `tests/projectSummarySchema.test.mjs` provide repeatable inspection/regression coverage for the UI move and schema boundary.
