/**
 * Server-safe fetching for project details.
 * Used exclusively in server-side metadata generation and server components
 * where window or localStorage are not available.
 */
import type { Project } from '@/types/api';

export async function getProjectForSEO(slug: string): Promise<Project | null> {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747/api/v1';
  
  // When running on the server inside a Docker environment, 'localhost:8747' is not accessible.
  // We rewrite 'localhost:8747' to the internal container host 'mh_nginx' for server-side fetches.
  if (typeof window === 'undefined') {
    apiUrl = apiUrl.replace('localhost:8747', 'mh_nginx');
  }
  
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
