import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  seo_meta?: {
    id: number;
    title: string | null;
    description: string | null;
    keywords: string | null;
    path: string | null;
  };
}

export const pageService = {
  async getPages(params?: {
    page?: number;
    per_page?: number;
    q?: string;
    status?: string;
  }): Promise<ApiResponse<StaticPage[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.per_page) searchParams.append('per_page', String(params.per_page));
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    return api.get<StaticPage[]>(`/admin/pages${query ? `?${query}` : ''}`);
  },

  async getPageBySlugOrId(slugOrId: string | number): Promise<ApiResponse<StaticPage>> {
    return api.get<StaticPage>(`/admin/pages/${slugOrId}`);
  },

  async createPage(data: {
    title: string;
    slug: string;
    content?: string;
    status: 'draft' | 'published';
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
  }): Promise<ApiResponse<StaticPage>> {
    return api.post<StaticPage>('/pages', data);
  },

  async updatePage(
    id: number,
    data: {
      title: string;
      slug: string;
      content?: string;
      status: 'draft' | 'published';
      seo_title?: string;
      seo_description?: string;
      seo_keywords?: string;
    }
  ): Promise<ApiResponse<StaticPage>> {
    return api.put<StaticPage>(`/pages/${id}`, data);
  },

  async deletePage(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/pages/${id}`);
  },
};
