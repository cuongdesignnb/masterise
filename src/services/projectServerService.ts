/**
 * Server-safe fetching for project details.
 * Used exclusively in server-side metadata generation and server components
 * where window or localStorage are not available.
 */
import type { Project } from '@/types/api';

type ProjectListResponse = {
  data?: Project[];
  meta?: {
    last_page?: number;
  };
};

function getApiUrl() {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747/api/v1';

  // When running on the server inside a Docker environment, 'localhost:8747' is not accessible.
  // We rewrite 'localhost:8747' to the internal container host 'mh_nginx' for server-side fetches.
  if (typeof window === 'undefined') {
    apiUrl = apiUrl.replace('localhost:8747', 'mh_nginx');
  }

  return apiUrl;
}

export async function getProjectForSEO(slug: string): Promise<Project | null> {
  const apiUrl = getApiUrl();
  
  try {
    const res = await fetch(`${apiUrl}/projects/${slug}`, {
      next: { revalidate: 60, tags: [`project-${slug}`, `project-reviews-${slug}`] },
    });
    
    if (!res.ok) {
      return null;
    }
    
    const json = await res.json();
    const data = json?.data;
    if (data && typeof data === 'object' && 'project' in data) {
      return data.project as Project;
    }
    return (data as Project | null) ?? null;
  } catch (error) {
    console.error(`Error in getProjectForSEO for slug ${slug}:`, error);
    return null;
  }
}

export async function getProjectForVideoSlug(slug: string): Promise<Project | null> {
  const directProject = await getProjectForSEO(slug);
  if (directProject?.video_slug === slug || (!directProject?.video_slug && directProject?.slug === slug)) {
    return directProject;
  }

  const apiUrl = getApiUrl();

  try {
    const first = await fetch(`${apiUrl}/projects?per_page=100&page=1`, {
      next: { revalidate: 300, tags: ['sitemap-content', 'projects'] },
    });

    if (!first.ok) {
      return null;
    }

    const firstJson = (await first.json()) as ProjectListResponse;
    const firstMatch = (firstJson.data || []).find((project) => project.video_slug === slug);
    if (firstMatch) return firstMatch;

    const lastPage = Math.max(1, firstJson.meta?.last_page || 1);
    for (let page = 2; page <= lastPage; page += 1) {
      const res = await fetch(`${apiUrl}/projects?per_page=100&page=${page}`, {
        next: { revalidate: 300, tags: ['sitemap-content', 'projects'] },
      });
      if (!res.ok) continue;
      const json = (await res.json()) as ProjectListResponse;
      const match = (json.data || []).find((project) => project.video_slug === slug);
      if (match) return match;
    }

    return null;
  } catch (error) {
    console.error(`Error in getProjectForVideoSlug for slug ${slug}:`, error);
    return null;
  }
}
