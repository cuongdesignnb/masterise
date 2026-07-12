import { api } from '@/lib/api';
import { Project as ApiProject, RegionOption } from '@/types/api';
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

  getFeaturedProjects: async (params?: Record<string, string>): Promise<ApiProject[]> => {
    let endpoint = '/projects/featured';
    if (params) {
      const query = new URLSearchParams(params).toString();
      endpoint += `?${query}`;
    }
    const response = await api.get<ApiProject[]>(endpoint);
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

  getRegions: async (): Promise<RegionOption[]> => {
    const response = await api.get<RegionOption[]>('/projects/regions');
    return unwrapData<RegionOption[]>(response) || [];
  },
};
