import { SiteEntityConfig, validateSiteEntity } from '@/config/siteEntity';

function getServerApiUrl() {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747/api/v1';

  if (typeof window === 'undefined') {
    apiUrl = apiUrl.replace('localhost:8747', 'mh_nginx');
  }

  return apiUrl;
}

export const FALLBACK_SITE_ENTITY: SiteEntityConfig = {
  enabled: false,
  type: 'Organization',
  name: 'Masterise Homes',
  url: 'https://masterise-homes.net.vn',
  sameAs: [],
};

export async function getSiteEntityConfig(): Promise<SiteEntityConfig> {
  try {
    const apiUrl = getServerApiUrl();
    const res = await fetch(`${apiUrl}/settings/public`, {
      next: { revalidate: 60, tags: ['settings'] },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) return FALLBACK_SITE_ENTITY;

    const json = await res.json();
    const rawEntity = json?.data?.site_entity;

    if (!rawEntity) return FALLBACK_SITE_ENTITY;

    const parsed = typeof rawEntity === 'string' ? JSON.parse(rawEntity) : rawEntity;
    const validated = validateSiteEntity(parsed);

    if (!validated || json?.data?.seo_site_entity_enabled !== true) {
      return FALLBACK_SITE_ENTITY;
    }

    return validated;
  } catch (error) {
    console.error('Error in getSiteEntityConfig:', error);
    return FALLBACK_SITE_ENTITY;
  }
}
