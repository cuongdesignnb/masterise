export interface VideoSitemapEntry {
  loc: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  playerUrl: string;
  publicationDate: string;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildVideoSitemapXml(entries: VideoSitemapEntry[]): string {
  const urls = entries.map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(entry.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(entry.title)}</video:title>
      <video:description>${escapeXml(entry.description)}</video:description>
      <video:player_loc>${escapeXml(entry.playerUrl)}</video:player_loc>
      <video:publication_date>${escapeXml(entry.publicationDate)}</video:publication_date>
    </video:video>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>`;
}
