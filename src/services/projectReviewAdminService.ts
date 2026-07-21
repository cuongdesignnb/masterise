import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { AdminProjectReview } from '@/types/project-review';

export interface ProjectReviewAdminFilters {
  status?: 'pending' | 'approved' | 'rejected';
  projectId?: number;
  search?: string;
  perPage?: number;
}

export interface ProjectReviewAdminPayload {
  project_id: number;
  reviewer_name: string;
  reviewer_role?: string;
  rating: number;
  review_body: string;
  reviewed_at?: string;
  source_type?: string;
  source_url?: string;
  is_verified?: boolean;
  is_published?: boolean;
}

function queryString(filters: ProjectReviewAdminFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.projectId) params.set('project_id', String(filters.projectId));
  if (filters.search) params.set('search', filters.search);
  params.set('per_page', String(filters.perPage || 50));
  return params.toString();
}

export const projectReviewAdminService = {
  list: (filters: ProjectReviewAdminFilters = {}): Promise<ApiResponse<AdminProjectReview[]>> =>
    api.get(`/admin/project-reviews?${queryString(filters)}`),
  create: (payload: ProjectReviewAdminPayload) => api.post<AdminProjectReview>('/admin/project-reviews', payload),
  update: (id: number, payload: Partial<ProjectReviewAdminPayload> & { moderation_status?: AdminProjectReview['moderation_status'] }) =>
    api.put<AdminProjectReview>(`/admin/project-reviews/${id}`, payload),
  approve: (id: number) => api.post<AdminProjectReview>(`/admin/project-reviews/${id}/approve`),
  reject: (id: number, reason: string) => api.post<AdminProjectReview>(`/admin/project-reviews/${id}/reject`, { reason }),
  delete: (id: number) => api.delete<void>(`/admin/project-reviews/${id}`),
};
