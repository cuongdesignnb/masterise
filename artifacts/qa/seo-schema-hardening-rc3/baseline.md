# SEO & Schema Hardening RC3 — Baseline

- Captured at: `2026-07-22T00:12:36+07:00`
- Repository: `cuongdesignnb/masterise`
- Branch: `chore/seo-schema-hardening`
- Starting SHA: `ed75d58b6aa59f7a6aab75663e6030a0f3c513eb`
- Remote branch SHA: `ed75d58b6aa59f7a6aab75663e6030a0f3c513eb`
- Difference from `origin/main`: 9 commits ahead, 0 behind
- Current RC2 tag: `seo-schema-rc2-20260721-234700`
- Codex safety tag: `backup-seo-schema-before-codex-20260722-000555`

## Existing working-tree state preserved

- Modified: `SEO_SCHEMA_BA_REVIEW_REPORT.md`
- Modified: `artifacts/qa/seo-schema-hardening/test-logs/seo-smoke.log`
- Deleted: `scripts/generate-assets.js`
- Untracked: `SEO_SCHEMA_AUDIT_AGENT_PLAN_MASTERISE.md`
- Untracked: `SEO_SCHEMA_IMPLEMENTATION_PLAN_V2.md`
- Untracked: `artifacts/qa/seo-schema-hardening/pushed-commit-sha.txt`

These files existed before the RC3 implementation began and were not reset.

## Baseline checks

- `npm run lint`: exit 0, 430 warnings, 0 errors.
- `npx tsc --noEmit`: exit 0.
- Existing RC2 `seo-smoke.log`: 11 passed, 1 failed; not accepted as RC3 evidence.
- Backend migration/tests: not run at baseline.
- Asset validation: not available at baseline.
- Docker stack was found running and was stopped with `docker compose down` because QA was not in progress.

## Known blockers confirmed from source

- Smoke test checks raw substrings instead of parsing HTML and JSON-LD.
- SEO image generators create single-colour placeholders; `og-default.jpg` contains PNG bytes.
- Public review resource exposes moderation/internal fields.
- Project detail review contract is inconsistent and frontend uses `as any`.
- Admin review dashboard uses unauthenticated relative `fetch` calls.
- Public review submission is on by default and lacks the complete abuse-control contract.
- Schema feature flags are not wired to route emission.
- Metadata helper returns the old title value and does not consistently reuse the rendered title.
- Local JSON-LD references can point to an omitted operator node.
- Investment and careers ItemLists contain fabricated fallback items.
- Event and JobPosting builders/pages fabricate missing eligibility fields.
- Sitemap fabricates `lastModified` using the current time.
