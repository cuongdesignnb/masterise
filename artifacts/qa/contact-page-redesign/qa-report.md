# QA Report — Dynamic Contact Page Redesign

## Scope

- Public page: `/lien-he`
- Admin editor: `/admin/cai-dat` → `Cấu hình Liên hệ`
- Canonical setting: `contact_page_content`
- Migration: `2026_07_16_000001_create_contact_page_content_setting.php`

## Implemented sections

The public page renders the configured `sectionOrder` and skips disabled or empty sections:

1. Hero
2. Commitments
3. Introduction
4. Sales team
5. Achievements and milestones
6. Contact form and office information
7. Support departments
8. FAQ
9. Final CTA

The Sales team and Achievements sections intentionally start empty and remain hidden until an administrator supplies verified content. No staff names, phone numbers, achievements, or awards were fabricated.

## Admin verification

- One editor with ten sub-tabs and one save action.
- Section enable/disable and move up/down controls.
- Repeater add, edit, active toggle, move, and confirmed delete controls.
- Stable IDs are retained across edits and checked for duplicates by the backend.
- Media Library selection works without clearing unsaved form state.
- Unsaved-change banner and browser leave warning are present.
- Image preview and public-page shortcut are present.
- The editor saves only `contact_page_content`.

## Backend and data safety

- Public settings include normalized `contact_page_content` while private mail/token settings remain excluded.
- Backend validation rejects malformed shapes, raw HTML/script content, unsafe URLs, invalid emails, unknown icons, and duplicate stable IDs.
- Existing `contact_departments` data is normalized into the new structure when the canonical setting does not exist.
- Migration and seeder create the canonical setting only when absent; existing administrator content is never overwritten.
- Empty repeater rows are removed during normalization.

## Public data flow and SEO

- `/lien-he` fetches public settings on the server and passes normalized initial data to the client; no fallback-to-API layout jump occurs.
- Metadata, Open Graph values, Organization/ContactPage data, and FAQ schema use the same dynamic setting source.
- Current QA schema exposes hotline `028 39 159 159` through the Organization contact point and contains the same three enabled FAQs as the UI.
- The legacy hardcoded hotline `1900-988-998` is absent.
- Exactly one `GlobalContactForm` is rendered with `leadSourcePosition="contact_page_form"`; its existing validation, tracking, and lead submission handler are retained.

## Browser QA

- Desktop 1440 px: pass; no horizontal overflow.
- Tablet 1024 px: pass; no horizontal overflow.
- Tablet 768 px: pass; viewport/content widths 762/762 px.
- Mobile 375 px: pass; viewport/content widths 370/370 px, 36 px H1, full-width CTA layout.
- Section visibility and ordering: pass after toggling/reordering against temporary local content, then restoring the exact original setting.
- Empty Sales team and Achievements: hidden on public page.
- FAQ buttons expose `aria-expanded`; expansion and answer visibility pass.
- Form count: 1.
- Console errors: none.
- Hydration errors: none observed.
- Temporary Media Library QA record and temporary settings backup were removed after verification.

## Automated checks

- Frontend lint: pass (`npm run lint -- --quiet`).
- TypeScript: pass (`npx tsc --noEmit`).
- Production build: pass (`npm run build`), 43 pages generated; `/lien-he` is server-rendered dynamically.
- Backend focused contact tests: 8 passed, 21 assertions.
- Backend full test suite: 123 passed, 529 assertions.
- Laravel routes: 142.
- `git diff --check`: pass before staging.

Known non-blocking warning: the posts API response is approximately 32.3 MB and exceeds Next.js's 2 MB data-cache item limit. The cache mechanism was not changed in this task.

## QA evidence

- `contact-desktop-1440.png`
- `contact-tablet-768.png`
- `contact-mobile-375.png`
- `contact-commitments.png`
- `contact-sales-team.png`
- `contact-achievements.png`
- `admin-contact-settings.png`
- `admin-contact-sales-editor.png`
