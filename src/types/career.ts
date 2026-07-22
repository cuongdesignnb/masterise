export type CareerJobStatus = 'draft' | 'scheduled' | 'published' | 'closed' | 'archived';
export type CareerApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'archived';

export interface CareerJob {
  id: number; title: string; slug: string; code: string; department: string; location: string;
  employment_type: string; employment_type_label: string; workplace_type?: string | null;
  experience_level?: string | null; salary_min?: string | null; salary_max?: string | null;
  salary_currency: string; salary_text?: string | null; vacancies: number; short_description?: string | null;
  description?: string | null; responsibilities?: string | null; requirements?: string | null;
  benefits?: string | null; working_time?: string | null; additional_information?: string | null;
  application_deadline?: string | null; published_at?: string | null; closed_at?: string | null;
  status: CareerJobStatus; status_label: string; is_featured: boolean; is_published: boolean;
  accepting_applications: boolean; sort_order: number; thumbnail?: string | null; banner_image?: string | null;
  seo_title?: string | null; seo_description?: string | null; seo_keywords?: string | null;
  schema_street_address?: string | null; schema_locality?: string | null; schema_region?: string | null;
  schema_postal_code?: string | null; schema_country?: string | null; schema_applicant_country?: string | null;
  schema_salary_unit?: 'MONTH' | 'YEAR' | 'WEEK' | 'DAY' | 'HOUR' | null;
  schema_direct_apply?: boolean;
  applications_count?: number; created_at: string; updated_at: string;
}

export interface CareerPageContent {
  eyebrow?: string; title: string; description?: string; hero_image?: string | null;
  benefits?: Array<{ title: string; description?: string }>;
  process?: string[]; cta_title?: string; cta_description?: string;
  allow_general_application?: boolean; seo_title?: string; seo_description?: string;
}

export interface CareerOptions {
  departments: string[]; locations: string[];
  employment_types: Array<{ value: string; label: string }>;
  page_content: CareerPageContent;
  stats: { open_jobs: number; departments: number; locations: number };
  application_rules?: { cv_required: boolean; cv_max_mb: number; cv_extensions: string[]; privacy_policy_url: string };
}

export interface CareerApplication {
  id: number; application_code: string; career_job_id?: number | null; full_name: string; email: string;
  phone: string; cover_letter?: string | null; linkedin_url?: string | null; portfolio_url?: string | null;
  experience_summary?: string | null; expected_salary?: string | null; available_from?: string | null;
  cv_original_name?: string | null; cv_mime?: string | null; cv_size?: number | null;
  status: CareerApplicationStatus; status_label: string; source: string; admin_notes?: string | null;
  notification_sent_at?: string | null; confirmation_sent_at?: string | null; email_error?: string | null;
  job?: Pick<CareerJob, 'id' | 'title' | 'code'> | null; activities?: CareerActivity[]; created_at: string;
}

export interface CareerActivity {
  id: number; action: string; old_status?: string | null; new_status?: string | null;
  note?: string | null; created_at: string; user?: { id: number; name: string } | null;
}

export interface CareerSettingsPayload {
  page_content: CareerPageContent;
  settings: {
    recipient_emails: string[]; cc_emails: string[]; bcc_emails: string[];
    cv_required: boolean; cv_max_mb: number; cv_extensions: string[]; retention_days: number;
    confirmation_email_enabled: boolean; status_email_enabled: boolean; status_email_events: string[];
    email_signature: string; response_time: string; privacy_policy_url: string;
    departments: string[]; locations: string[];
  };
  job_statuses?: Record<string, string>;
  application_statuses?: Record<string, string>;
}
