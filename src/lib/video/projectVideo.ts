import type { Project } from '@/types/api';
import { parseYouTubeVideoUrl, type ParsedVideoUrl } from '@/lib/video/videoUrl';

export interface ProjectVideo {
  projectName: string;
  projectSlug: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  parsed: ParsedVideoUrl;
  canonicalPath: string;
  projectPath: string;
  updatedAt?: string | null;
}

function cleanText(value?: string | null) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isValidDate(value?: string | null) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function toIsoDate(value: string) {
  return new Date(value).toISOString();
}

export function secondsToIsoDuration(value?: number | string | null): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const totalSeconds = Math.floor(Number(value));
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return undefined;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds || (!hours && !minutes) ? `${seconds}S` : ''}`;
}

export function getProjectVideo(project?: Project | null): ProjectVideo | null {
  if (!project?.video_url || project.video_is_indexable !== true) return null;

  const parsed = parseYouTubeVideoUrl(project.video_url);
  if (!parsed) return null;

  const title = cleanText(project.video_title);
  const description = cleanText(project.video_description);
  const thumbnailUrl = cleanText(project.video_thumbnail_url) || parsed.thumbnailUrl;
  const uploadDate = cleanText(project.video_upload_date);
  const slug = cleanText(project.video_slug) || project.slug;

  if (!title || !description || !thumbnailUrl || !slug || !isValidDate(uploadDate)) {
    return null;
  }

  return {
    projectName: project.name,
    projectSlug: project.slug,
    slug,
    title,
    description,
    thumbnailUrl,
    uploadDate: toIsoDate(uploadDate),
    duration: secondsToIsoDuration(project.video_duration_seconds),
    parsed,
    canonicalPath: `/video/${slug}`,
    projectPath: `/${project.slug}`,
    updatedAt: project.updated_at,
  };
}

export function isIndexableVideo(project?: Project | null): boolean {
  return getProjectVideo(project) !== null;
}
