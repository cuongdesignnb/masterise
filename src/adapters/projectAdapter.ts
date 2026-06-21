import { Project as ApiProject } from '@/types/api';
import { Project as FrontendProject } from '@/types';
import { ProjectDetail, IconDetail, ProjectIconName } from '@/types/project-detail';
import { getSalesStatusLabel } from '@/lib/salesStatus';

const INTERNAL_IMAGE_PLACEHOLDER = '/file.svg';
const UPDATING = 'Đang cập nhật';

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

function normalizeGallery(gallery: string[] | null | undefined) {
  return asArray(gallery).filter(Boolean);
}

function normalizeIcon(icon: unknown, fallback: ProjectIconName): ProjectIconName {
  const allowed: ProjectIconName[] = [
    'BadgeDollarSign',
    'Building2',
    'CalendarDays',
    'ClipboardCheck',
    'Dumbbell',
    'FileCheck2',
    'GraduationCap',
    'HardHat',
    'LandPlot',
    'MapPin',
    'Network',
    'PanelsTopLeft',
    'ShieldCheck',
    'Sparkles',
    'Store',
    'Trees',
    'TrendingUp',
    'Waves',
  ];
  return allowed.includes(icon as ProjectIconName) ? (icon as ProjectIconName) : fallback;
}

function normalizeIconDetails(value: unknown, fallbackIcon: ProjectIconName): IconDetail[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = String(record.label || record.title || '').trim();
      const rawValue = String(record.value || record.description || '').trim();
      if (!label || !rawValue) return null;
      return {
        label,
        value: rawValue,
        icon: normalizeIcon(record.icon, fallbackIcon),
      };
    })
    .filter(notNull);
}

function buildQuickCardsFromRealFields(api: ApiProject): IconDetail[] {
  return [
    api.area_size || api.area_text
      ? { label: 'Quy mô', value: api.area_size || api.area_text || '', icon: 'LandPlot' as const }
      : null,
    api.price_text
      ? { label: 'Giá tham khảo', value: api.price_text, icon: 'BadgeDollarSign' as const }
      : null,
    api.handover_time
      ? { label: 'Bàn giao', value: api.handover_time, icon: 'CalendarDays' as const }
      : null,
    api.sales_status
      ? { label: 'Tình trạng', value: getSalesStatusLabel(api.sales_status), icon: 'Building2' as const }
      : null,
  ].filter(notNull);
}

function buildFactsFromRealFields(api: ApiProject): IconDetail[] {
  return [
    api.location || api.address
      ? { label: 'Vị trí', value: api.location || api.address || '', icon: 'MapPin' as const }
      : null,
    api.developer
      ? { label: 'Chủ đầu tư', value: api.developer, icon: 'Building2' as const }
      : null,
    api.area_size || api.area_text || api.total_area
      ? { label: 'Tổng quy mô', value: api.area_size || api.area_text || api.total_area || '', icon: 'LandPlot' as const }
      : null,
    api.scale
      ? { label: 'Loại hình', value: api.scale, icon: 'PanelsTopLeft' as const }
      : null,
    api.ownership_type
      ? { label: 'Sở hữu', value: api.ownership_type, icon: 'ClipboardCheck' as const }
      : null,
    api.legal_status
      ? { label: 'Pháp lý', value: api.legal_status, icon: 'FileCheck2' as const }
      : null,
  ].filter(notNull);
}

function buildPoliciesFromRealFields(api: ApiProject) {
  return [
    api.payment_policy
      ? { title: 'Chinh sach thanh toan', description: api.payment_policy, icon: 'CalendarDays' as const }
      : null,
    api.sales_policy
      ? { title: 'Chinh sach ban hang', description: api.sales_policy, icon: 'BadgeDollarSign' as const }
      : null,
    api.booking_policy
      ? { title: 'Chinh sach giu cho', description: api.booking_policy, icon: 'ClipboardCheck' as const }
      : null,
  ].filter(notNull);
}

function normalizeAmenities(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = String(record.title || '').trim();
      const description = String(record.description || '').trim();
      const image = String(record.image || '').trim();
      if (!title || !description || !image) return null;
      return {
        title,
        description,
        image,
        icon: normalizeIcon(record.icon, 'Sparkles'),
      };
    })
    .filter(notNull);
}

function normalizeFloorPlans(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const name = String(record.name || '').trim();
      const area = String(record.area || '').trim();
      const totalArea = String(record.totalArea || record.total_area || '').trim();
      const image = String(record.image || '').trim();
      if (!name || !area || !image) return null;
      return { name, area, totalArea: totalArea || area, image };
    })
    .filter(notNull);
}

function normalizePriceRows(value: unknown): [string, string, string][] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (Array.isArray(row) && row.length >= 3) {
        const cells = row.slice(0, 3).map((cell) => String(cell || '').trim());
        return cells.every(Boolean) ? (cells as [string, string, string]) : null;
      }
      return null;
    })
    .filter(notNull);
}

function normalizeTimeline(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const date = String(record.date || '').trim();
      const title = String(record.title || '').trim();
      return date && title ? { date, title } : null;
    })
    .filter(notNull);
}

function normalizeTextCards(value: unknown, fallbackIcon: ProjectIconName) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = String(record.title || '').trim();
      const description = String(record.description || '').trim();
      return title && description
        ? { title, description, icon: normalizeIcon(record.icon, fallbackIcon) }
        : null;
    })
    .filter(notNull);
}

function normalizeTestimonials(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const name = String(record.name || '').trim();
      const role = String(record.role || '').trim();
      const content = String(record.content || '').trim();
      return name && content
        ? { name, role, content, avatar: String(record.avatar || INTERNAL_IMAGE_PLACEHOLDER) }
        : null;
    })
    .filter(notNull);
}

function normalizeFaqs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const question = String(record.question || '').trim();
      const answer = String(record.answer || '').trim();
      return question && answer ? { question, answer } : null;
    })
    .filter(notNull);
}

function normalizeConnectivity(value: unknown, nearbyPlaces: string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const time = String(record.time || '').trim();
        const label = String(record.label || '').trim();
        return time && label ? { time, label } : null;
      })
      .filter(notNull);
  }

  return asArray(nearbyPlaces)
    .map((place) => {
      const match = place.match(/^(\S+\s+\S+)\s+(.+)$/);
      return match ? { time: match[1], label: match[2] } : null;
    })
    .filter(notNull);
}

export function mapApiProjectToProjectCard(api: ApiProject): FrontendProject {
  const price = api.price_text || (api.price_min ? `Tu ${api.price_min} ty` : UPDATING);
  const location = api.location || api.address || UPDATING;
  const type = api.categories && api.categories.length > 0 ? api.categories[0].name : UPDATING;

  return {
    id: api.id,
    name: api.name,
    location,
    price,
    image: api.thumbnail || api.banner_image || INTERNAL_IMAGE_PLACEHOLDER,
    badge: api.is_featured ? 'HOT' : undefined,
    status: api.status === 'selling' ? 'selling' : api.status === 'upcoming' ? 'upcoming' : 'done',
    type,
    description: api.description || '',
    slug: api.slug,
    sales_status: api.sales_status,
  };
}

export function mapApiProjectToProjectDetail(api: ApiProject): ProjectDetail {
  const galleryImages = normalizeGallery(api.gallery);
  const quickCard = normalizeIconDetails(api.quick_cards, 'LandPlot');
  const facts = normalizeIconDetails(api.project_facts, 'MapPin');

  return {
    id: api.id,
    slug: api.slug,
    badge: api.badge_text || '',
    salesStatus: api.sales_status ? getSalesStatusLabel(api.sales_status) : undefined,
    name: api.name,
    subtitle: api.hero_subtitle || api.description || UPDATING,
    description: api.description || UPDATING,
    content: api.content || '',
    address: api.address || api.location || UPDATING,
    heroImage: api.banner_image || api.thumbnail || INTERNAL_IMAGE_PLACEHOLDER,
    thumbnail: api.thumbnail || api.banner_image || null,
    priceFrom: api.price_text || UPDATING,
    quickCard: quickCard.length ? quickCard : buildQuickCardsFromRealFields(api),
    facts: facts.length ? facts : buildFactsFromRealFields(api),
    stats: asArray(api.project_stats),
    gallery: {
      label: api.gallery_label || '',
      title: api.gallery_title || '',
      description: api.gallery_description || '',
      images: galleryImages,
    },
    connectivity: normalizeConnectivity(api.connectivity, api.nearby_places),
    amenities: normalizeAmenities(api.amenity_details),
    floorTabs: asArray(api.floor_tabs),
    floorPlans: normalizeFloorPlans(api.floor_plans),
    priceRows: normalizePriceRows(api.price_rows),
    policies: api.policy_cards && Array.isArray(api.policy_cards)
      ? normalizeTextCards(api.policy_cards, 'ClipboardCheck')
      : buildPoliciesFromRealFields(api),
    timeline: normalizeTimeline(api.project_timeline),
    investmentReasons: normalizeTextCards(api.investment_reasons, 'TrendingUp'),
    testimonials: normalizeTestimonials(api.project_testimonials),
    faqs: normalizeFaqs(api.project_faqs),
    brochureUrl: api.brochure_url || null,
    videoUrl: api.video_url || null,
    virtualTourUrl: api.virtual_tour_url || null,
    mapImageUrl: api.map_image_url || null,
    locationDescription: api.location_description || null,
    seo: api.seo_meta || null,
    schemaPrice: api.schema_price || api.price_min || null,
    schemaPriceCurrency: api.schema_price_currency || 'VND',
    schemaAvailability: api.schema_availability || null,
  };
}
