import { Project as ApiProject } from '@/types/api';
import { Project as FrontendProject } from '@/types';
import { ProjectDetail, IconDetail, ProjectIconName } from '@/types/project-detail';
import { getProjectStatusLabel } from '@/lib/projectStatus';
import { getProjectPriceText } from '@/lib/projectPrice';

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

function normalizeStringList(...values: unknown[]) {
  return Array.from(new Set(values.flatMap((value) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }).map((value) => String(value || '').trim()).filter(Boolean)));
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

function normalizeLabelKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeHeroQuickCards(api: ApiProject) {
  const cards = normalizeIconDetails(api.quick_cards, 'LandPlot');
  if (!cards.length) return buildQuickCardsFromRealFields(api);

  return cards.map((card) => {
    if (normalizeLabelKey(card.label) === 'gia tham khao' && api.ownership_type) {
      return {
        label: 'Sở hữu',
        value: api.ownership_type,
        icon: 'ClipboardCheck' as const,
      };
    }
    return card;
  });
}

function buildQuickCardsFromRealFields(api: ApiProject): IconDetail[] {
  return [
    api.area_size || api.area_text
      ? { label: 'Quy mô', value: api.area_size || api.area_text || '', icon: 'LandPlot' as const }
      : null,
    api.ownership_type
      ? { label: 'Sở hữu', value: api.ownership_type, icon: 'ClipboardCheck' as const }
      : null,
    api.handover_time
      ? { label: 'Bàn giao', value: api.handover_time, icon: 'CalendarDays' as const }
      : null,
    api.project_status
      ? { label: 'Tình trạng', value: getProjectStatusLabel(api.project_status), icon: 'Building2' as const }
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
  const makePolicy = (title: string, description: string, icon: ProjectIconName) => ({
    title,
    description,
    icon,
    imageUrl: '',
    badge: '',
    bullets: [],
    ctaLabel: '',
    ctaUrl: '',
    fileUrl: '',
  });

  return [
    api.payment_policy
      ? makePolicy('Chính sách thanh toán', api.payment_policy, 'CalendarDays')
      : null,
    api.sales_policy
      ? makePolicy('Chính sách bán hàng', api.sales_policy, 'BadgeDollarSign')
      : null,
    api.booking_policy
      ? makePolicy('Chính sách giữ chỗ', api.booking_policy, 'ClipboardCheck')
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
      const name = String(record.title || record.name || record.label || record.type || 'Mặt bằng điển hình').trim();
      const productType = String(record.productType || record.product_type || record.type || '').trim();
      const area = String(record.area || record.area_text || record.size || '').trim();
      const totalArea = String(record.totalArea || record.total_area || '').trim();
      const images = normalizeStringList(
        record.images,
        record.image_urls,
        record.gallery,
        record.photos,
        record.image_url,
        record.image,
        record.thumbnail,
        record.url,
        record.src
      );
      const image = images[0] || '';
      const price = String(record.price || record.price_text || '').trim();
      const bedrooms = String(record.bedrooms || record.bedroom || '').trim();
      const status = String(record.status || '').trim();
      const description = String(record.description || record.note || '').trim();
      if (!name && !area && !image && !price && !description) return null;
      return {
        productType,
        name,
        area,
        totalArea: totalArea || area,
        image,
        images,
        price,
        bedrooms,
        status,
        description,
      };
    })
    .filter(notNull);
}

function inferFileType(url: string): "pdf" | "excel" | "word" | "image" | "other" {
  const clean = url.split('?')[0].toLowerCase();
  if (/\.(png|jpe?g|webp|gif|avif|svg)$/.test(clean)) return "image";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(xls|xlsx|csv)$/.test(clean)) return "excel";
  if (/\.(doc|docx)$/.test(clean)) return "word";
  return "other";
}

function normalizePriceRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (Array.isArray(row) && row.length >= 3) {
        const cells = row.slice(0, 3).map((cell) => String(cell || '').trim());
        return cells.some(Boolean)
          ? { kind: "row" as const, productType: cells[0] || 'Sản phẩm', area: cells[1] || 'Đang cập nhật', price: cells[2] || 'Liên hệ' }
          : null;
      }
      if (row && typeof row === 'object') {
        const record = row as Record<string, unknown>;
        const kind = String(record.kind || 'row').trim();

        if (kind === 'image') {
          const imageUrl = String(record.image_url || record.imageUrl || record.image || record.url || '').trim();
          if (!imageUrl) return null;
          return {
            kind: "image" as const,
            title: String(record.title || '').trim(),
            description: String(record.description || '').trim(),
            imageUrl,
            buttonLabel: String(record.button_label || record.buttonLabel || 'Xem ảnh lớn').trim(),
          };
        }

        if (kind === 'file') {
          const fileUrl = String(record.file_url || record.fileUrl || record.url || '').trim();
          if (!fileUrl) return null;
          return {
            kind: "file" as const,
            title: String(record.title || '').trim(),
            description: String(record.description || '').trim(),
            fileUrl,
            fileType: inferFileType(fileUrl),
            fileSize: String(record.file_size || record.fileSize || '').trim(),
            buttonLabel: String(record.button_label || record.buttonLabel || 'Tải xuống').trim(),
          };
        }

        if (kind === 'note') {
          const title = String(record.title || '').trim();
          const description = String(record.description || record.note || '').trim();
          if (!title && !description) return null;
          return {
            kind: "note" as const,
            title,
            description,
            highlight: Boolean(record.highlight),
          };
        }

        const productType = String(record.product_type || record.productType || record.type || record.name || record.title || '').trim();
        const area = String(record.area || record.area_text || record.size || '').trim();
        const price = String(record.price || record.price_text || '').trim();
        const payment = String(record.payment || '').trim();
        const status = String(record.status || '').trim();
        const note = String(record.note || '').trim();
        const description = String(record.description || '').trim();
        if (!productType && !area && !price && !payment && !status && !note && !description) return null;
        return {
          kind: "row" as const,
          productType: productType || 'Sản phẩm',
          area: area || 'Đang cập nhật',
          price: price || 'Liên hệ',
          payment,
          status,
          note,
          description,
        };
      }
      return null;
    })
    .filter(notNull);
}
function buildProductSummary(api: ApiProject) {
  const displayPrice = getProjectPriceText(api.price_text, api.price_min, '');
  return [
    displayPrice
      ? {
          label: 'Giá tham khảo',
          value: displayPrice,
        }
      : null,
    api.area_text || api.area_min || api.area_max
      ? {
          label: 'Diện tích',
          value: api.area_text || [api.area_min, api.area_max].filter(Boolean).join(' - '),
        }
      : null,
    api.total_units ? { label: 'Số lượng sản phẩm', value: `${api.total_units}` } : null,
    api.total_blocks ? { label: 'Số block', value: `${api.total_blocks}` } : null,
    api.total_floors ? { label: 'Số tầng', value: `${api.total_floors}` } : null,
    api.handover_time ? { label: 'Bàn giao', value: api.handover_time } : null,
    api.ownership_type ? { label: 'Sở hữu', value: api.ownership_type } : null,
  ].filter(notNull);
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

function normalizePolicyCards(value: unknown, fallbackIcon: ProjectIconName) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = String(record.title || record.name || '').trim();
      const description = String(record.description || record.desc || '').trim();
      if (!title && !description) return null;
      const bullets = Array.isArray(record.bullets)
        ? record.bullets.map((bullet) => String(bullet || '').trim()).filter(Boolean)
        : String(record.bullets || '')
          .split('\n')
          .map((bullet) => bullet.trim())
          .filter(Boolean);
      return {
        title: title || 'Chính sách bán hàng',
        description,
        imageUrl: String(record.image_url || record.imageUrl || record.image || record.thumbnail || '').trim(),
        icon: normalizeIcon(record.icon, fallbackIcon),
        badge: String(record.badge || '').trim(),
        bullets,
        ctaLabel: String(record.cta_label || record.ctaLabel || '').trim(),
        ctaUrl: String(record.cta_url || record.ctaUrl || '').trim(),
        fileUrl: String(record.file_url || record.fileUrl || '').trim(),
      };
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

function normalizeHandoverStandards(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = String(record.title || record.name || '').trim();
      const description = String(record.description || record.note || '').trim();
      const image = String(record.image || record.image_url || record.thumbnail || '').trim();
      if (!title || !description) return null;
      return {
        title,
        description,
        image,
        icon: normalizeIcon(record.icon, 'ClipboardCheck'),
      };
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

const defaultProjectSectionTitles: Record<string, { eyebrow?: string; title?: string }> = {
  overview: { eyebrow: "Tổng quan dự án", title: "" },
  location: { eyebrow: "Vị trí chiến lược", title: "Kết nối toàn diện" },
  amenities: { title: "Tiện ích nổi bật" },
  floorPlans: { eyebrow: "Mặt bằng", title: "Mặt bằng điển hình" },
  handover: { eyebrow: "Bàn giao", title: "Tiêu chuẩn bàn giao" },
  productInfo: { title: "Sản phẩm & Bảng giá" },
  pricingPolicy: { eyebrow: "Bảng giá", title: "Bảng giá & Chính sách" },
  policies: { title: "Chính sách bán hàng" },
  timeline: { title: "Tiến độ thi công" },
  investment: { title: "Vì sao nên đầu tư?" },
  testimonials: { title: "Khách hàng nói gì?" },
  faq: { title: "Câu hỏi thường gặp" },
  contact: { title: "Đăng ký tư vấn\nNhận thông tin dự án" },
};

function normalizeSectionTitles(value: unknown): Record<string, { eyebrow?: string; title?: string }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultProjectSectionTitles;
  }

  const parsed = value as Record<string, { eyebrow?: unknown; title?: unknown }>;
  return Object.fromEntries(
    Object.entries(defaultProjectSectionTitles).map(([key, fallback]) => {
      const item = parsed[key] || {};
      return [
        key,
        {
          eyebrow: typeof item.eyebrow === "string" ? item.eyebrow : fallback.eyebrow,
          title: typeof item.title === "string" ? item.title : fallback.title,
        },
      ];
    })
  );
}

export function getProjectTypeText(categories: ApiProject['categories']): string {
  const projectTypeNames = Array.from(new Set(
    (categories || [])
      .filter((category) => category.taxonomy_type === 'project_type')
      .map((category) => category.name.trim())
      .filter(Boolean),
  ));

  return projectTypeNames.length > 0
    ? `${projectTypeNames.slice(0, 2).join(' • ')}${projectTypeNames.length > 2 ? ` +${projectTypeNames.length - 2}` : ''}`
    : UPDATING;
}

export function mapApiProjectToProjectCard(api: ApiProject): FrontendProject {
  const price = getProjectPriceText(api.price_text, api.price_min, UPDATING);
  const location = api.location || api.address || UPDATING;
  const type = getProjectTypeText(api.categories);

  return {
    id: api.id,
    name: api.name,
    location,
    price,
    image: api.thumbnail || api.banner_image || INTERNAL_IMAGE_PLACEHOLDER,
    badge: api.is_featured ? 'HOT' : undefined,
    project_status: api.project_status,
    type,
    description: api.description || '',
    slug: api.slug,
    project_label: api.project_label || null,
  };
}

export function mapApiProjectToProjectDetail(api: ApiProject): ProjectDetail {
  const galleryImages = normalizeGallery(api.gallery);
  const detailGalleryImages = normalizeGallery(api.detail_gallery);
  const quickCard = normalizeHeroQuickCards(api);
  const facts = normalizeIconDetails(api.project_facts, 'MapPin');

  return {
    id: api.id,
    slug: api.slug,
    badge: api.badge_text || '',
    projectStatus: api.project_status ? getProjectStatusLabel(api.project_status) : undefined,
    name: api.name,
    subtitle: api.hero_subtitle || api.description || UPDATING,
    description: api.description || UPDATING,
    content: api.content || '',
    address: api.address || api.location || UPDATING,
    heroImage: api.banner_image || api.thumbnail || INTERNAL_IMAGE_PLACEHOLDER,
    thumbnail: api.thumbnail || api.banner_image || null,
    priceFrom: getProjectPriceText(api.price_text, api.price_min, UPDATING),
    quickCard,
    facts: facts.length ? facts : buildFactsFromRealFields(api),
    stats: asArray(api.project_stats),
    gallery: {
      label: api.gallery_label || '',
      title: api.gallery_title || '',
      description: api.gallery_description || '',
      images: galleryImages,
    },
    detailGallery: {
      label: api.detail_gallery_label || '',
      title: api.detail_gallery_title || '',
      description: api.detail_gallery_description || '',
      images: detailGalleryImages,
    },
    sectionTitles: normalizeSectionTitles(api.section_titles),
    connectivity: normalizeConnectivity(api.connectivity, api.nearby_places),
    amenities: normalizeAmenities(api.amenity_details),
    floorTabs: asArray(api.floor_tabs),
    floorPlans: normalizeFloorPlans(api.floor_plans),
    handoverStandards: normalizeHandoverStandards(api.handover_standards),
    priceRows: normalizePriceRows(api.price_rows),
    productSummary: buildProductSummary(api),
    policies: api.policy_cards && Array.isArray(api.policy_cards)
      ? normalizePolicyCards(api.policy_cards, 'ClipboardCheck')
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
