import type { ProjectStatus } from '@/types/api';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  coming_soon: 'Sắp mở bán',
  selling: 'Đang mở bán',
  sold_out: 'Đã hết giỏ hàng',
  handing_over: 'Đang bàn giao',
  handover: 'Đã bàn giao',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; admin: string }> = {
  coming_soon: {
    bg: 'bg-amber-500/90',
    text: 'text-white',
    admin: 'border border-amber-200 bg-amber-50 text-amber-700',
  },
  selling: {
    bg: 'bg-emerald-600/90',
    text: 'text-white',
    admin: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  sold_out: {
    bg: 'bg-rose-600/90',
    text: 'text-white',
    admin: 'border border-rose-200 bg-rose-50 text-rose-700',
  },
  handing_over: {
    bg: 'bg-sky-600/90',
    text: 'text-white',
    admin: 'border border-sky-200 bg-sky-50 text-sky-700',
  },
  handover: {
    bg: 'bg-champagne/90',
    text: 'text-ink-deep',
    admin: 'border border-stone-200 bg-stone-50 text-stone-700',
  },
};

export const PROJECT_STATUS_OPTIONS = (Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((value) => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}));

export function getProjectStatusLabel(status: ProjectStatus | undefined | null): string {
  return status ? PROJECT_STATUS_LABELS[status] : 'Đang cập nhật';
}

export function getProjectStatusColor(status: ProjectStatus | undefined | null) {
  return PROJECT_STATUS_COLORS[status || 'coming_soon'];
}
