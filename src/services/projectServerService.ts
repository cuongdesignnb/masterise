/**
 * Server-safe fetching for project details.
 * Used exclusively in server-side metadata generation and server components
 * where window or localStorage are not available.
 */
export async function getProjectForSEO(slug: string) {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747/api/v1';
  
  // When running on the server inside a Docker environment, 'localhost:8747' is not accessible.
  // We rewrite 'localhost:8747' to the internal container host 'mh_nginx' for server-side fetches.
  if (typeof window === 'undefined') {
    apiUrl = apiUrl.replace('localhost:8747', 'mh_nginx');
  }
  
  try {
    const res = await fetch(`${apiUrl}/projects/${slug}`, {
      next: { revalidate: 60 }, // Cache response for 60 seconds
    });
    
    if (!res.ok) {
      return null;
    }
    
    const json = await res.json();
    const data = json?.data;
    if (data && typeof data === 'object' && 'project' in data) {
      return data.project;
    }
    return data ?? null;
  } catch (error) {
    console.error(`Error in getProjectForSEO for slug ${slug}:`, error);
    return null;
  }
}
