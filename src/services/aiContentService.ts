import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { AiSettingsPublic, AiContentBatch, AiJob } from '@/types/aiContent';
import { Post } from '@/types/api';

export const aiContentService = {
  // Settings API
  getAiSettings: async (): Promise<ApiResponse<AiSettingsPublic>> => {
    return api.get<AiSettingsPublic>('/admin/ai-content/settings');
  },

  updateAiSettings: async (payload: Partial<AiSettingsPublic>): Promise<ApiResponse<void>> => {
    return api.post<void>('/admin/ai-content/settings', payload);
  },

  testAiConnection: async (payload: {
    openai_api_key?: string;
    openai_base_url?: string;
    openai_wire_api?: 'chat_completions' | 'responses';
    openai_model?: string;
    openai_reasoning_effort?: 'minimal' | 'low' | 'medium' | 'high';
    openai_max_tokens?: number;
    ai_openai_api_key?: string;
    ai_text_model?: string;
  }): Promise<ApiResponse<void>> => {
    return api.post<void>('/admin/ai-content/settings/test-connection', payload);
  },

  // Single Article API
  generateArticle: async (payload: {
    title: string;
    post_category_id: number;
    author_id?: number | null;
    tone?: string;
    article_length?: string;
    enable_image_generation: boolean;
    image_size?: string;
    image_quality?: string;
  }): Promise<ApiResponse<Post & { image_error?: boolean }>> => {
    return api.post<Post & { image_error?: boolean }>('/admin/ai-content/generate-article', payload);
  },

  regenerateImage: async (postId: number): Promise<ApiResponse<{ thumbnail: string }>> => {
    return api.post<{ thumbnail: string }>(`/admin/ai-content/posts/${postId}/regenerate-image`);
  },

  // Drafts & Scheduling API
  getAiDrafts: async (params?: { q?: string; page?: number; per_page?: number }): Promise<ApiResponse<Post[]>> => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    
    return api.get<Post[]>(`/admin/ai-content/drafts?${query.toString()}`);
  },

  schedulePost: async (postId: number, payload: { scheduled_at: string }): Promise<ApiResponse<Post>> => {
    return api.patch<Post>(`/admin/ai-content/posts/${postId}/schedule`, payload);
  },

  publishPostNow: async (postId: number): Promise<ApiResponse<Post>> => {
    return api.post<Post>(`/admin/ai-content/posts/${postId}/publish-now`);
  },

  publishDuePosts: async (): Promise<ApiResponse<{ details: string }>> => {
    return api.post<{ details: string }>('/admin/ai-content/posts/publish-due');
  },

  // Bulk Batch API
  createBulkBatch: async (payload: {
    title: string;
    keywords: string;
    default_category_id: number;
    default_author_id?: number | null;
    enable_image_generation: boolean;
    image_size?: string;
    image_quality?: string;
  }): Promise<ApiResponse<AiContentBatch>> => {
    return api.post<AiContentBatch>('/admin/ai-content/batches', payload);
  },

  getBatches: async (params?: { page?: number; per_page?: number }): Promise<ApiResponse<AiContentBatch[]>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    
    return api.get<AiContentBatch[]>(`/admin/ai-content/batches?${query.toString()}`);
  },

  getBatchDetail: async (batchId: number): Promise<ApiResponse<{ batch: AiContentBatch; jobs: AiJob[] }>> => {
    return api.get<{ batch: AiContentBatch; jobs: AiJob[] }>(`/admin/ai-content/batches/${batchId}`);
  },

  cancelBatch: async (batchId: number): Promise<ApiResponse<void>> => {
    return api.post<void>(`/admin/ai-content/batches/${batchId}/cancel`);
  },

  scheduleBatch: async (batchId: number, payload: {
    schedule_start_at: string;
    schedule_interval_minutes: number;
    posts_per_slot?: number;
  }): Promise<ApiResponse<void>> => {
    return api.post<void>(`/admin/ai-content/batches/${batchId}/schedule`, payload);
  },

  // Jobs History API
  getAiJobs: async (params?: { status?: string; page?: number; per_page?: number }): Promise<ApiResponse<AiJob[]>> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    
    return api.get<AiJob[]>(`/admin/ai-content/jobs?${query.toString()}`);
  },
};
