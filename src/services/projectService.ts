import { api } from '@/lib/api';
import { ApiResponse, Project as ApiProject } from '@/types/api';
import { unwrapData } from '@/adapters/apiResponseAdapter';

export const projectService = {
  getProjects: async (params?: Record<string, string>): Promise<ApiProject[]> => {
    let endpoint = '/projects';
    if (params) {
      const query = new URLSearchParams(params).toString();
      endpoint += `?${query}`;
    }
    const response = await api.get<ApiProject[]>(endpoint);
    return unwrapData<ApiProject[]>(response) || [];
  },

  getFeaturedProjects: async (): Promise<ApiProject[]> => {
    const response = await api.get<ApiProject[]>('/projects/featured');
    return unwrapData<ApiProject[]>(response) || [];
  },

  getProjectBySlug: async (slug: string): Promise<ApiProject | null> => {
    try {
      const response = await api.get<ApiProject>(`/projects/${slug}`);
      return unwrapData<ApiProject>(response);
    } catch (e) {
      console.error(`Error fetching project by slug ${slug}:`, e);
      return null;
    }
  },
};
