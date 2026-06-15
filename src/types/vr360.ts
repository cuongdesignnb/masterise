export interface ProjectVrHotspot {
  id: number;
  scene_id: number;
  project_id: number;
  type: 'info' | 'navigation' | 'lead' | 'media' | 'map';
  title: string;
  description: string | null;
  yaw: number; // in degrees
  pitch: number; // in degrees
  icon: string | null;
  target_scene_id: number | null;
  target_scene?: {
    id: number;
    title?: string;
    slug: string;
  } | null;
  targetScene?: {
    id: number;
    title?: string;
    slug: string;
  } | null;
  media_url: string | null;
  cta_type: 'price_form' | 'schedule_visit' | 'zalo' | 'hotline' | null;
  cta_label: string | null;
  cta_url: string | null;
  metadata: Record<string, any> | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectVrScene {
  id: number;
  tour_id: number;
  project_id: number;
  title: string;
  slug: string;
  description: string | null;
  panorama_url: string;
  thumbnail_url: string | null;
  scene_type: string;
  initial_yaw: number;
  initial_pitch: number;
  initial_zoom: number;
  autorotate: boolean;
  sort_order: number;
  is_active: boolean;
  hotspots?: ProjectVrHotspot[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectVrTour {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface VrTourData {
  tour: ProjectVrTour;
  scenes: ProjectVrScene[];
  virtual_tour_url: string | null;
}
