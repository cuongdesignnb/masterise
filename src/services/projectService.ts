import { api } from '@/lib/api';
import { ApiResponse, Project as ApiProject, ProjectCategoryOption, ProjectOption, ProjectStatusOption, RegionOption } from '@/types/api';
import { unwrapData } from '@/adapters/apiResponseAdapter';

export const projectService = {
  getProjects: async (params?: Record<string, string>): Promise<ApiProject[]> => {
    const response = await projectService.getProjectPage(params);
    return response.data || [];
  },

  getProjectPage: async (params?: Record<string, string>): Promise<ApiResponse<ApiProject[]>> => {
    let endpoint = '/projects';
    if (params) {
      const query = new URLSearchParams(params).toString();
      endpoint += `?${query}`;
    }
    return api.get<ApiProject[]>(endpoint);
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
    const response = await api.get<RegionOption[]>('/projects/regions');
    return unwrapData<RegionOption[]>(response) || [];
  },

  getProjectStatuses: async (): Promise<ProjectStatusOption[]> => {
    const response = await api.get<ProjectStatusOption[]>('/project-statuses?active=true&with_count=true');
    return (unwrapData<ProjectStatusOption[]>(response) || [])
      .filter((status) => status.is_active && status.projects_count > 0);
  },

  getProjectOptions: async (): Promise<ProjectOption[]> => {
    const response = await api.get<ProjectOption[]>('/projects/options');
    return unwrapData<ProjectOption[]>(response) || [];
  },
};
