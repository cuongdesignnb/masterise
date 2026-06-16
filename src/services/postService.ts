import { api } from '@/lib/api';

export const postService = {
  async getPosts(params?: { limit?: number; featured?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.featured) searchParams.append('featured', '1');
    const query = searchParams.toString();
    return api.get(`/posts${query ? `?${query}` : ''}`);
  },
  async getFeaturedPosts() {
    return api.get('/posts/featured');
  },
};
