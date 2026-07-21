import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE } from '@/config/seo';

export interface BuildMetadataOptions {
  title?: string | { absolute: string };
  description?: string;
  keywords?: string | string[];
  path?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  follow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

export function cleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    // Strip analytics/tracking query params
    const stripParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'gclsrc',
    ];
    stripParams.forEach((param) => url.searchParams.delete(param));
    
    let path = url.pathname;
    // Normalize trailing slash (except for root path)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Build normalized URL
    const search = url.search;
    return `${url.origin}${path}${search}`;
  } catch {
    return urlStr.replace(/\/$/, '');
  }
}

export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    keywords,
    path = '',
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    noindex = false,
    follow = true,
    publishedTime,
    modifiedTime,
    authors,
    section,
  } = options;

  // Build canonical URL
  const rawCanonical = path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const canonicalUrl = cleanUrl(rawCanonical);

  // Determine title string & check for double branding
  let titleObj: string | { absolute: string } | undefined;
  if (title) {
    if (typeof title === 'object' && 'absolute' in title) {
      titleObj = title;
    } else if (typeof title === 'string' && title.includes(SITE_NAME)) {
      titleObj = { absolute: title };
    } else {
      titleObj = title;
    }
  }

  titleObj ??= { absolute: `${SITE_NAME} - Bất động sản cao cấp và hạng sang` };

  const displayTitle = typeof titleObj === 'object' && 'absolute' in titleObj 
    ? titleObj.absolute 
    : (titleObj ? `${titleObj} | ${SITE_NAME}` : `${SITE_NAME} - Bất động sản cao cấp và hạng sang`);

  // Robots meta: handle noindex, follow correctly
  const robots = noindex
    ? {
        index: false,
        follow: follow,
        googleBot: {
          index: false,
          follow: follow,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large' as const,
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      };

  // Open Graph
  const openGraph: NonNullable<Metadata['openGraph']> = ogType === 'article'
    ? {
        type: 'article',
        locale: 'vi_VN',
        url: canonicalUrl,
        siteName: SITE_NAME,
        title: displayTitle,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: displayTitle }],
        publishedTime,
        modifiedTime,
        authors: authors && authors.length > 0 ? authors : undefined,
        section,
      }
    : {
        type: 'website',
        locale: 'vi_VN',
        url: canonicalUrl,
        siteName: SITE_NAME,
        title: displayTitle,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: displayTitle }],
      };

  // Twitter Card
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title: displayTitle,
    description,
    images: [ogImage],
  };

  return {
    title: titleObj,
    description,
    keywords: keywords ? (Array.isArray(keywords) ? keywords.join(', ') : keywords) : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots,
    openGraph,
    twitter,
    metadataBase: new URL(SITE_URL),
  };
}
