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
      { label: "Masterise Collection", href: "/du-an?category=masterise-colletion" },
      { label: "Lumiere Series", href: "/du-an?category=lumiere-series" },
      { label: "Sắp mở bán", href: "/du-an?sales_status=coming_soon" },
      { label: "Đang mở bán", href: "/du-an?sales_status=selling" },
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
