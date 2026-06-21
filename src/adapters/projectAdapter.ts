import { Project as ApiProject } from '@/types/api';
import { Project as FrontendProject } from '@/types';
import { ProjectDetail, IconDetail } from '@/types/project-detail';
import { projectDetail as defaultSeed } from '@/data/projectDetailSeed';
import { getSalesStatusLabel } from '@/lib/salesStatus';

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
    sales_status: api.sales_status,
  };
}

export function mapApiProjectToProjectDetail(api: ApiProject): ProjectDetail {
  const priceFrom = api.price_text || (api.price_min ? `Từ ${api.price_min} tỷ` : 'Liên hệ');
  const location = api.location || api.address || 'Đang cập nhật';
  const statusLabel = getSalesStatusLabel(api.sales_status);

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
    { value: api.region === 'Quận 1' ? '1 phút' : '10 phút', label: api.region === 'Quận 1' ? 'Đến ga Metro Ba Son' : 'Đến trung tâm Quận 1' },
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

  // Dynamic Amenities mapping
  const amenityCatalog: Record<string, { title: string; description: string; image: string; icon: any }> = {
    Trees: {
      title: 'Công viên xanh',
      description: 'Mảng xanh mát lành rộng lớn',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop',
      icon: 'Trees'
    },
    Waves: {
      title: 'Hồ bơi tràn bờ',
      description: 'Hồ bơi vô cực và mặt nước cảnh quan',
      image: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=80&w=900&auto=format&fit=crop',
      icon: 'Waves'
    },
    GraduationCap: {
      title: 'Trường học liên cấp',
      description: 'Trường học chuẩn quốc tế',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=900&auto=format&fit=crop',
      icon: 'GraduationCap'
    },
    Store: {
      title: 'Trung tâm mua sắm',
      description: 'Khu shophouse & TTTM sầm uất',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=900&auto=format&fit=crop',
      icon: 'Store'
    },
    Dumbbell: {
      title: 'Phòng gym hiện đại',
      description: 'Khu thể thao phức hợp đa năng',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop',
      icon: 'Dumbbell'
    },
    ShieldCheck: {
      title: 'An ninh đa lớp 24/7',
      description: 'Hệ thống kiểm soát an ninh tối tân',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=900&auto=format&fit=crop',
      icon: 'ShieldCheck'
    }
  };

  const projectAmenities = (api.amenities && Array.isArray(api.amenities) && api.amenities.length > 0)
    ? api.amenities.map(key => amenityCatalog[key]).filter(Boolean)
    : defaultSeed.amenities;

  // Dynamic Policies mapping
  const policies = [
    {
      title: 'Chính sách thanh toán',
      description: api.payment_policy || 'Thanh toán giãn tiến độ linh hoạt.',
      icon: 'CalendarDays' as const
    },
    {
      title: 'Chính sách bán hàng',
      description: api.sales_policy || 'Chiết khấu hấp dẫn và hỗ trợ vay ngân hàng.',
      icon: 'BadgeDollarSign' as const
    },
    {
      title: 'Chính sách giữ chỗ',
      description: api.booking_policy || 'Đặt chỗ trực tiếp nhận ưu tiên chọn căn đẹp.',
      icon: 'ClipboardCheck' as const
    }
  ];

  // Dynamic FAQs mapping
  const projectFaqs = [
    {
      question: `Dự án ${api.name} nằm ở đâu?`,
      answer: `Dự án tọa lạc tại khu vực ${api.location || api.address || 'Đang cập nhật'}.`
    },
    {
      question: `Thời gian bàn giao dự kiến của ${api.name} là khi nào?`,
      answer: `Dự án dự kiến bàn giao vào ${api.handover_time || (api.handover_year ? `${api.handover_year}` : 'Đang cập nhật')}.`
    },
    {
      question: `Chủ đầu tư phát triển dự án ${api.name} là ai?`,
      answer: `Dự án được đầu tư và phát triển bởi ${api.developer || 'Masterise Homes'}.`
    },
    {
      question: `Hình thức sở hữu và pháp lý của ${api.name} như thế nào?`,
      answer: `Sản phẩm tại dự án có pháp lý ${api.legal_status || 'Sổ hồng từng căn'}, hình thức sở hữu ${api.ownership_type || 'Lâu dài'} theo quy định.`
    },
    {
      question: `Quy mô dự án và các loại hình sản phẩm của ${api.name}?`,
      answer: `Dự án có tổng quy mô ${api.area_size || 'Đang cập nhật'}, phát triển các sản phẩm: ${api.scale || 'Căn hộ cao cấp'}.`
    }
  ];

  // Dynamic Timeline mapping
  const projectTimeline = [
    { date: '2023', title: 'Khởi công và chuẩn bị mặt bằng' },
    { date: '2024', title: 'Thi công phần móng và kết cấu hầm' },
    { date: '2025', title: 'Thi công cất nóc và hoàn thiện cơ bản' },
    { date: api.handover_time || (api.handover_year ? `${api.handover_year}` : '2026'), title: `Bàn giao căn hộ và hạ tầng tiện ích` }
  ];

  // Dynamic Investment Reasons
  const investmentReasons = [
    { title: 'Vị trí đắc địa', description: api.region || api.location || 'Khu vực tiềm năng', icon: 'MapPin' as const },
    { title: 'Chủ đầu tư uy tín', description: api.developer || 'Masterise Homes', icon: 'Building2' as const },
    { title: 'Thiết kế & Quy hoạch', description: api.scale || 'Hiện đại đẳng cấp', icon: 'Network' as const },
    { title: 'Pháp lý an toàn', description: api.legal_status || 'Lâu dài', icon: 'FileCheck2' as const },
    { title: 'Tiềm năng tăng giá', description: 'Vượt trội theo thời gian', icon: 'TrendingUp' as const }
  ];

  // Dynamic Floor plans & Tabs & Price rows mapping
  const scaleStr = api.scale || '';
  const floorTabs: string[] = [];
  const floorPlans: any[] = [];
  const priceRows: [string, string, string][] = [];

  if (scaleStr.includes('Căn hộ') || scaleStr.includes('Penthouse') || scaleStr.includes('Duplex')) {
    floorTabs.push('Căn hộ');
    floorPlans.push({
      name: 'Căn hộ tiêu chuẩn',
      area: api.area_min ? `${api.area_min} m²` : '50 - 120 m²',
      totalArea: api.area_max ? `${api.area_max} m²` : '60 - 130 m²',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=88&w=800&auto=format&fit=crop'
    });
    priceRows.push(['Căn hộ tiêu chuẩn', api.area_min ? `${api.area_min} - ${api.area_max}` : '50 - 120', api.price_text || 'Liên hệ']);
  }
  if (scaleStr.includes('Nhà phố') || scaleStr.includes('Shophouse')) {
    floorTabs.push('Nhà phố');
    floorPlans.push({
      name: 'Nhà phố thương mại',
      area: '80 - 150 m²',
      totalArea: '200 - 350 m²',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=88&w=800&auto=format&fit=crop'
    });
    priceRows.push(['Nhà phố thương mại', '80 - 150', api.price_text || 'Liên hệ']);
  }
  if (scaleStr.includes('Biệt thự') || scaleStr.includes('Dinh thự')) {
    floorTabs.push('Biệt thự');
    floorPlans.push({
      name: 'Biệt thự cao cấp',
      area: '200 - 400 m²',
      totalArea: '250 - 500 m²',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=88&w=800&auto=format&fit=crop'
    });
    priceRows.push(['Biệt thự cao cấp', '200 - 400', api.price_text || 'Liên hệ']);
  }

  // Fallbacks if empty
  if (floorTabs.length === 0) {
    floorTabs.push('Căn hộ');
    floorPlans.push({
      name: 'Căn hộ cao cấp',
      area: '55 - 110 m²',
      totalArea: '60 - 120 m²',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=88&w=800&auto=format&fit=crop'
    });
    priceRows.push(['Căn hộ cao cấp', '55 - 110', api.price_text || 'Liên hệ']);
  }

  return {
    id: api.id,
    slug: api.slug,
    badge: api.is_featured ? 'DỰ ÁN BIỂU TƯỢNG' : 'DỰ ÁN CAO CẤP',
    salesStatus: getSalesStatusLabel(api.sales_status),
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
    amenities: projectAmenities,
    floorTabs,
    floorPlans,
    priceRows,
    policies,
    timeline: projectTimeline,
    investmentReasons,
    testimonials: defaultSeed.testimonials,
    faqs: projectFaqs,
    virtualTourUrl: api.virtual_tour_url,
    mapImageUrl: api.map_image_url,
    locationDescription: api.location_description,
  };
}
