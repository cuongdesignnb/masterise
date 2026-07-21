import 'server-only';

import { parseSeoFeatureFlags, SAFE_SEO_FEATURE_FLAGS, type SeoFeatureFlags } from '@/config/seoFeatureFlags';
import { getServerApiUrl } from '@/lib/serverApi';

export async function getSeoFeatureFlags(): Promise<SeoFeatureFlags> {
  try {
    const response = await fetch(`${getServerApiUrl()}/settings/public`, {
      next: { revalidate: 60, tags: ['settings', 'seo-feature-flags'] },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return SAFE_SEO_FEATURE_FLAGS;

    const payload = await response.json();
    return parseSeoFeatureFlags(payload?.data);
  } catch {
    return SAFE_SEO_FEATURE_FLAGS;
  }
}
