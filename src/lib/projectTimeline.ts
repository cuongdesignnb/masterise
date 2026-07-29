import type { ProjectTimelineItem } from '@/types/project-timeline';

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function createProjectTimelineKey(seed?: string): string {
  if (seed) return `timeline-${stableHash(seed)}`;
  return `timeline-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeProjectTimelineBullets(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n/) : [];
  return values.map(text).filter(Boolean);
}

export function uniqueProjectTimelineImages(images: unknown): string[] {
  const values = Array.isArray(images) ? images : images ? [images] : [];
  const seen = new Set<string>();
  return values.map(text).filter((image) => {
    if (!image || seen.has(image)) return false;
    seen.add(image);
    return true;
  });
}

export function normalizeProjectTimeline(value: unknown): ProjectTimelineItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const date = text(record.date);
    const title = text(record.title);
    const description = text(record.description);
    const bullets = normalizeProjectTimelineBullets(record.bullets);
    const images = uniqueProjectTimelineImages([
      ...(Array.isArray(record.images) ? record.images : []),
      ...(Array.isArray(record.gallery) ? record.gallery : []),
      ...(Array.isArray(record.image_urls) ? record.image_urls : []),
      record.image,
      record.image_url,
      record.imageUrl,
    ]);
    if (!date && !title && !description && !bullets.length && !images.length) return [];

    const suppliedKey = text(record.key);
    return [{
      key: suppliedKey || createProjectTimelineKey(`${index}|${date}|${title}|${description}`),
      date,
      title,
      description,
      bullets,
      images,
    }];
  });
}
