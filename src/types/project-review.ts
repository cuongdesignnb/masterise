export interface ProjectReview {
  id: number;
  project_id: number;
  reviewer_name: string;
  reviewer_role?: string;
  rating: number;
  review_body: string;
  reviewed_at: string;
  source_type: string;
  source_url?: string;
  is_verified: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  is_published: boolean;
  created_at: string;
}

export interface ProjectReviewSummary {
  ratingValue: number;
  ratingCount: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

export interface ProjectReviewResponse {
  items: ProjectReview[];
  summary: ProjectReviewSummary | null;
}
