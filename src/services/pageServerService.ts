import type { StaticPage } from '@/services/pageService';

function getServerApiUrl() {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747/api/v1';

  if (typeof window === 'undefined') {
    apiUrl = apiUrl.replace('localhost:8747', 'mh_nginx');
  }

  return apiUrl;
}

export async function getPageForSEO(slug: string): Promise<StaticPage | null> {
  try {
    const apiUrl = getServerApiUrl();
    const res = await fetch(`${apiUrl}/pages/${slug}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error(`Error in getPageForSEO for slug ${slug}:`, error);
    return null;
  }
}

export async function getPublicPages(): Promise<StaticPage[]> {
  try {
    const apiUrl = getServerApiUrl();
    const res = await fetch(`${apiUrl}/pages?per_page=12`, {
      next: { revalidate: 60 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) return [];

    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    console.error('Error in getPublicPages:', error);
    return [];
  }
}
