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
  } catch (e) {
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
    publishedTime,
    modifiedTime,
    authors,
    section,
  } = options;

  // Build canonical URL
  const rawCanonical = path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const canonicalUrl = cleanUrl(rawCanonical);

  // Parse title
  const finalTitle = title
    ? typeof title === 'object' && 'absolute' in title
      ? title.absolute
      : `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Bất động sản cao cấp và hạng sang`;

  // Robots meta
  const robots = noindex
    ? {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
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
  const openGraph: any = {
    type: ogType,
    locale: 'vi_VN',
    url: canonicalUrl,
    siteName: SITE_NAME,
    title: typeof title === 'object' && 'absolute' in title ? title.absolute : (title || finalTitle),
    description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: finalTitle }],
  };

  if (ogType === 'article') {
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
    if (authors && authors.length > 0) openGraph.authors = authors;
    if (section) openGraph.section = section;
  }

  // Twitter Card
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title: typeof title === 'object' && 'absolute' in title ? title.absolute : (title || finalTitle),
    description,
    images: [ogImage],
  };

  return {
    title: typeof title === 'object' && 'absolute' in title ? { absolute: title.absolute } : title,
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
