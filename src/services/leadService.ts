import { api } from '@/lib/api';
import { ApiResponse, Lead } from '@/types/api';

export interface SubmitLeadPayload {
  name: string;
  phone: string;
  email?: string;
  type?: 'contact' | 'consultation' | 'download_brochure' | 'newsletter';
  message?: string;
  project_id?: number;
  visitor_id?: string;
  lead_source_position?: string;
  vr_scene_title?: string;
  vr_hotspot_title?: string;
}

export const leadService = {
  submitLead: async (payload: SubmitLeadPayload): Promise<ApiResponse<Lead>> => {
    return api.post<Lead>('/leads', payload);
  },
};
