import type { FloorPlanGroup } from './floor-plan';
import type { ProjectReviewBundle } from './project-review';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  customer_profile?: CustomerProfile | null;
  saved_projects?: Project[];
}

export interface CustomerProfile {
  id: number;
  user_id: number;
  phone: string | null;
  budget_min: string | null;
  budget_max: string | null;
  preferred_regions: string[] | null;
  preferred_types: string[] | null;
  preferred_status: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  taxonomy_type: 'project_type' | 'collection';
  projects_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCategoryOption {
  id: number;
  name: string;
  slug: string;
  projects_count: number;
}

export interface ProjectOption {
  id: number;
  name: string;
  slug: string;
}

export type ProjectStatus = string;

export interface ProjectStatusOption {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color_key: string;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
  projects_count: number;
  published_projects_count?: number;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  code: string | null;
  developer_id: number | null;
  location_id: number | null;
  description: string | null;
  content: string | null;
  hero_subtitle?: string | null;
  badge_text?: string | null;
  project_label?: string | null;
  location: string | null;
  location_description: string | null;
  region: string | null;
  region_name?: string | null;
  region_details?: Pick<Region, 'id' | 'name' | 'slug'> | null;
  location_relation?: Location | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  price_min: string | null;
  price_max: string | null;
  price_per_sqm_min: string | null;
  price_per_sqm_max: string | null;
  price_text: string | null;
  area_min: string | null;
  area_max: string | null;
  area_text: string | null;
  project_status: ProjectStatus;
  project_status_detail?: ProjectStatusOption | null;
  open_sale_at: string | null;
  handover_year: number | null;
  handover_time: string | null;
  legal_status: string | null;
  ownership_type: string | null;
  construction_density: string | null;
  total_area: string | null;
  total_units: number | null;
  total_blocks: number | null;
  total_floors: number | null;
  highlight_points: string[] | null;
  nearby_places: string[] | null;
  quick_cards?: unknown[] | null;
  project_facts?: unknown[] | null;
  project_stats?: { value: string; label: string }[] | null;
  gallery_label?: string | null;
  gallery_title?: string | null;
  gallery_description?: string | null;
  detail_gallery?: string[] | null;
  detail_gallery_label?: string | null;
  detail_gallery_title?: string | null;
  detail_gallery_description?: string | null;
  section_titles?: Record<string, { eyebrow?: string; title?: string }> | null;
  connectivity?: unknown[] | null;
  amenity_details?: unknown[] | null;
  floor_tabs?: string[] | null;
  floor_plans?: unknown[] | null;
  floor_plan_groups?: FloorPlanGroup[] | null;
  handover_standards?: unknown[] | null;
  price_rows?: unknown[] | null;
  policy_cards?: unknown[] | null;
  project_timeline?: unknown[] | null;
  investment_reasons?: unknown[] | null;
  project_testimonials?: unknown[] | null;
  project_faqs?: unknown[] | null;
  schema_price?: string | null;
  schema_price_currency?: string | null;
  schema_availability?: string | null;
  payment_policy: string | null;
  sales_policy: string | null;
  booking_policy: string | null;
  is_featured: boolean;
  is_hot: boolean;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  thumbnail: string | null;
  banner_image: string | null;
  gallery: string[] | null;
  brochure_url: string | null;
  video_url: string | null;
  virtual_tour_url: string | null;
  map_image_url: string | null;
  lat: number | null;
  lng: number | null;
  area_size: string | null;
  developer: string | null;
  scale: string | null;
  amenities: string[] | null;
  categories?: ProjectCategory[];
  related_post_ids?: number[];
  related_posts?: ProjectRelatedPost[];
  seo_meta?: SeoMeta | null;
  reviews?: ProjectReviewBundle;
  created_at: string;
  updated_at: string;
}

export interface ProjectRelatedPost {
  id: number;
  title: string;
  slug: string;
  post_type: 'news' | 'investment';
  excerpt: string | null;
  summary: string | null;
  thumbnail: string | null;
  category?: PostCategory | null;
  published_at: string | null;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  posts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  post_type: 'news' | 'investment' | 'event';
  summary: string | null;
  intro_content: string | null;
  content: string | null;
  thumbnail: string | null;
  status: 'draft' | 'published' | 'scheduled';
  is_featured: boolean;
  post_category_id: number;
  author_id: number;
  published_at: string | null;
  event_start_at?: string | null;
  event_end_at?: string | null;
  event_location?: string | null;
  event_register_url?: string | null;
  event_location_name?: string | null;
  event_street_address?: string | null;
  event_locality?: string | null;
  event_region?: string | null;
  event_postal_code?: string | null;
  event_country?: string | null;
  event_attendance_mode?: 'Offline' | 'Online' | 'Mixed' | null;
  event_status?: 'Scheduled' | 'Cancelled' | 'Postponed' | 'Rescheduled' | null;
  event_organizer_name?: string | null;
  event_organizer_url?: string | null;
  event_online_url?: string | null;
  event_price?: string | null;
  event_currency?: string | null;
  event_availability?: 'InStock' | 'PreOrder' | 'SoldOut' | null;
  category?: PostCategory;
  author?: User;
  tags?: Tag[];
  manual_related_posts?: Post[];
  seo_meta?: SeoMeta | null;
  ai_generated?: boolean;
  ai_generation_job_id?: number | null;
  ai_prompt?: string | null;
  source_keyword?: string | null;
  scheduled_at?: string | null;
  media_items?: PostMedia[];
  created_at: string;
  updated_at: string;
}

export interface PostCard {
  id: number;
  title: string;
  slug: string;
  post_type: 'news' | 'investment' | 'event';
  summary: string | null;
  thumbnail: string | null;
  status: 'draft' | 'published' | 'scheduled';
  is_featured: boolean;
  post_category_id: number;
  author_id: number;
  published_at: string | null;
  category?: PostCategory;
  author?: User;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface PostMedia {
  id?: number;
  post_id?: number;
  media_id?: number | null;
  type: 'image' | 'video_upload' | 'youtube' | 'document';
  title?: string | null;
  url?: string | null;
  thumbnail_url?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  sort_order?: number;
  meta?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  posts_count?: number;
}

export interface PostDetailData {
  post: Post;
  inline_related: PostCard[];
  related: PostCard[];
  previous: PostCard | null;
  next: PostCard | null;
}

export interface RegionOption {
  value: string;
  label: string;
  projects_count: number;
}

export interface Region {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  locations_count?: number;
  projects_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: number;
  region_id: number | null;
  region?: Region | null;
  name: string;
  slug: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  description: string | null;
  projects_count?: number;
}

export interface LeadNote {
  id: number;
  lead_id: number;
  user_id: number;
  note: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  type: 'contact' | 'consultation' | 'download_brochure' | 'newsletter';
  message: string | null;
  status: 'new' | 'contacted' | 'consulting' | 'closed' | 'cancelled';
  project_id: number | null;
  user_id: number | null;
  assigned_to: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  demand_type?: string | null;
  budget_range?: string | null;
  product_type?: string | null;
  visitor_id?: string | null;
  lead_source_position?: string | null;
  project?: Project | null;
  agent?: User | null;
  notes?: LeadNote[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  project_id: number;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  assigned_to: number | null;
  user?: User;
  project?: Project;
  agent?: User | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface SeoMeta {
  id: number;
  seoable_type: string | null;
  seoable_id: number | null;
  path: string | null;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string | null;
  type: 'string' | 'boolean' | 'json' | 'number';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  errors?: Record<string, string[]>;
}
