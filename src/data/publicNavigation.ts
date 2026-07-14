import type { FooterColumn, NavItem } from "@/types";

export const publicNavigation: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Dự án", href: "/du-an" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Đầu tư", href: "/dau-tu" },
  { label: "Liên hệ", href: "/lien-he" },
];

export const publicFooterColumns: FooterColumn[] = [
  {
    title: "MASTERISE HOMES",
    links: publicNavigation,
  },
  {
    title: "DỰ ÁN",
    links: [
      { label: "Căn hộ cao cấp", href: "/du-an?category=can-ho-cao-cap" },
      { label: "Biệt thự & dinh thự", href: "/du-an?category=biet-thu-dinh-thu" },
      { label: "Sắp mở bán", href: "/du-an?project_status=coming_soon" },
      { label: "Đang mở bán", href: "/du-an?project_status=selling" },
    ],
  },
  {
    title: "THÔNG TIN",
    links: [
      { label: "Tin tức", href: "/tin-tuc" },
      { label: "Đầu tư", href: "/dau-tu" },
      { label: "Chuyên trang", href: "/chuyen-trang" },
      { label: "Chính sách bảo mật", href: "/chuyen-trang/chinh-sach-bao-mat" },
      { label: "Điều khoản sử dụng", href: "/chuyen-trang/dieu-khoan-su-dung" },
    ],
  },
];
