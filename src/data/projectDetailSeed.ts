import type { ProjectDetail } from "@/types/project-detail";

export const projectDetail: ProjectDetail = {
  slug: "the-global-city",
  badge: "DỰ ÁN BIỂU TƯỢNG",
  name: "THE GLOBAL CITY",
  subtitle: "Trung tâm mới của TP. Thủ Đức",
  description:
    "Đô thị biểu tượng quy mô quốc tế do Masterise Homes phát triển, kiến tạo chuẩn mực sống mới tại trung tâm TP. Thủ Đức, điểm đến mới của cộng đồng tinh hoa.",
  address: "Đỗ Xuân Hợp, P. An Phú, TP. Thủ Đức, TP. HCM",
  heroImage:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=88&w=2000&auto=format&fit=crop",
  priceFrom: "8,9 tỷ/căn",
  quickCard: [
    { label: "Quy mô dự án", value: "117,4 ha", icon: "LandPlot" },
    {
      label: "Sản phẩm",
      value: "Nhà phố, Biệt thự, Căn hộ, Shophouse",
      icon: "Building2",
    },
    { label: "Tình trạng", value: "Đang thi công", icon: "HardHat" },
    { label: "Bàn giao dự kiến", value: "Q1/2026", icon: "CalendarDays" },
    { label: "Giá từ", value: "8,9 tỷ/căn", icon: "BadgeDollarSign" },
  ],
  facts: [
    { label: "Vị trí", value: "Trung tâm TP. Thủ Đức", icon: "MapPin" },
    { label: "Chủ đầu tư", value: "Masterise Homes", icon: "Building2" },
    { label: "Tổng quy mô", value: "117,4 ha", icon: "LandPlot" },
    { label: "Loại hình phát triển", value: "Đô thị phức hợp", icon: "PanelsTopLeft" },
    { label: "Sở hữu", value: "Lâu dài", icon: "ClipboardCheck" },
    { label: "Pháp lý", value: "Sổ hồng từng căn", icon: "FileCheck2" },
  ],
  stats: [
    { value: "117,4 ha", label: "Quy mô đô thị" },
    { value: "2.000+", label: "Sản phẩm đa dạng" },
    { value: "36+", label: "Tiện ích đẳng cấp" },
    { value: "10 phút", label: "Đến trung tâm Quận 1" },
    { value: "20.000+", label: "Cư dân tương lai" },
  ],
  gallery: {
    label: "KIẾN TẠO CHUẨN MỰC SỐNG MỚI",
    title: "KHÔNG GIAN SỐNG ĐẲNG CẤP QUỐC TẾ",
    description:
      "Kiến tạo chuẩn sống mới với không gian hiện đại, xanh mát và đầy cảm hứng bên dòng sông Rạch Chiếc.",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=88&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=88&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=88&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=88&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=88&w=900&auto=format&fit=crop",
    ],
  },
  connectivity: [
    { time: "2 phút", label: "Đến đường Liên Phường" },
    { time: "5 phút", label: "Đến tuyến Metro Thủ Thiêm - Long Thành" },
    { time: "10 phút", label: "Đến trung tâm Quận 1" },
    { time: "15 phút", label: "Đến sân bay Quốc tế Long Thành" },
    { time: "20 phút", label: "Đến Khu Công nghệ cao TP. Thủ Đức" },
  ],
  amenities: [
    {
      title: "Công viên trung tâm",
      description: "Mảng xanh rộng lớn",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=88&w=900&auto=format&fit=crop",
      icon: "Trees",
    },
    {
      title: "Hồ cảnh quan",
      description: "Kênh đào và mặt nước",
      image:
        "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=88&w=900&auto=format&fit=crop",
      icon: "Waves",
    },
    {
      title: "Trường học liên cấp",
      description: "Chuẩn quốc tế",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=88&w=900&auto=format&fit=crop",
      icon: "GraduationCap",
    },
    {
      title: "Trung tâm thương mại",
      description: "Phố thương mại",
      image:
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=88&w=900&auto=format&fit=crop",
      icon: "Store",
    },
    {
      title: "Clubhouse",
      description: "Khu thể thao",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=88&w=900&auto=format&fit=crop",
      icon: "Dumbbell",
    },
    {
      title: "An ninh đa lớp",
      description: "Vận hành 24/7",
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=88&w=900&auto=format&fit=crop",
      icon: "ShieldCheck",
    },
  ],
  floorTabs: ["Nhà phố", "Biệt thự", "Căn hộ cao cấp", "Shophouse"],
  floorPlans: [
    {
      name: "Nhà phố liên kế",
      area: "80 - 120 m²",
      totalArea: "210 - 270 m²",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=88&w=800&auto=format&fit=crop",
    },
    {
      name: "Nhà phố vườn",
      area: "100 - 140 m²",
      totalArea: "250 - 300 m²",
      image:
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=88&w=800&auto=format&fit=crop",
    },
    {
      name: "Nhà phố góc",
      area: "120 - 160 m²",
      totalArea: "260 - 320 m²",
      image:
        "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?q=88&w=800&auto=format&fit=crop",
    },
    {
      name: "Nhà phố shophouse",
      area: "90 - 150 m²",
      totalArea: "230 - 350 m²",
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=88&w=800&auto=format&fit=crop",
    },
  ],
  priceRows: [
    ["Nhà phố liên kế", "80 - 120", "8,9"],
    ["Nhà phố vườn", "100 - 140", "11,5"],
    ["Nhà phố góc", "120 - 160", "13,8"],
    ["Nhà phố shophouse", "90 - 150", "16,5"],
    ["Biệt thự song lập", "160 - 200", "22,0"],
    ["Biệt thự đơn lập", "250 - 400", "35,0"],
    ["Căn hộ cao cấp", "50 - 120", "6,5"],
  ],
  policies: [
    {
      title: "Thanh toán linh hoạt",
      description: "Kéo dài đến 36 tháng",
      icon: "CalendarDays",
    },
    {
      title: "Hỗ trợ vay tối đa 70%",
      description: "Lãi suất 0% đến 24 tháng",
      icon: "Building2",
    },
    {
      title: "Chiết khấu lên đến 8%",
      description: "Dành cho khách hàng thân thiết",
      icon: "BadgeDollarSign",
    },
    {
      title: "Quà tặng tân gia giá trị",
      description: "Khi nhận nhà đúng hạn",
      icon: "Sparkles",
    },
  ],
  timeline: [
    { date: "Q4/2023", title: "Khởi công dự án" },
    { date: "Q2/2024", title: "Hoàn thành hạ tầng phân khu 1" },
    { date: "Q4/2024", title: "Thi công xây dựng phần thô" },
    { date: "Q2/2025", title: "Hoàn thiện mặt ngoài phân khu 1" },
    { date: "Q1/2026", title: "Dự kiến bàn giao phân khu 1" },
  ],
  investmentReasons: [
    { title: "Vị trí trung tâm", description: "TP. Thủ Đức", icon: "MapPin" },
    {
      title: "Chủ đầu tư uy tín",
      description: "Masterise Homes",
      icon: "Building2",
    },
    { title: "Quy hoạch đồng bộ", description: "Bền vững", icon: "Network" },
    {
      title: "Tiện ích đẳng cấp",
      description: "Chuẩn quốc tế",
      icon: "Sparkles",
    },
    { title: "Tiềm năng tăng giá", description: "Vượt trội", icon: "TrendingUp" },
    {
      title: "Pháp lý minh bạch",
      description: "Sở hữu lâu dài",
      icon: "FileCheck2",
    },
  ],
  testimonials: [
    {
      name: "Anh Minh Tuấn",
      role: "Doanh nhân",
      content:
        "Tôi ấn tượng với quy hoạch bài bản và tiện ích đẳng cấp của The Global City. Đây chắc chắn sẽ là nơi đáng sống bậc nhất tại TP. Thủ Đức.",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=88&w=300&auto=format&fit=crop",
    },
    {
      name: "Chị Thu Hương",
      role: "Giám đốc Marketing",
      content:
        "Thiết kế hiện đại, không gian xanh nhiều, tiện ích đầy đủ, phù hợp cho gia đình trẻ như chúng tôi.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=88&w=300&auto=format&fit=crop",
    },
    {
      name: "Anh Hoàng Nam",
      role: "Nhà đầu tư",
      content:
        "Vị trí kết nối cực kỳ thuận tiện, tiềm năng tăng giá trong tương lai là điều không thể bỏ qua.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=88&w=300&auto=format&fit=crop",
    },
  ],
  faqs: [
    {
      question: "Dự án The Global City nằm ở đâu?",
      answer:
        "Dự án tọa lạc tại khu vực Đỗ Xuân Hợp, phường An Phú, TP. Thủ Đức, TP. HCM.",
    },
    {
      question: "Thời gian bàn giao dự kiến là khi nào?",
      answer:
        "Phân khu đầu tiên dự kiến bàn giao từ Q1/2026, tùy theo tiến độ từng sản phẩm.",
    },
    {
      question: "Phương thức thanh toán như thế nào?",
      answer:
        "Dự án có chính sách thanh toán linh hoạt, hỗ trợ vay ngân hàng và nhiều ưu đãi theo từng thời điểm.",
    },
    {
      question: "Dự án có hỗ trợ vay ngân hàng không?",
      answer:
        "Có. Khách hàng có thể được hỗ trợ vay lên đến 70% giá trị sản phẩm tùy hồ sơ và chính sách ngân hàng.",
    },
    {
      question: "Pháp lý của dự án như thế nào?",
      answer:
        "Dự án định hướng pháp lý minh bạch, sở hữu lâu dài đối với các sản phẩm đủ điều kiện theo quy định.",
    },
    {
      question: "Có thể tham quan nhà mẫu ở đâu?",
      answer:
        "Khách hàng có thể đăng ký lịch tham quan nhà mẫu qua biểu mẫu tư vấn trên website.",
    },
  ],
  id: 1,
  virtualTourUrl: "https://kuula.co/share/collection/7K98F",
};

