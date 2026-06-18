import { api } from '@/lib/api';
import { ApiResponse, Lead } from '@/types/api';

export interface SubmitLeadPayload {
  name: string;
  phone: string;
  email?: string;
  type?: 'contact' | 'consultation' | 'download_brochure' | 'newsletter';
  message?: string;
  project_id?: number;
  demand_type?: string;
  budget_range?: string;
  product_type?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referrer?: string;
  visitor_id?: string;
  lead_source_position?: string;
  website_url?: string;
  vr_scene_title?: string;
  vr_hotspot_title?: string;
}

export const leadService = {
  submitLead: async (payload: SubmitLeadPayload): Promise<ApiResponse<Lead>> => {
    return api.post<Lead>('/leads', payload);
  },
};
