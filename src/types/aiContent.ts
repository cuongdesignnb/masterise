import { PostCategory, User } from './api';

export type AiJobStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type AiBatchStatus =
  | "draft"
  | "queued"
  | "processing"
  | "completed"
  | "partially_failed"
  | "failed"
  | "cancelled";

export interface AiSettingsPublic {
  ai_provider: string;
  api_key_configured: boolean;
  api_key_masked?: string;
  ai_text_model: string;
  ai_image_model: string;
  ai_enable_model_fallback: boolean;
  ai_fallback_text_model?: string;
  ai_fallback_image_model?: string;
  ai_default_language: string;
  ai_default_tone: string;
  ai_default_article_length: string;
  ai_default_image_size: string;
  ai_default_image_quality: string;
  ai_enable_image_generation: boolean;
  ai_max_articles_per_batch: number;
  ai_max_jobs_per_hour: number;
  ai_default_author_id?: number | null;
  ai_default_category_id?: number | null;
  ai_default_post_status: string;
  ai_schedule_timezone: string;
  last_scheduler_run_at?: string | null;
  ai_openai_api_key?: string;
}

export interface AiContentBatch {
  id: number;
  title: string;
  status: AiBatchStatus;
  keywords_count: number;
  generated_count: number;
  failed_count: number;
  progress_percent: number;
  default_category_id?: number | null;
  default_author_id?: number | null;
  schedule_mode?: string | null;
  schedule_start_at?: string | null;
  schedule_interval_minutes?: number | null;
  created_at?: string;
  category?: PostCategory | null;
  author?: User | null;
  creator?: User | null;
}

export interface AiJob {
  id: number;
  type: string;
  status: AiJobStatus;
  input_keywords: string;
  post_id?: number | null;
  error_message?: string | null;
  tokens_input?: number | null;
  tokens_output?: number | null;
  estimated_cost?: number | null;
  created_by_name?: string;
  finished_at?: string | null;
  created_at?: string;
}
