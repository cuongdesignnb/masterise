import { api } from '@/lib/api';

export const postService = {
  async getPosts(params?: {
    limit?: number;
    per_page?: number;
    page?: number;
    featured?: boolean;
    post_type?: string;
    category?: string;
    status?: string;
    q?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.per_page) searchParams.append('per_page', String(params.per_page));
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.featured) searchParams.append('featured', '1');
    if (params?.post_type) searchParams.append('post_type', params.post_type);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    const query = searchParams.toString();
    return api.get(`/posts${query ? `?${query}` : ''}`);
  },
  async getFeaturedPosts(params?: { limit?: number; post_type?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.post_type) searchParams.append('post_type', params.post_type);
    const query = searchParams.toString();
    return api.get(`/posts/featured${query ? `?${query}` : ''}`);
  },
  async getPostBySlug(slug: string) {
    return api.get(`/posts/${slug}`);
  },
};
