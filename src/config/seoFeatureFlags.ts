export const SEO_FEATURE_FLAG_KEYS = [
  'seo_site_entity_enabled',
  'seo_project_product_schema_enabled',
  'seo_project_review_schema_enabled',
  'seo_event_schema_enabled',
  'seo_job_schema_enabled',
  'public_project_review_submission_enabled',
] as const;

export type SeoFeatureFlagKey = (typeof SEO_FEATURE_FLAG_KEYS)[number];

export interface SeoFeatureFlags {
  siteEntity: boolean;
  projectProductSchema: boolean;
  projectReviewSchema: boolean;
  eventSchema: boolean;
  jobSchema: boolean;
  publicProjectReviewSubmission: boolean;
}

export const SAFE_SEO_FEATURE_FLAGS: SeoFeatureFlags = {
  siteEntity: false,
  projectProductSchema: false,
  projectReviewSchema: false,
  eventSchema: false,
  jobSchema: false,
  publicProjectReviewSubmission: false,
};

export function parseSeoFeatureFlags(data: unknown): SeoFeatureFlags {
  const raw = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  return {
    siteEntity: raw.seo_site_entity_enabled === true,
    projectProductSchema: raw.seo_project_product_schema_enabled === true,
    projectReviewSchema: raw.seo_project_review_schema_enabled === true,
    eventSchema: raw.seo_event_schema_enabled === true,
    jobSchema: raw.seo_job_schema_enabled === true,
    publicProjectReviewSubmission: raw.public_project_review_submission_enabled === true,
  };
}
