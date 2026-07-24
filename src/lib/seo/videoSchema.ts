export interface VideoSchemaInput {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl: string;
  contentUrl?: string;
  duration?: string;
  publisherId?: string;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function isIsoDate(value: string) {
  return Boolean(value && !Number.isNaN(new Date(value).getTime()));
}

export function buildVideoObjectNode(
  canonical: string,
  input: VideoSchemaInput,
): Record<string, unknown> | null {
  const name = cleanText(input.name);
  const description = cleanText(input.description);
  const thumbnailUrl = String(input.thumbnailUrl || '').trim();
  const uploadDate = String(input.uploadDate || '').trim();
  const embedUrl = String(input.embedUrl || '').trim();

  if (!name || !description || !thumbnailUrl || !embedUrl || !isIsoDate(uploadDate)) return null;

  return {
    '@type': 'VideoObject',
    '@id': `${canonical}#video`,
    name,
    description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate,
    embedUrl,
    url: canonical,
    contentUrl: input.contentUrl || undefined,
    duration: input.duration || undefined,
    publisher: input.publisherId ? { '@id': input.publisherId } : undefined,
  };
}
