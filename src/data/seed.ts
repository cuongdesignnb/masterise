import type {
  NavItem,
  HeroSlide,
  SearchFilter,
  StatItem,
  Project,
  CollectionItem,
  InvestmentItem,
  PropertyTypeItem,
  StatusColumn,
  BenefitItem,
  AmenityItem,
  TestimonialItem,
  PartnerItem,
  NewsItem,
  FAQItem,
  FooterColumn,
} from "@/types";

export const navigation: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Dự án", href: "/du-an" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Đầu tư", href: "/dau-tu" },
  { label: "Liên hệ", href: "/lien-he" },
];

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    titleLines: ["NÂNG TẦM", "PHONG CÁCH SỐNG"],
    highlight: "KIẾN TẠO GIÁ TRỊ BỀN VỮNG",
    description:
      "Masterise Homes mang đến những bất động sản hàng hiệu với tầm nhìn quốc tế, kiến tạo cộng đồng thịnh vượng và phong cách sống xứng tầm.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 2,
    titleLines: ["DẤU ẤN", "BẤT ĐỘNG SẢN HÀNG HIỆU"],
    highlight: "CHUẨN SỐNG QUỐC TẾ",
    description:
      "Mỗi dự án là một biểu tượng kiến trúc, kết nối vị trí chiến lược, tiện ích toàn diện và giá trị đầu tư dài hạn.",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 3,
    titleLines: ["KHÔNG GIAN", "SỐNG THỊNH VƯỢNG"],
    highlight: "DÀNH CHO CỘNG ĐỒNG TINH HOA",
    description:
      "Trải nghiệm hệ sinh thái sống đẳng cấp, dịch vụ quản lý chuyên nghiệp và cộng đồng cư dân văn minh.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  },
];

export const searchFilters: SearchFilter[] = [
  { id: "location", label: "Vị trí", placeholder: "Chọn khu vực" },
  { id: "price", label: "Khoảng giá", placeholder: "Chọn khoảng giá" },
  { id: "type", label: "Loại hình", placeholder: "Chọn loại hình" },
  { id: "status", label: "Trạng thái", placeholder: "Tất cả dự án" },
  { id: "area", label: "Diện tích", placeholder: "Chọn diện tích" },
];

export const stats: StatItem[] = [
  { id: 1, value: 50, suffix: "+", label: "DỰ ÁN CAO CẤP", icon: "Building2" },
  { id: 2, value: 15000, suffix: "+", label: "NHÀ ĐẦU TƯ TIN TƯỞNG", icon: "Handshake" },
  { id: 3, value: 30000, suffix: "+", label: "GIAO DỊCH THÀNH CÔNG", icon: "BadgeCheck" },
  { id: 4, value: 10, suffix: "+", label: "NĂM KINH NGHIỆM", icon: "ShieldCheck" },
];

export const hotProjects: Project[] = [
  {
    id: 1,
    name: "The Global City",
    location: "TP. Thủ Đức, TP. HCM",
    price: "Từ 7.8 tỷ/căn",
    badge: "HOT",
    status: "hot",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Lumière Riverside",
    location: "Thảo Điền, TP. Thủ Đức",
    price: "Từ 7.9 tỷ/căn",
    badge: "Best Seller",
    status: "best-seller",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Grand Marina, Saigon",
    location: "Quận 1, TP. HCM",
    price: "Từ 25.0 tỷ/căn",
    badge: "Sắp mở bán",
    status: "upcoming",
    type: "Branded Residences",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Masteri Centre Point",
    location: "Vinhomes Grand Park",
    price: "Từ 5.5 tỷ/căn",
    badge: "HOT",
    status: "hot",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  },
];

export const featuredProjects: Project[] = [
  {
    id: 1,
    name: "The Rivus",
    location: "Quận 2, TP. Thủ Đức",
    price: "Từ 50.0 tỷ/căn",
    type: "Biệt thự",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "The Metropole Thủ Thiêm",
    location: "TP. Thủ Đức",
    price: "Từ 20.0 tỷ/căn",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Lumière Boulevard",
    location: "Vinhomes Grand Park",
    price: "Từ 4.5 tỷ/căn",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "SOHO Heritage West Lake",
    location: "Tây Hồ, Hà Nội",
    price: "Từ 18.0 tỷ/căn",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Masteri Waterfront",
    location: "Ocean Park 1, Hà Nội",
    price: "Từ 3.9 tỷ/căn",
    type: "Căn hộ",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Grand World Phú Quốc",
    location: "Phú Quốc",
    price: "Từ 6.5 tỷ/căn",
    type: "Nghỉ dưỡng",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=1200&auto=format&fit=crop",
  },
];




export const investmentOpportunities: InvestmentItem[] = [
  {
    id: 1,
    title: "Tiềm năng tăng giá",
    description: "Các vị trí chiến lược, hạ tầng phát triển mạnh mẽ",
    icon: "TrendingUp",
  },
  {
    id: 2,
    title: "Pháp lý minh bạch",
    description: "Sổ hồng rõ ràng, quy trình an toàn",
    icon: "FileCheck2",
  },
  {
    id: 3,
    title: "Vị trí chiến lược",
    description: "Kết nối thuận tiện, tiện ích đa dạng",
    icon: "MapPin",
  },
  {
    id: 4,
    title: "Lợi nhuận cho thuê",
    description: "Tỷ suất sinh lời hấp dẫn, khai thác bền vững",
    icon: "CircleDollarSign",
  },
];

export const propertyTypes: PropertyTypeItem[] = [
  { id: 1, title: "Căn hộ", icon: "Building2" },
  { id: 2, title: "Biệt thự", icon: "Landmark" },
  { id: 3, title: "Nhà phố", icon: "Home" },
  { id: 4, title: "Shophouse", icon: "Store" },
  { id: 5, title: "Nghỉ dưỡng", icon: "Palmtree" },
  { id: 6, title: "Văn phòng", icon: "BriefcaseBusiness" },
];

export const projectStatusColumns: StatusColumn[] = [
  {
    id: "upcoming",
    title: "SẮP MỞ BÁN",
    projects: [
      {
        id: 1,
        name: "The Infinity",
        location: "TP. Thủ Đức",
        badge: "Sắp mở bán",
        image:
          "https://images.unsplash.com/photo-1605146769289-440113cc3d00?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: 2,
        name: "Lumière East",
        location: "TP. Thủ Đức",
        badge: "Sắp mở bán",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: 3,
        name: "Masteri Sky Quận 7",
        location: "Quận 7",
        badge: "Sắp mở bán",
        image:
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "selling",
    title: "ĐANG MỞ BÁN",
    projects: [
      {
        id: 4,
        name: "The Global City",
        location: "TP. Thủ Đức",
        price: "Từ 7.8 tỷ/căn",
        image:
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: 5,
        name: "Masteri Centre Point",
        location: "Vinhomes Grand Park",
        price: "Từ 5.5 tỷ/căn",
        image:
          "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: 6,
        name: "Lumière Riverside",
        location: "Thảo Điền, TP. Thủ Đức",
        price: "Từ 7.8 tỷ/căn",
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "done",
    title: "ĐÃ BÀN GIAO",
    projects: [
      {
        id: 7,
        name: "Masteri Thảo Điền",
        location: "TP. Thủ Đức",
        badge: "Đã bàn giao",
        image:
          "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: 8,
        name: "Masteri Waterfront",
        location: "Ocean Park 1, Hà Nội",
        badge: "Đã bàn giao",
        image:
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: 9,
        name: "The Rivus Elie Saab",
        location: "Quận 2, TP. Thủ Đức",
        badge: "Đã bàn giao",
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
];

export const whyChooseUs: BenefitItem[] = [
  {
    id: 1,
    title: "Uy tín thương hiệu",
    description: "Nhà phát triển bất động sản hàng hiệu tiên phong",
    icon: "Award",
  },
  {
    id: 2,
    title: "Thiết kế tinh tế",
    description: "Kiến trúc đẳng cấp, cảm hứng quốc tế",
    icon: "PencilRuler",
  },
  {
    id: 3,
    title: "Tiện ích vượt trội",
    description: "Hệ sinh thái tiện ích chuẩn quốc tế",
    icon: "Sparkles",
  },
  {
    id: 4,
    title: "Quản lý chuyên nghiệp",
    description: "Dịch vụ quản lý vận hành chuẩn mực",
    icon: "ConciergeBell",
  },
  {
    id: 5,
    title: "Cộng đồng văn minh",
    description: "Cộng đồng cư dân thịnh vượng",
    icon: "UsersRound",
  },
];

export const amenities: AmenityItem[] = [
  {
    id: 1,
    title: "Hồ bơi vô cực",
    image:
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Phòng gym hiện đại",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Khu thương mại",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Công viên xanh",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Trường học quốc tế",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Quản lý chuẩn quốc tế",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=900&auto=format&fit=crop",
  },
];

export const testimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Nguyễn Thanh Hưng",
    role: "Nhà đầu tư",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop",
    content:
      "Tôi đánh giá cao tầm nhìn và uy tín của Masterise Homes. Dự án luôn có vị trí đẹp, chất lượng vượt trội và tiềm năng tăng giá cao.",
  },
  {
    id: 2,
    name: "Trần Minh Anh",
    role: "Khách hàng",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    content:
      "Không gian sống tại Masterise luôn mang đến trải nghiệm khác biệt, tiện ích đẳng cấp và cộng đồng văn minh.",
  },
];

export const partners: PartnerItem[] = [
  { id: 1, name: "AECOM" },
  { id: 2, name: "HBA" },
  { id: 3, name: "ARUP" },
  { id: 4, name: "SAVILLS" },
  { id: 5, name: "CBRE" },
  { id: 6, name: "JLL" },
];

export const news: NewsItem[] = [
  {
    id: 1,
    title: "Thị trường BĐS 2024: Xu hướng & triển vọng",
    date: "20/05/2024",
    tag: "Thị trường",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Lumière Riverside: Tiến độ xây dựng",
    date: "18/05/2024",
    tag: "Dự án",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "10 tiêu chí chọn nhà đáng sống",
    date: "15/05/2024",
    tag: "Phong cách sống",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Hướng dẫn vay mua nhà lãi suất ưu đãi",
    date: "12/05/2024",
    tag: "Cẩm nang",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=900&auto=format&fit=crop",
  },
];

export const faqs: FAQItem[] = [
  {
    id: 1,
    question: "Quy trình mua nhà tại Masterise Homes như thế nào?",
    answer:
      "Khách hàng lựa chọn dự án phù hợp, đăng ký tư vấn, tham quan nhà mẫu, nhận bảng giá, đặt cọc và ký kết hợp đồng theo quy trình minh bạch.",
  },
  {
    id: 2,
    question: "Các phương thức thanh toán khi mua nhà?",
    answer:
      "Khách hàng có thể thanh toán theo tiến độ chuẩn, thanh toán sớm hoặc sử dụng gói hỗ trợ tài chính từ ngân hàng đối tác.",
  },
  {
    id: 3,
    question: "Chính sách hỗ trợ vay ngân hàng có những ưu đãi gì?",
    answer:
      "Các dự án có thể áp dụng chính sách hỗ trợ lãi suất, ân hạn nợ gốc và tư vấn hồ sơ vay tùy từng thời điểm mở bán.",
  },
  {
    id: 4,
    question: "Thời gian bàn giao và bảo hành sản phẩm?",
    answer:
      "Thời gian bàn giao tùy từng dự án. Chính sách bảo hành và bảo trì được công bố rõ trong hợp đồng mua bán.",
  },
];

export const accountBenefits = [
  "Lưu dự án yêu thích",
  "Nhận thông báo ưu tiên",
  "Quản lý lịch hẹn dễ dàng",
  "Ưu đãi dành riêng cho thành viên",
];

export const footerColumns: FooterColumn[] = [
  {
    title: "VỀ CHÚNG TÔI",
    links: [
      { label: "Giới thiệu", href: "#" },
      { label: "Tầm nhìn & sứ mệnh", href: "#" },
      { label: "Lịch sử phát triển", href: "#" },
      { label: "Giải thưởng", href: "#" },
      { label: "Tin tức", href: "#" },
    ],
  },
  {
    title: "DỰ ÁN",
    links: [
      { label: "Dự án nổi bật", href: "#" },
      { label: "Dự án sắp mở bán", href: "#" },
      { label: "Dự án đang mở bán", href: "#" },
      { label: "Dự án đã bàn giao", href: "#" },
      { label: "Tất cả dự án", href: "#" },
    ],
  },
  {
    title: "HỖ TRỢ",
    links: [
      { label: "Trung tâm hỗ trợ", href: "#" },
      { label: "Câu hỏi thường gặp", href: "#" },
      { label: "Chính sách bảo mật", href: "#" },
      { label: "Điều khoản sử dụng", href: "#" },
    ],
  },
];

export const contactInfo = {
  phone: "1900 888 999",
  email: "info@masterisehomes.com",
  address: "Tòa nhà Masterise, 41-45 Lê Duẩn, P. Bến Nghé, Quận 1, TP. HCM",
};
