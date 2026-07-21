import { SITE_NAME, SITE_URL, OPERATOR_LOGO } from '@/config/seo';
import { SiteEntityConfig } from '@/config/siteEntity';

// 1. Build Base Operator Node
export function buildOperatorNode(config: SiteEntityConfig) {
  if (!config.enabled) return null;

  const telephone = config.telephone || undefined;
  const email = config.email || undefined;
  const logoUrl = config.logoUrl || OPERATOR_LOGO;
  
  const address = config.address
    ? {
        '@type': 'PostalAddress',
        streetAddress: config.address.streetAddress,
        addressLocality: config.address.addressLocality,
        addressRegion: config.address.addressRegion,
        postalCode: config.address.postalCode,
        addressCountry: config.address.addressCountry,
      }
    : undefined;

  const brand = config.brand
    ? {
        '@type': 'Brand',
        name: config.brand.name,
        url: config.brand.url,
      }
    : undefined;

  return {
    '@type': config.type === 'RealEstateAgent' ? 'RealEstateAgent' : 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: config.name,
    legalName: config.legalName,
    taxID: config.taxId,
    url: config.url,
    logo: logoUrl ? { '@type': 'ImageObject', url: logoUrl } : undefined,
    telephone,
    email,
    address,
    sameAs: config.sameAs && config.sameAs.length > 0 ? config.sameAs : undefined,
    brand,
    description: config.authorizationNote || undefined,
  };
}

// 2. Build WebSite Node
export function buildWebSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

// 3. Build WebPage Node
export function buildWebPageNode(canonical: string, title: string, description: string, aboutId?: string) {
  return {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: aboutId ? { '@id': aboutId } : undefined,
    breadcrumb: { '@id': `${canonical}#breadcrumb` },
  };
}

// 4. Build Breadcrumb Schema
export function buildBreadcrumbSchema(canonical: string, items: { name: string; item?: string }[]) {
  const itemListElement = items.map((itm, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: itm.name,
    item: itm.item ? (itm.item.startsWith('http') ? itm.item : `${SITE_URL}${itm.item}`) : undefined,
  }));

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement,
  };
}

// 5. Build ImageObject Node
export function buildImageObjectNode(canonical: string, url: string, caption?: string) {
  return {
    '@type': 'ImageObject',
    '@id': `${canonical}#primaryimage`,
    url,
    caption,
  };
}

// 6. Build Place Node
export function buildPlaceNode(canonical: string, name: string, rawAddress: string, lat?: number, lng?: number) {
  return {
    '@type': 'Place',
    '@id': `${canonical}#place`,
    name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: rawAddress,
      addressCountry: 'VN',
    },
    geo: lat && lng ? {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    } : undefined,
  };
}

// 7. Build Residence Node
export function buildResidenceNode(canonical: string, name: string, description: string, rawAddress: string, images?: string[]) {
  return {
    '@type': 'Residence',
    '@id': `${canonical}#residence`,
    name,
    description,
    url: canonical,
    image: images && images.length > 0 ? images : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: rawAddress,
      addressCountry: 'VN',
    },
    containedInPlace: { '@id': `${canonical}#place` },
  };
}

// 8. Build Offers Node
export interface OfferInput {
  price?: number;
  priceCurrency?: string;
  lowPrice?: number;
  highPrice?: number;
  offerCount?: number;
  availability?: string;
}

export function buildOffersNode(canonical: string, input: OfferInput) {
  const availabilityMap: Record<string, string> = {
    selling: 'https://schema.org/InStock',
    coming_soon: 'https://schema.org/PreOrder',
    sold_out: 'https://schema.org/OutOfStock',
    handing_over: 'https://schema.org/InStock',
    handover: 'https://schema.org/InStock',
  };

  const schemaAvailability = input.availability ? (availabilityMap[input.availability] || 'https://schema.org/InStock') : undefined;

  if (input.lowPrice && input.lowPrice > 0) {
    return {
      '@type': 'AggregateOffer',
      '@id': `${canonical}#offers`,
      url: canonical,
      priceCurrency: input.priceCurrency || 'VND',
      lowPrice: input.lowPrice,
      highPrice: input.highPrice && input.highPrice >= input.lowPrice ? input.highPrice : input.lowPrice,
      offerCount: input.offerCount || undefined,
      availability: schemaAvailability,
    };
  }

  if (input.price && input.price > 0) {
    return {
      '@type': 'Offer',
      '@id': `${canonical}#offers`,
      url: canonical,
      priceCurrency: input.priceCurrency || 'VND',
      price: input.price,
      availability: schemaAvailability,
    };
  }

  return null;
}

// 9. Build Product Schema
export interface ProductInput {
  name: string;
  description: string;
  images?: string[];
  offers?: any;
  aggregateRating?: any;
  reviews?: any[];
}

export function buildProductNode(canonical: string, input: ProductInput) {
  return {
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: input.name,
    description: input.description,
    image: input.images && input.images.length > 0 ? input.images : undefined,
    brand: { '@id': `${SITE_URL}/#organization` },
    offers: input.offers || undefined,
    aggregateRating: input.aggregateRating || undefined,
    review: input.reviews && input.reviews.length > 0 ? input.reviews : undefined,
  };
}

// 10. Build NewsArticle Schema
export interface ArticleInput {
  headline: string;
  description: string;
  images: string[];
  datePublished: string;
  dateModified: string;
  authorName?: string;
  authorType?: 'Person' | 'Organization';
  publisherName?: string;
}

export function buildNewsArticleSchema(canonical: string, input: ArticleInput) {
  const authorType = input.authorType || 'Organization';
  const authorName = input.authorName || SITE_NAME;

  return {
    '@type': 'NewsArticle',
    '@id': `${canonical}#article`,
    isPartOf: { '@id': `${canonical}#webpage` },
    headline: input.headline.slice(0, 110), // Limit characters per standard spec
    description: input.description,
    image: input.images && input.images.length > 0 ? input.images : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    mainEntityOfPage: canonical,
    inLanguage: 'vi-VN',
    author: {
      '@type': authorType,
      name: authorName,
      url: authorType === 'Organization' ? SITE_URL : undefined,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

// 11. Build Event Schema
export interface EventInput {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  locationName: string;
  streetAddress?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  attendanceMode?: 'Offline' | 'Online' | 'Mixed';
  eventStatus?: 'Scheduled' | 'Cancelled' | 'Postponed' | 'Rescheduled';
  organizerName?: string;
  price?: number;
  currency?: string;
  availability?: string;
}

export function buildEventSchema(canonical: string, input: EventInput) {
  const attendanceModeMap = {
    Offline: 'https://schema.org/OfflineEventAttendanceMode',
    Online: 'https://schema.org/OnlineEventAttendanceMode',
    Mixed: 'https://schema.org/MixedEventAttendanceMode',
  };

  const statusMap = {
    Scheduled: 'https://schema.org/EventScheduled',
    Cancelled: 'https://schema.org/EventCancelled',
    Postponed: 'https://schema.org/EventPostponed',
    Rescheduled: 'https://schema.org/EventRescheduled',
  };

  const location = input.attendanceMode === 'Online'
    ? { '@type': 'VirtualLocation', url: canonical }
    : {
        '@type': 'Place',
        name: input.locationName,
        address: {
          '@type': 'PostalAddress',
          streetAddress: input.streetAddress || input.locationName,
          addressLocality: input.locality || undefined,
          addressRegion: input.region || undefined,
          postalCode: input.postalCode || undefined,
          addressCountry: 'VN',
        },
      };

  const offers = input.price !== undefined
    ? {
        '@type': 'Offer',
        price: input.price,
        priceCurrency: input.currency || 'VND',
        url: canonical,
        availability: input.availability === 'InStock' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      }
    : undefined;

  return {
    '@type': 'Event',
    '@id': `${canonical}#event`,
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate || input.startDate,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    eventAttendanceMode: attendanceModeMap[input.attendanceMode || 'Offline'],
    eventStatus: statusMap[input.eventStatus || 'Scheduled'],
    location,
    organizer: {
      '@type': 'Organization',
      name: input.organizerName || SITE_NAME,
      url: SITE_URL,
    },
    offers,
  };
}

// 12. Build JobPosting Schema
export interface JobInput {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';
  streetAddress?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryUnit?: 'MONTH' | 'YEAR' | 'WEEK' | 'DAY' | 'HOUR';
  salaryCurrency?: string;
}

export function buildJobPostingSchema(canonical: string, input: JobInput) {
  const baseSalary = input.salaryMin && input.salaryMin > 0
    ? {
        '@type': 'MonetaryAmount',
        currency: input.salaryCurrency || 'VND',
        value: {
          '@type': 'QuantitativeValue',
          minValue: input.salaryMin,
          maxValue: input.salaryMax && input.salaryMax >= input.salaryMin ? input.salaryMax : input.salaryMin,
          unitText: input.salaryUnit || 'MONTH',
        },
      }
    : undefined;

  return {
    '@type': 'JobPosting',
    '@id': `${canonical}#job`,
    title: input.title,
    description: input.description,
    datePosted: input.datePosted,
    validThrough: input.validThrough || undefined,
    employmentType: input.employmentType || 'FULL_TIME',
    hiringOrganization: {
      '@id': `${SITE_URL}/#organization`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: input.streetAddress || 'Trụ sở chính',
        addressLocality: input.locality || undefined,
        addressRegion: input.region || undefined,
        postalCode: input.postalCode || undefined,
        addressCountry: 'VN',
      },
    },
    baseSalary,
  };
}

// 13. Build ItemList Schema
export function buildItemListSchema(canonical: string, name: string, items: { name: string; url: string }[]) {
  const itemListElement = items.map((itm, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    url: itm.url.startsWith('http') ? itm.url : `${SITE_URL}${itm.url}`,
    name: itm.name,
  }));

  return {
    '@type': 'ItemList',
    '@id': `${canonical}#itemlist`,
    name,
    itemListElement,
  };
}
