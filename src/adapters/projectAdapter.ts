import { Project as ApiProject } from '@/types/api';
import { Project as FrontendProject } from '@/types';
import { ProjectDetail, IconDetail } from '@/types/project-detail';
import { projectDetail as defaultSeed } from '@/data/projectDetailSeed';

export function mapApiProjectToProjectCard(api: ApiProject): FrontendProject {
  const price = api.price_text || (api.price_min ? `Từ ${api.price_min} tỷ` : 'Liên hệ');
  const location = api.location || api.address || 'Đang cập nhật';
  const type = api.categories && api.categories.length > 0 ? api.categories[0].name : 'Căn hộ';
  
  return {
    id: api.id,
    name: api.name,
    location,
    price,
    image: api.thumbnail || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop',
    badge: api.is_featured ? 'HOT' : undefined,
    status: api.status === 'selling' ? 'selling' : api.status === 'upcoming' ? 'upcoming' : 'done',
    type,
    description: api.description || '',
    slug: api.slug,
  };
}

export function mapApiProjectToProjectDetail(api: ApiProject): ProjectDetail {
  const priceFrom = api.price_text || (api.price_min ? `Từ ${api.price_min} tỷ` : 'Liên hệ');
  const location = api.location || api.address || 'Đang cập nhật';
  const statusLabel = api.status === 'completed' ? 'Đã bàn giao' : (api.status === 'selling' ? 'Đang mở bán' : 'Sắp mở bán');

  // QuickCard mapping
  const quickCard: IconDetail[] = [
    { label: 'Quy mô dự án', value: api.area_size || 'Đang cập nhật', icon: 'LandPlot' },
    { label: 'Sản phẩm', value: api.scale || 'Đang cập nhật', icon: 'Building2' },
    { label: 'Tình trạng', value: statusLabel, icon: 'HardHat' },
    { label: 'Bàn giao dự kiến', value: api.handover_time || (api.handover_year ? `${api.handover_year}` : 'Đang cập nhật'), icon: 'CalendarDays' },
    { label: 'Giá từ', value: priceFrom, icon: 'BadgeDollarSign' },
  ];

  // Facts mapping
  const facts: IconDetail[] = [
    { label: 'Vị trí', value: location, icon: 'MapPin' },
    { label: 'Chủ đầu tư', value: api.developer || 'Masterise Homes', icon: 'Building2' },
    { label: 'Tổng quy mô', value: api.area_size || 'Đang cập nhật', icon: 'LandPlot' },
    { label: 'Loại hình phát triển', value: api.scale || 'Căn hộ cao cấp', icon: 'PanelsTopLeft' },
    { label: 'Sở hữu', value: api.ownership_type || 'Lâu dài', icon: 'ClipboardCheck' },
    { label: 'Pháp lý', value: api.legal_status || 'Sổ hồng từng căn', icon: 'FileCheck2' },
  ];

  // Stats mapping
  const stats = [
    { value: api.area_size || '117,4 ha', label: 'Quy mô đô thị' },
    { value: api.total_units ? `${api.total_units}+` : '2.000+', label: 'Sản phẩm đa dạng' },
    { value: '36+', label: 'Tiện ích đẳng cấp' },
    { value: '10 phút', label: 'Đến trung tâm Quận 1' },
    { value: '20.000+', label: 'Cư dân tương lai' },
  ];

  // Gallery images mapping
  const galleryImages = api.gallery && api.gallery.length > 0
    ? api.gallery
    : [api.thumbnail || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop'];

  // Parse highlights & nearby from JSON or strings safely
  let nearbyPlaces: string[] = [];
  try {
    if (typeof api.nearby_places === 'string') {
      nearbyPlaces = JSON.parse(api.nearby_places);
    } else if (Array.isArray(api.nearby_places)) {
      nearbyPlaces = api.nearby_places;
    }
  } catch (e) {
    console.error('Error parsing nearby_places', e);
  }

  const connectivity = nearbyPlaces.map((place: string) => {
    const parts = place.split(' ');
    if (parts.length >= 2) {
      const time = parts[0] + ' ' + parts[1];
      const label = parts.slice(2).join(' ');
      return { time, label };
    }
    return { time: 'Đang cập nhật', label: place };
  });

  return {
    id: api.id,
    slug: api.slug,
    badge: api.is_featured ? 'DỰ ÁN BIỂU TƯỢNG' : 'DỰ ÁN CAO CẤP',
    name: api.name,
    subtitle: api.description || 'Trung tâm mới của TP. Thủ Đức',
    description: api.content || api.description || '',
    address: api.address || api.location || '',
    heroImage: api.banner_image || api.thumbnail || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop',
    priceFrom,
    quickCard,
    facts,
    stats,
    gallery: {
      label: 'KIẾN TẠO CHUẨN MỰC SỐNG MỚI',
      title: 'KHÔNG GIAN SỐNG ĐẲNG CẤP QUỐC TẾ',
      description: api.description || '',
      images: galleryImages,
    },
    connectivity: connectivity.length > 0 ? connectivity : defaultSeed.connectivity,
    amenities: defaultSeed.amenities, // fallback to seed design amenities
    floorTabs: defaultSeed.floorTabs,
    floorPlans: defaultSeed.floorPlans,
    priceRows: defaultSeed.priceRows,
    policies: defaultSeed.policies,
    timeline: defaultSeed.timeline,
    investmentReasons: defaultSeed.investmentReasons,
    testimonials: defaultSeed.testimonials,
    faqs: defaultSeed.faqs,
    virtualTourUrl: api.virtual_tour_url,
  };
}
