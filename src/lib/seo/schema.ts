import { SITE_NAME, SITE_URL, OPERATOR_LOGO } from '@/config/seo';
import { SiteEntityConfig } from '@/config/siteEntity';

export { buildOffersNode } from './offerSchema';
export type { OfferInput } from './offerSchema';

export interface OperatorContext {
  enabled: boolean;
  id?: string;
  name?: string;
  url?: string;
}

export function buildOperatorContext(config: SiteEntityConfig): OperatorContext {
  if (!config.enabled) return { enabled: false };

  return {
    enabled: true,
    id: `${SITE_URL}/#organization`,
    name: config.name,
    url: config.url,
  };
}

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
export function buildWebSiteNode(operator: OperatorContext = { enabled: false }) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: operator.enabled && operator.id ? { '@id': operator.id } : undefined,
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

// 9. Build Product Schema
export interface ProductInput {
  name: string;
  description: string;
  images?: string[];
  offers?: Record<string, unknown>;
  aggregateRating?: Record<string, unknown>;
  reviews?: Array<Record<string, unknown>>;
}

export function buildProductNode(canonical: string, input: ProductInput, operator: OperatorContext = { enabled: false }) {
  return {
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: input.name,
    description: input.description,
    image: input.images && input.images.length > 0 ? input.images : undefined,
    brand: operator.enabled && operator.id ? { '@id': operator.id } : undefined,
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

export function buildNewsArticleSchema(canonical: string, input: ArticleInput, operator: OperatorContext = { enabled: false }) {
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
    author: input.authorName ? {
      '@type': input.authorType || 'Person',
      name: input.authorName,
    } : undefined,
    publisher: operator.enabled && operator.id ? { '@id': operator.id } : undefined,
  };
}

// 11. Build Event Schema
export interface EventInput {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  locationName?: string;
  streetAddress?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  attendanceMode: 'Offline' | 'Online' | 'Mixed';
  eventStatus: 'Scheduled' | 'Cancelled' | 'Postponed' | 'Rescheduled';
  organizerName?: string;
  organizerUrl?: string;
  onlineUrl?: string;
  price?: number;
  currency?: string;
  availability?: string;
}

export function buildEventSchema(canonical: string, input: EventInput, operator: OperatorContext = { enabled: false }) {
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

  const physicalLocation = {
        '@type': 'Place',
        name: input.locationName,
        address: {
          '@type': 'PostalAddress',
          streetAddress: input.streetAddress || undefined,
          addressLocality: input.locality || undefined,
          addressRegion: input.region || undefined,
          postalCode: input.postalCode || undefined,
          addressCountry: input.country,
        },
      };
  const virtualLocation = input.onlineUrl ? { '@type': 'VirtualLocation', url: input.onlineUrl } : undefined;
  const location = input.attendanceMode === 'Online'
    ? virtualLocation
    : input.attendanceMode === 'Mixed'
      ? [physicalLocation, virtualLocation].filter(Boolean)
      : physicalLocation;

  const availabilityMap = {
    InStock: 'https://schema.org/InStock',
    PreOrder: 'https://schema.org/PreOrder',
    SoldOut: 'https://schema.org/OutOfStock',
  } as const;
  const offers = input.price !== undefined && input.currency
    ? {
        '@type': 'Offer',
        price: input.price,
        priceCurrency: input.currency,
        url: canonical,
        availability: input.availability ? availabilityMap[input.availability as keyof typeof availabilityMap] : undefined,
      }
    : undefined;

  return {
    '@type': 'Event',
    '@id': `${canonical}#event`,
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    eventAttendanceMode: attendanceModeMap[input.attendanceMode],
    eventStatus: statusMap[input.eventStatus],
    location,
    organizer: input.organizerName
      ? { '@type': 'Organization', name: input.organizerName, url: input.organizerUrl || undefined }
      : operator.enabled && operator.id
        ? { '@id': operator.id }
        : undefined,
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
  country?: string;
  jobLocationType?: 'TELECOMMUTE';
  applicantLocationCountry?: string;
  identifier?: string;
  directApply?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryUnit?: 'MONTH' | 'YEAR' | 'WEEK' | 'DAY' | 'HOUR';
  salaryCurrency?: string;
}

export function buildJobPostingSchema(canonical: string, input: JobInput, operator: OperatorContext = { enabled: false }) {
  const baseSalary = input.salaryMin && input.salaryMin > 0 && input.salaryUnit && input.salaryCurrency
    ? {
        '@type': 'MonetaryAmount',
        currency: input.salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: input.salaryMin,
          maxValue: input.salaryMax && input.salaryMax >= input.salaryMin ? input.salaryMax : input.salaryMin,
          unitText: input.salaryUnit,
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
    employmentType: input.employmentType,
    hiringOrganization: operator.enabled && operator.id ? { '@id': operator.id } : undefined,
    jobLocation: input.jobLocationType === 'TELECOMMUTE' ? undefined : {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: input.streetAddress,
        addressLocality: input.locality || undefined,
        addressRegion: input.region || undefined,
        postalCode: input.postalCode || undefined,
        addressCountry: input.country,
      },
    },
    jobLocationType: input.jobLocationType,
    applicantLocationRequirements: input.applicantLocationCountry
      ? { '@type': 'Country', name: input.applicantLocationCountry }
      : undefined,
    identifier: input.identifier
      ? { '@type': 'PropertyValue', name: operator.name, value: input.identifier }
      : undefined,
    directApply: input.directApply,
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
