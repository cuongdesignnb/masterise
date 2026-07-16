import { api } from '@/lib/api';
import type { CareerApplication, CareerJob, CareerOptions, CareerSettingsPayload } from '@/types/career';

function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '') query.set(key, String(value)); });
  return query.toString();
}

export const careerService = {
  jobs: (params: Record<string, string | number | undefined> = {}) => api.get<CareerJob[]>(`/career/jobs?${queryString(params)}`),
  job: (slug: string) => api.get<{ job: CareerJob; related: CareerJob[] }>(`/career/jobs/${slug}`),
  options: () => api.get<CareerOptions>('/career/options'),
  apply: (jobId: number, data: FormData) => api.post<{ application_code: string; confirmation_email_queued: boolean }>(`/career/jobs/${jobId}/apply`, data),
  applyGeneral: (data: FormData) => api.post<{ application_code: string; confirmation_email_queued: boolean }>('/career/apply-general', data),
  adminJobs: (params: Record<string, string | number | undefined> = {}) => api.get<CareerJob[]>(`/admin/career/jobs?${queryString(params)}`),
  adminJob: (id: number) => api.get<CareerJob>(`/admin/career/jobs/${id}`),
  saveJob: (data: Partial<CareerJob>) => data.id ? api.put<CareerJob>(`/admin/career/jobs/${data.id}`, data) : api.post<CareerJob>('/admin/career/jobs', data),
  deleteJob: (id: number) => api.delete(`/admin/career/jobs/${id}`),
  applications: (params: Record<string, string | number | undefined> = {}) => api.get<CareerApplication[]>(`/admin/career/applications?${queryString(params)}`),
  application: (id: number) => api.get<CareerApplication>(`/admin/career/applications/${id}`),
  updateApplication: (id: number, data: { status: string; note?: string; send_email?: boolean }) => api.patch<CareerApplication>(`/admin/career/applications/${id}`, data),
  resendEmail: (id: number) => api.post(`/admin/career/applications/${id}/resend-email`),
  settings: () => api.get<CareerSettingsPayload>('/admin/career/settings'),
  saveSettings: (data: CareerSettingsPayload) => api.put<CareerSettingsPayload>('/admin/career/settings', data),
};
