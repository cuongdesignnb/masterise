export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://masterise-homes.net.vn").replace(/\/$/, "");

export const SITE_NAME = "Masterise Homes";

export const SITE_DESCRIPTION =
  "Masterise Homes - thông tin dự án bất động sản cao cấp, căn hộ hạng sang, chính sách bán hàng và cơ hội đầu tư tại Việt Nam.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;
export const OPERATOR_LOGO = `${SITE_URL}/brand/operator-logo-512.png`;

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
