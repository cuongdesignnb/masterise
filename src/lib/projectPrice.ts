export const PROJECT_PRICE_RANGES = [
  "under-5",
  "5-10",
  "10-20",
  "20-50",
  "above-50",
] as const;

export type ProjectPriceRange = (typeof PROJECT_PRICE_RANGES)[number];

export const PROJECT_PRICE_RANGE_OPTIONS: Array<{ value: ProjectPriceRange; label: string }> = [
  { value: "under-5", label: "Dưới 5 tỷ" },
  { value: "5-10", label: "Từ 5 - 10 tỷ" },
  { value: "10-20", label: "Từ 10 - 20 tỷ" },
  { value: "20-50", label: "Từ 20 - 50 tỷ" },
  { value: "above-50", label: "Trên 50 tỷ" },
];

export function isProjectPriceRange(value: string): value is ProjectPriceRange {
  return PROJECT_PRICE_RANGES.includes(value as ProjectPriceRange);
}

export function formatVnd(value: string | number | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount)} VND`;
}

export function formatPriceInBillions(value: string | number | null | undefined): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  const billions = amount / 1_000_000_000;
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(billions)} tỷ`;
}

export function getProjectPriceText(
  priceText: string | null | undefined,
  priceMin: string | number | null | undefined,
  fallback = "Đang cập nhật",
): string {
  const customText = priceText?.trim();
  if (customText) return customText;

  const formattedPrice = formatPriceInBillions(priceMin);
  return formattedPrice ? `Từ ${formattedPrice}` : fallback;
}
