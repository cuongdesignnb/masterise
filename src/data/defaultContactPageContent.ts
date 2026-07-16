import type { ContactPageContent, ContactSectionKey } from "@/types/contact-page";

export const CONTACT_SECTION_KEYS: ContactSectionKey[] = [
  "hero", "commitments", "introduction", "salesTeam", "achievements",
  "contactForm", "departments", "faqs", "cta",
];

export const CONTACT_SECTION_LABELS: Record<ContactSectionKey, string> = {
  hero: "Hero liên hệ",
  commitments: "Cam kết với khách hàng",
  introduction: "Giới thiệu đội ngũ tư vấn",
  salesTeam: "Đội ngũ Sale",
  achievements: "Năng lực & thành tích",
  contactForm: "Form & văn phòng",
  departments: "Bộ phận hỗ trợ",
  faqs: "Câu hỏi thường gặp",
  cta: "CTA cuối trang",
};

export const defaultContactPageContent: ContactPageContent = {
  sectionOrder: [...CONTACT_SECTION_KEYS],
  seo: {
    title: "Liên hệ Masterise Homes | Tư vấn bất động sản cao cấp",
    description: "Kết nối cùng đội ngũ tư vấn để nhận thông tin dự án, bảng giá và lịch tham quan phù hợp.",
    keywords: "liên hệ Masterise Homes, tư vấn bất động sản cao cấp",
    ogTitle: "Liên hệ Masterise Homes",
    ogDescription: "Nhận tư vấn chuyên sâu về các dự án bất động sản cao cấp.",
    ogImage: "",
  },
  hero: {
    enabled: true, sortOrder: 10, eyebrow: "KẾT NỐI CÙNG CHÚNG TÔI",
    title: "Một cuộc trò chuyện đúng lúc có thể mở ra lựa chọn xứng tầm",
    description: "Đội ngũ tư vấn sẵn sàng lắng nghe nhu cầu, chia sẻ thông tin minh bạch và đồng hành cùng Quý khách trong từng quyết định.",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Không gian tư vấn bất động sản cao cấp",
    primaryCta: { label: "Nhận tư vấn ngay", url: "#global-contact-form" },
    secondaryCta: { label: "Khám phá dự án", url: "/du-an" },
    hotlineLine: "Hotline tư vấn trực tiếp", responseLine: "Phản hồi trong giờ làm việc",
    quickInfo: [
      { id: "hero-consulting", label: "Tư vấn", value: "Theo đúng nhu cầu", icon: "HeartHandshake", isActive: true, sortOrder: 10 },
      { id: "hero-information", label: "Thông tin", value: "Minh bạch & cập nhật", icon: "ShieldCheck", isActive: true, sortOrder: 20 },
    ],
  },
  commitments: {
    enabled: true, sortOrder: 20, label: "CAM KẾT DỊCH VỤ",
    title: "Sự an tâm bắt đầu từ thông tin đáng tin cậy",
    description: "Những nguyên tắc xuyên suốt trong quá trình tư vấn và đồng hành cùng khách hàng.",
    items: [
      { id: "commitment-transparent", title: "Thông tin minh bạch", description: "Thông tin dự án được đối chiếu và trình bày rõ ràng.", icon: "ShieldCheck", isActive: true, sortOrder: 10 },
      { id: "commitment-needs", title: "Tư vấn đúng nhu cầu", description: "Giải pháp được chọn lọc dựa trên mục tiêu và ưu tiên thực tế.", icon: "HeartHandshake", isActive: true, sortOrder: 20 },
      { id: "commitment-policy", title: "Chính sách cập nhật", description: "Bảng giá và chính sách bán hàng được cập nhật theo từng thời điểm.", icon: "BadgeCheck", isActive: true, sortOrder: 30 },
      { id: "commitment-journey", title: "Đồng hành dài hạn", description: "Hỗ trợ trước, trong và sau quá trình giao dịch.", icon: "Handshake", isActive: true, sortOrder: 40 },
    ],
  },
  introduction: {
    enabled: true, sortOrder: 30, label: "ĐỘI NGŨ TƯ VẤN",
    title: "Hiểu sản phẩm, thấu nhu cầu, đặt lợi ích dài hạn lên trước",
    paragraphs: [
      "Chúng tôi tập trung vào trải nghiệm tư vấn rõ ràng, chuyên sâu và phù hợp với từng nhu cầu an cư hoặc đầu tư.",
      "Mỗi lựa chọn được phân tích trên nền tảng thông tin sản phẩm, thị trường và mục tiêu dài hạn của khách hàng.",
    ],
    images: [{ id: "introduction-main", url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop", alt: "Đội ngũ tư vấn trao đổi cùng khách hàng", isActive: true, sortOrder: 10 }],
    bullets: [
      { id: "intro-experience", text: "Kinh nghiệm tư vấn bất động sản cao cấp", isActive: true, sortOrder: 10 },
      { id: "intro-market", text: "Hiểu rõ sản phẩm và diễn biến thị trường", isActive: true, sortOrder: 20 },
      { id: "intro-process", text: "Hỗ trợ từ lựa chọn đến thủ tục", isActive: true, sortOrder: 30 },
      { id: "intro-benefit", text: "Ưu tiên lợi ích dài hạn của khách hàng", isActive: true, sortOrder: 40 },
    ],
    cta: { label: "Trao đổi cùng chuyên viên", url: "#global-contact-form" },
  },
  salesTeam: { enabled: true, sortOrder: 40, label: "CHUYÊN VIÊN TƯ VẤN", title: "Đội ngũ Sale đồng hành cùng Quý khách", description: "Lựa chọn chuyên viên phù hợp với khu vực hoặc dự án Quý khách quan tâm.", items: [] },
  achievements: { enabled: true, sortOrder: 50, label: "NĂNG LỰC & DẤU ẤN", title: "Uy tín được xây dựng bằng trải nghiệm thực tế", description: "Các số liệu và dấu mốc chỉ hiển thị sau khi được quản trị viên xác nhận.", metricsEnabled: true, milestonesEnabled: true, metrics: [], milestones: [] },
  contactForm: {
    enabled: true, sortOrder: 60, label: "TƯ VẤN CÁ NHÂN HÓA", title: "Bắt đầu cuộc trò chuyện cùng chúng tôi",
    description: "Để lại thông tin, đội ngũ tư vấn sẽ liên hệ và hỗ trợ Quý khách lựa chọn dự án phù hợp.", officeTitle: "Không gian kết nối & tư vấn",
    hotline: "", email: "", address: "", workingHours: "Thứ Hai – Chủ Nhật, 08:30 – 18:00",
    mapUrl: "", mapEmbedUrl: "", mapImage: "", mapImageAlt: "Bản đồ văn phòng", directionsLabel: "Xem chỉ đường", directionsUrl: "",
  },
  departments: { enabled: true, sortOrder: 70, label: "HỖ TRỢ ĐÚNG NHU CẦU", title: "Kết nối trực tiếp với bộ phận phụ trách", description: "Chọn đúng đầu mối để nhận hỗ trợ nhanh chóng và chính xác.", items: [] },
  faqs: {
    enabled: true, sortOrder: 80, label: "THÔNG TIN HỮU ÍCH", title: "Câu hỏi thường gặp", description: "Một số thông tin giúp Quý khách thuận tiện hơn trước khi kết nối.",
    items: [
      { id: "faq-price", question: "Làm sao để nhận bảng giá mới nhất?", answer: "Quý khách có thể để lại thông tin trong form hoặc gọi hotline để được gửi bảng giá và chính sách theo từng dự án.", isActive: true, sortOrder: 10 },
      { id: "faq-visit", question: "Tôi muốn đặt lịch tham quan dự án?", answer: "Đội ngũ tư vấn sẽ xác nhận dự án, thời gian và hướng dẫn tham quan phù hợp sau khi nhận thông tin đăng ký.", isActive: true, sortOrder: 20 },
      { id: "faq-support", question: "Sau giao dịch có được tiếp tục hỗ trợ?", answer: "Bộ phận phụ trách sẽ tiếp tục đồng hành và hỗ trợ các thông tin liên quan trong phạm vi dịch vụ.", isActive: true, sortOrder: 30 },
    ],
  },
  cta: {
    enabled: true, sortOrder: 90, label: "SẴN SÀNG ĐỒNG HÀNH", title: "Tìm một lựa chọn phù hợp bắt đầu từ cuộc trao đổi chân thành",
    description: "Kết nối cùng đội ngũ tư vấn để nhận thông tin phù hợp với nhu cầu và kế hoạch của Quý khách.",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop", imageAlt: "Không gian sống cao cấp",
    primaryCta: { label: "Nhận tư vấn ngay", url: "#global-contact-form" }, secondaryCta: { label: "Khám phá dự án", url: "/du-an" },
  },
};
