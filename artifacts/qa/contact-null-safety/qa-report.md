# QA Report - Contact Null Safety

Date: 2026-07-16

## Production reproduction

- Public API checked: `https://api.masterise-homes.net.vn/api/v1/settings/public`.
- Confirmed production `contact_page_content` returned `null` for `seo.ogImage`, `contactForm.hotline`, `email`, `address`, `mapUrl`, `mapEmbedUrl`, `mapImage`, and `directionsUrl`.
- Root cause confirmed in the old frontend flow: shallow section merge allowed those nulls to replace string defaults, then `safeExternalUrl()` called `.trim()` on the null value.

## Automated checks

- Frontend contact helper: 3 tests passed.
- Contact and migration regression: 16 tests, 87 assertions passed.
- Full Laravel suite: 139 tests, 617 assertions passed.
- TypeScript: passed.
- ESLint quiet: passed.
- Next production build: passed, 46 generated pages, 50 application routes listed in build output.
- Laravel routes: 161.
- Mojibake scan: no suspicious UTF-8 corruption sequences found.

## Browser QA

Target: `http://127.0.0.1:8746/lien-he` using the local Laravel API.

| Viewport | Result | Horizontal overflow | Console errors |
| --- | --- | --- | --- |
| 375 x 812 | Passed | No | 0 |
| 768 x 900 | Passed | No | 0 |
| 1024 x 900 | Passed | No | 0 |
| 1440 x 1000 | Passed | No | 0 |

The production-like null fixture was written directly to the local setting, served through the public API, and loaded at 1024px. The page rendered its main content, contact form, and five applicable sections without the error boundary or console errors. The local setting was restored to the canonical default immediately after this check.

## Evidence

- `contact-fixed-1440.png`
- `contact-fixed-375.png`
- `contact-null-payload.png`
- `contact-console-clean.png`
