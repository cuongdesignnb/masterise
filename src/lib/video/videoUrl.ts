export interface ParsedVideoUrl {
  platform: 'youtube';
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
}

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{6,}$/;

export function parseYouTubeVideoUrl(value?: string | null): ParsedVideoUrl | null {
  const raw = String(value || '').trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments[0] === 'embed' || segments[0] === 'shorts') {
        videoId = segments[1] || '';
      } else if (parsed.pathname === '/watch' || parsed.pathname === '/') {
        videoId = parsed.searchParams.get('v') || '';
      }
    }

    if (!YOUTUBE_ID_PATTERN.test(videoId)) return null;

    return {
      platform: 'youtube',
      videoId,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch {
    return null;
  }
}
