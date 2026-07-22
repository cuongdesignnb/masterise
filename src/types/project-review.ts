export interface PublicProjectReview {
  id: number;
  reviewer_name: string;
  reviewer_role?: string | null;
  rating: number;
  review_body: string;
  reviewed_at: string | null;
  is_verified: boolean;
}

export interface ProjectReviewAggregate {
  ratingValue: number;
  ratingCount: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

export interface ProjectReviewBundle {
  items: PublicProjectReview[];
  aggregate: ProjectReviewAggregate | null;
}

export interface AdminProjectReview extends PublicProjectReview {
  project_id: number;
  project?: { id: number; name: string; slug: string };
  source_type: string;
  source_url?: string | null;
  moderation_status: 'pending' | 'approved' | 'rejected';
  is_published: boolean;
  approved_by?: number | null;
  approved_at?: string | null;
  rejected_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectReviewListResponse extends ProjectReviewBundle {
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
