export interface AboutPageCollectionItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  link: string;
}

export const defaultCollections: AboutPageCollectionItem[] = [
  {
    id: "brand-residence",
    title: "Brand Residence",
    subtitle: "Bất động sản hàng hiệu hàng đầu thế giới",
    description: "Tiên phong kiến tạo chuẩn sống hiệu xa xỉ bậc nhất tại Việt Nam. Sự hợp tác chiến lược cùng tập đoàn Marriott International mang đến những căn hộ mang tính di sản, được vận hành chuyên nghiệp theo tiêu chuẩn toàn cầu.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop",
    features: [
      "Quản lý bởi Marriott & Ritz-Carlton",
      "Vị trí độc bản tại các trung tâm tài chính",
      "Đặc quyền thượng lưu chuẩn khách sạn 5 sao"
    ],
    link: "/du-an?q=grand+marina"
  },
  {
    id: "lumiere-series",
    title: "Lumiere Series",
    subtitle: "Phong cách sống tinh tế và duy mỹ",
    description: "Bộ sưu tập các công trình căn hộ cao cấp với thiết kế kiến trúc xanh độc đáo mặt ngoài. Lumiere Series mang lại không gian sống hòa quyện cùng thiên nhiên, đề cao tính thẩm mỹ và sức khỏe thể chất lẫn tinh thần.",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop",
    features: [
      "Kiến trúc xanh đương đại biểu tượng",
      "Hệ thống tiện ích chăm sóc sức khỏe",
      "Nội thất tinh tế nhập khẩu cao cấp"
    ],
    link: "/du-an?q=lumiere"
  },
  {
    id: "masteri-collection",
    title: "Masteri Collection",
    subtitle: "Nâng tầm trải nghiệm sống hiện đại",
    description: "Không gian sống chuẩn quốc tế kết hợp cùng tiện nghi hiện đại tại vị trí trung tâm các siêu đô thị. Masteri Collection cung cấp các căn hộ lý tưởng cho gia đình năng động với giá trị bền vững và cộng đồng văn minh.",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1200&auto=format&fit=crop",
    features: [
      "Không gian sống tối ưu, ngập tràn ánh sáng",
      "Vị trí kết nối giao thông đồng bộ",
      "Tiêu chuẩn bàn giao chuẩn quốc tế"
    ],
    link: "/du-an?q=masteri"
  }
];
