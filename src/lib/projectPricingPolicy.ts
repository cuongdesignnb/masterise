import type { ProjectPolicyCard, ProjectPriceItem } from '@/types/project-detail';

export type PricingPolicyHeading = {
  id: string;
  label: string;
  level: number;
};

export type PricingPolicyGalleryItem = {
  url: string;
  title: string;
  description: string;
};

export type PricingLegacyCounts = {
  rows: number;
  notes: number;
  files: number;
  policies: number;
};

const IMAGE_PATTERN = /\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?.*)?$/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyHeading(value: string): string {
  return value
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'noi-dung';
}

function inferFileType(url: string): 'pdf' | 'excel' | 'word' | 'other' {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.pdf')) return 'pdf';
  if (/\.(?:xls|xlsx|csv)$/.test(clean)) return 'excel';
  if (/\.(?:doc|docx)$/.test(clean)) return 'word';
  return 'other';
}

function fileLabel(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Tài liệu đính kèm');
  } catch {
    return 'Tài liệu đính kèm';
  }
}

function richFileLink(url: string, label?: string): string {
  const safeUrl = escapeHtml(url);
  return `<p><a class="article-file-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer" data-file-type="${inferFileType(url)}">${escapeHtml(label?.trim() || fileLabel(url))}</a></p>`;
}

export function getPricingLegacyCounts(priceRows: ProjectPriceItem[], policies: ProjectPolicyCard[]): PricingLegacyCounts {
  return {
    rows: priceRows.filter((item) => item.kind === 'row').length,
    notes: priceRows.filter((item) => item.kind === 'note').length,
    files: priceRows.filter((item) => item.kind === 'file' && !IMAGE_PATTERN.test(item.fileUrl)).length,
    policies: policies.length,
  };
}

export function hasPricingLegacyData(counts: PricingLegacyCounts): boolean {
  return Object.values(counts).some((count) => count > 0);
}

export function buildLegacyPricingPolicyHtml(priceRows: ProjectPriceItem[], policies: ProjectPolicyCard[]): string {
  const rows = priceRows.filter((item): item is Extract<ProjectPriceItem, { kind: 'row' }> => item.kind === 'row');
  const notes = priceRows.filter((item): item is Extract<ProjectPriceItem, { kind: 'note' }> => item.kind === 'note');
  const files = priceRows.filter((item): item is Extract<ProjectPriceItem, { kind: 'file' }> => item.kind === 'file' && !IMAGE_PATTERN.test(item.fileUrl));
  const parts: string[] = [];

  if (rows.length) {
    parts.push('<h2>Bảng giá tham khảo</h2>');
    parts.push(`<table><thead><tr><th>Loại sản phẩm</th><th>Diện tích</th><th>Giá tham khảo</th><th>Thanh toán</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.productType || '')}</td><td>${escapeHtml(row.area || '')}</td><td>${escapeHtml(row.price || '')}</td><td>${escapeHtml(row.payment || '')}</td><td>${escapeHtml(row.status || '')}</td><td>${escapeHtml(row.note || row.description || '')}</td></tr>`).join('')}</tbody></table>`);
  }

  notes.forEach((note) => {
    parts.push(`<blockquote>${note.title ? `<strong>${escapeHtml(note.title)}</strong>` : ''}${note.title && note.description ? '<br>' : ''}${escapeHtml(note.description || '')}</blockquote>`);
  });

  if (policies.length) {
    parts.push('<h2>Chính sách bán hàng</h2>');
    policies.forEach((policy) => {
      parts.push(`<h3>${escapeHtml(policy.title)}</h3>`);
      if (policy.description) parts.push(`<p>${escapeHtml(policy.description).replace(/\r?\n/g, '<br>')}</p>`);
      if (policy.bullets.length) parts.push(`<ul>${policy.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`);
      const url = policy.fileUrl || policy.ctaUrl;
      if (url) parts.push(richFileLink(url, policy.ctaLabel || policy.title));
    });
  }

  if (files.length) {
    parts.push('<h2>Tài liệu đính kèm</h2>');
    files.forEach((file) => parts.push(richFileLink(file.fileUrl, file.title)));
  }

  return parts.join('');
}

export function derivePricingPolicyGallery(priceRows: ProjectPriceItem[], policies: ProjectPolicyCard[]): PricingPolicyGalleryItem[] {
  const candidates: PricingPolicyGalleryItem[] = [];

  priceRows.forEach((item) => {
    if (item.kind === 'image' && item.imageUrl) {
      candidates.push({
        url: item.imageUrl,
        title: item.title?.trim() || 'Ảnh bảng giá và chính sách',
        description: item.description?.trim() || '',
      });
    }
    if (item.kind === 'file' && item.fileUrl && (item.fileType === 'image' || IMAGE_PATTERN.test(item.fileUrl))) {
      candidates.push({
        url: item.fileUrl,
        title: item.title?.trim() || 'Ảnh bảng giá và chính sách',
        description: item.description?.trim() || '',
      });
    }
  });

  policies.forEach((policy) => {
    if (!policy.imageUrl) return;
    candidates.push({
      url: policy.imageUrl,
      title: policy.title?.trim() || 'Ảnh chính sách bán hàng',
      description: policy.description?.trim() || '',
    });
  });

  const seen = new Set<string>();
  return candidates.filter((item) => {
    const key = item.url.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function preparePricingPolicyHtml(value: string): { html: string; headings: PricingPolicyHeading[] } {
  const usedIds = new Map<string, number>();
  const headings: PricingPolicyHeading[] = [];
  const html = value.replace(/<h([2-4])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi, (_match, levelValue: string, attributes: string, innerHtml: string) => {
    const label = stripHtml(innerHtml);
    if (!label) return _match;
    const baseId = `pricing-${slugifyHeading(label)}`;
    const occurrence = usedIds.get(baseId) || 0;
    usedIds.set(baseId, occurrence + 1);
    const id = occurrence ? `${baseId}-${occurrence + 1}` : baseId;
    if (headings.length < 5) headings.push({ id, label, level: Number(levelValue) });
    const safeAttributes = attributes.replace(/\s+id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    return `<h${levelValue}${safeAttributes} id="${id}">${innerHtml}</h${levelValue}>`;
  });

  return { html, headings };
}

export function formatProjectUpdatedAt(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
