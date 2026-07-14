import { api } from '@/lib/api';
import { Project as ApiProject, ProjectCategoryOption, RegionOption } from '@/types/api';
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

  getProjectCategories: async (): Promise<ProjectCategoryOption[]> => {
    const response = await api.get<ProjectCategoryOption[]>('/project-categories');
    return unwrapData<ProjectCategoryOption[]>(response) || [];
  },

  getRegions: async (): Promise<RegionOption[]> => {
    const response = await api.get<Array<{ slug: string; name: string; projects_count: number }>>(
      '/regions?all=true&active=true&with_count=true'
    );
    const regions = unwrapData<Array<{ slug: string; name: string; projects_count: number }>>(response) || [];
    return regions
      .filter((region) => region.projects_count > 0)
      .map((region) => ({
        value: region.slug,
        label: region.name,
        projects_count: region.projects_count,
      }));
  },
};
