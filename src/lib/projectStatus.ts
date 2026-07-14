import type { ProjectStatus, ProjectStatusOption } from '@/types/api';

export type ProjectStatusColor = {
  bg: string;
  text: string;
  admin: string;
  dot: string;
};

export const PROJECT_STATUS_COLOR_KEYS = [
  'amber', 'emerald', 'rose', 'sky', 'stone', 'violet', 'blue', 'orange',
] as const;

export const PROJECT_STATUS_PALETTE: Record<string, ProjectStatusColor> = {
  amber: { bg: 'bg-amber-500/90', text: 'text-white', admin: 'border border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-600/90', text: 'text-white', admin: 'border border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  rose: { bg: 'bg-rose-600/90', text: 'text-white', admin: 'border border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-600' },
  sky: { bg: 'bg-sky-600/90', text: 'text-white', admin: 'border border-sky-200 bg-sky-50 text-sky-700', dot: 'bg-sky-600' },
  stone: { bg: 'bg-stone-600/90', text: 'text-white', admin: 'border border-stone-200 bg-stone-50 text-stone-700', dot: 'bg-stone-500' },
  violet: { bg: 'bg-violet-600/90', text: 'text-white', admin: 'border border-violet-200 bg-violet-50 text-violet-700', dot: 'bg-violet-600' },
  blue: { bg: 'bg-blue-600/90', text: 'text-white', admin: 'border border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-600' },
  orange: { bg: 'bg-orange-600/90', text: 'text-white', admin: 'border border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-600' },
};

export function formatProjectStatusSlug(status: ProjectStatus | undefined | null): string {
  if (!status) return 'Đang cập nhật';
  return status
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('vi'));
}

export function getProjectStatusLabel(
  status: ProjectStatus | undefined | null,
  detail?: Pick<ProjectStatusOption, 'name'> | null,
): string {
  return detail?.name?.trim() || formatProjectStatusSlug(status);
}

export function getProjectStatusColor(
  detailOrColorKey?: Pick<ProjectStatusOption, 'color_key'> | string | null,
): ProjectStatusColor {
  const colorKey = typeof detailOrColorKey === 'string'
    ? detailOrColorKey
    : detailOrColorKey?.color_key;
  return PROJECT_STATUS_PALETTE[colorKey || 'stone'] || PROJECT_STATUS_PALETTE.stone;
}

function normalizeBadgeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLocaleLowerCase('vi');
}

export function getProjectMarketingLabel(
  label: string | undefined | null,
  status: ProjectStatus | undefined | null,
  statusDetail?: Pick<ProjectStatusOption, 'name'> | null,
): string | null {
  const trimmed = label?.trim();
  if (!trimmed) return null;

  const statusLabel = getProjectStatusLabel(status, statusDetail);
  return normalizeBadgeText(trimmed) === normalizeBadgeText(statusLabel) ? null : trimmed;
}
