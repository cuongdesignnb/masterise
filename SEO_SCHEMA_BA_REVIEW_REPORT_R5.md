# SEO & Schema Hardening - Round 5 Graph Integrity Verification

> Authoritative Round 5 corrective report. RC4 is superseded because graph integrity validation missed production-origin dangling `@id` references.

## Scope and Git traceability

- Repository: `cuongdesignnb/masterise`
- Pull request: `#1`
- Base branch: `main`
- Feature branch: `chore/seo-schema-hardening`
- Reviewed RC4 SHA: `72c69a1c90c8db3a9361549d9cfee0d3de62d094`
- Reviewed RC4 tag: `seo-schema-rc4-20260722-085111`
- Round 5 corrective commit and final RC5 CI SHA: recorded in the pull-request body after CI completes.
- Immutable RC5 tag: recorded in the pull-request body after CI completes.

No merge, push to `main`, force-push, production deployment, or production migration is part of this verification.

## Round 5 blocker resolution

The graph integrity issue is resolved by:

- making `buildWebPageNode()` accept optional `aboutId` and `breadcrumbId`;
- emitting `about` only when the target node exists;
- emitting `breadcrumb` only when the page graph includes a matching `BreadcrumbList`;
- leaving homepage WebPage without a breadcrumb reference because the homepage graph has no BreadcrumbList;
- calculating career job eligibility before building WebPage and passing `#job` only when JobPosting will be emitted;
- rewriting graph validation to use the rendered canonical origin instead of the local HTTP test-server origin.

## Canonical-origin graph validation

The SEO smoke validator now:

- collects top-level graph node `@id` values as definitions;
- walks nested properties and collects nested `@id` values as references;
- ignores each node's own top-level `@id`;
- treats IDs sharing the rendered canonical origin as local;
- requires every local reference to exist in the definition set;
- reports the referencing node and property path on failure.

This catches production-origin dangling references even when CI fetches pages from localhost.

## Regression coverage

`npm run test:seo:schema` now includes:

- homepage without BreadcrumbList has no breadcrumb reference;
- job schema disabled has no `#job` reference;
- ineligible job has no `#job` reference;
- eligible job with flag enabled has `#job` reference and matching JobPosting node;
- production-origin dangling `@id` fails while fetched from localhost;
- matching production-origin reference passes;
- all previous Offer availability regressions from Round 4.

## Local verification

Local verification performed without Docker:

- `npm ci --cache C:\tmp\bds-npm-cache-rc5-elevated --no-audit --no-fund`: pass with existing Node engine warning.
- `npm run lint`: pass with 0 errors and 406 existing warnings.
- `npx tsc --noEmit`: pass.
- `npm run test:seo:schema`: pass, 14/14 tests.
- `npm run test:seo:assets`: pass; HTTP checks skipped because no local base URL was provided.
- `npm run build`: pass on Next.js 16.2.7 with the existing ImageResponse `z-index` warning.
- `php artisan test`: pass, 191 tests and 892 assertions.

Docker was not required for this local verification and remained off.

The first unelevated `npm ci` attempts failed because the Windows user npm cache was inaccessible from the sandbox and the npm CLI later hit its own `Exit handler never called` error. A final elevated `npm ci` with a temporary cache restored `node_modules` successfully.

## Final CI requirement

After this corrective commit is pushed, both workflow triggers must pass again at the final RC5 SHA:

- push workflow: frontend, backend, integration-smoke;
- pull_request workflow: frontend, backend, integration-smoke.

The final run IDs and URLs are recorded in the PR body after CI completes.

## Feature flag gates

Keep these values `false` during the initial deployment:

- `seo_site_entity_enabled`
- `seo_project_product_schema_enabled`
- `seo_project_review_schema_enabled`
- `seo_event_schema_enabled`
- `seo_job_schema_enabled`
- `public_project_review_submission_enabled`

Before enabling JobPosting or Review schema, seed deterministic fixtures, run `SEO_SMOKE_STRICT=1`, and require zero skips for enabled schema types.

Production must explicitly review `SEO_SITEMAP_STRICT`, `SEO_SITEMAP_MIN_DYNAMIC_URLS`, and `SEO_SITEMAP_EXPECTED_DYNAMIC_URLS`. Configure the Next revalidation secret consistently between Laravel and Next.js.

## Deployment recommendation

Do not deploy from this local review. After code review and BA approval, use:

```bash
DEPLOY_BRANCH=main bash deploy-production.sh
```

Pre-deploy gates:

1. Database backup created and restore verification completed.
2. Current production SHA recorded.
3. Brand/operator approval completed.
4. Sensitive schema and public-review flags confirmed `false`.
5. Migration reviewed successfully on staging.
6. Rollback owner assigned.
7. Sitemap production configuration reviewed.
8. Next revalidation secret configured consistently.

Do not enable entity, Product, Review, Event, or Job schema during the initial deployment.

## Non-blocking backlog

- 406 existing lint warnings.
- Existing npm dependency advisories.
- Existing Node engine warning for `eslint-visitor-keys` on local Node 20.15.1.
- Neutral artwork pending brand approval.
- ImageResponse `z-index` warning.
- GitHub Actions Node.js 20 deprecation annotation.

Do not run `npm audit fix --force` in this pull request. Track these separately.
