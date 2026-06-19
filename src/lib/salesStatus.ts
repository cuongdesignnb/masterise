/**
 * Shared sales status label mapping.
 * Used across homepage cards, project detail, admin, and filters.
 */
export const SALES_STATUS_LABELS: Record<string, string> = {
  coming_soon: "Sắp mở bán",
  selling: "Đang mở bán",
  handing_over: "Đang bàn giao",
  handover: "Đã bàn giao",
};

/**
 * Color config for sales status badges.
 * Returns Tailwind-friendly class strings.
 */
export const SALES_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  coming_soon: { bg: "bg-amber-500/90", text: "text-white" },
  selling: { bg: "bg-emerald-600/90", text: "text-white" },
  handing_over: { bg: "bg-sky-600/90", text: "text-white" },
  handover: { bg: "bg-champagne/90", text: "text-ink-deep" },
};

export function getSalesStatusLabel(status: string | undefined | null): string {
  if (!status) return "Đang cập nhật";
  return SALES_STATUS_LABELS[status] || "Đang cập nhật";
}

export function getSalesStatusColor(status: string | undefined | null) {
  if (!status) return SALES_STATUS_COLORS.coming_soon;
  return SALES_STATUS_COLORS[status] || SALES_STATUS_COLORS.coming_soon;
}
