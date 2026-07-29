'use client';

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import { ChevronDown, ImagePlus, MoveDown, MoveUp, Trash2 } from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import RichTextEditor from '@/components/admin/RichTextEditor';
import RichHtmlContent from '@/components/content/RichHtmlContent';
import { buildLegacyPricingPolicyHtml, derivePricingPolicyLegacyGallery, getPricingLegacyCounts, hasPricingLegacyData } from '@/lib/projectPricingPolicy';
import type { ProjectPolicyCard, ProjectPriceItem } from '@/types/project-detail';

export type AdminPriceRowItem = {
  kind: 'row' | 'image' | 'file' | 'note'; productType: string; area: string; price: string; payment: string;
  status: string; note: string; title: string; description: string; image_url: string; file_url: string;
  file_type: 'pdf' | 'excel' | 'word' | 'image' | 'other'; file_size: string; button_label: string; highlight: boolean;
};
export type AdminPolicyItem = {
  title: string; description: string; icon: string; image_url: string; badge: string; bullets: string[];
  cta_label: string; cta_url: string; file_url: string;
};

type Props = {
  description: string;
  onDescriptionChange: (value: string) => void;
  priceRows: AdminPriceRowItem[];
  onPriceRowsChange: (items: AdminPriceRowItem[]) => void;
  policies: AdminPolicyItem[];
  priceMin: number | '';
  onPriceMinChange: (value: number | '') => void;
  priceMax: number | '';
  onPriceMaxChange: (value: number | '') => void;
  priceText: string;
  onPriceTextChange: (value: string) => void;
  pricePerSqmMin: number | '';
  onPricePerSqmMinChange: (value: number | '') => void;
  pricePerSqmMax: number | '';
  onPricePerSqmMaxChange: (value: number | '') => void;
};

const inputClass = 'w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm text-[#1F1B16] outline-none focus:border-[#B88746] focus:ring-2 focus:ring-[#B88746]/15';

function toPublicRows(items: AdminPriceRowItem[]): ProjectPriceItem[] {
  return items.map((item) => ({
    kind: item.kind,
    productType: item.productType,
    area: item.area,
    price: item.price,
    payment: item.payment,
    status: item.status,
    note: item.note,
    title: item.title,
    description: item.description,
    imageUrl: item.image_url,
    fileUrl: item.file_url,
    fileType: item.file_type,
    fileSize: item.file_size,
    buttonLabel: item.button_label,
    highlight: item.highlight,
  }));
}

function toPublicPolicies(items: AdminPolicyItem[]): ProjectPolicyCard[] {
  return items.map((item) => ({
    title: item.title, description: item.description, icon: item.icon as ProjectPolicyCard['icon'], imageUrl: item.image_url,
    badge: item.badge, bullets: item.bullets, ctaLabel: item.cta_label, ctaUrl: item.cta_url, fileUrl: item.file_url,
  }));
}

export default function ProjectPricingPolicyAdminEditor(props: Props) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const publicRows = useMemo(() => toPublicRows(props.priceRows), [props.priceRows]);
  const publicPolicies = useMemo(() => toPublicPolicies(props.policies), [props.policies]);
  const legacyCounts = useMemo(() => getPricingLegacyCounts(publicRows, publicPolicies), [publicPolicies, publicRows]);
  const legacyHtml = useMemo(() => buildLegacyPricingPolicyHtml(publicRows, publicPolicies), [publicPolicies, publicRows]);
  const legacyGallery = useMemo(() => derivePricingPolicyLegacyGallery(publicRows, publicPolicies), [publicPolicies, publicRows]);
  const legacyPresent = hasPricingLegacyData(legacyCounts);
  const gallery = props.priceRows.map((item, index) => ({ item, index })).filter(({ item }) => item.kind === 'image' && item.image_url);

  const replaceGallery = (urls: string[]) => {
    const existingImages = props.priceRows.filter((item) => item.kind === 'image');
    const nextImages = urls.map((url, index): AdminPriceRowItem => ({
      kind: 'image', productType: '', area: '', price: '', payment: '', status: '', note: '',
      title: existingImages[index]?.title || '', description: existingImages[index]?.description || '', image_url: url,
      file_url: '', file_type: 'other', file_size: '', button_label: 'Phóng to', highlight: false,
    }));
    const firstImageIndex = props.priceRows.findIndex((item) => item.kind === 'image');
    const nonImages = props.priceRows.filter((item) => item.kind !== 'image');
    const insertionIndex = firstImageIndex < 0 ? nonImages.length : props.priceRows.slice(0, firstImageIndex).filter((item) => item.kind !== 'image').length;
    props.onPriceRowsChange([...nonImages.slice(0, insertionIndex), ...nextImages, ...nonImages.slice(insertionIndex)]);
  };

  const updateGalleryItem = (sourceIndex: number, patch: Partial<AdminPriceRowItem>) => {
    props.onPriceRowsChange(props.priceRows.map((item, index) => index === sourceIndex ? { ...item, ...patch, button_label: 'Phóng to' } : item));
  };

  const moveGalleryItem = (galleryIndex: number, direction: -1 | 1) => {
    const target = galleryIndex + direction;
    if (target < 0 || target >= gallery.length) return;
    const next = [...props.priceRows];
    const a = gallery[galleryIndex].index;
    const b = gallery[target].index;
    [next[a], next[b]] = [next[b], next[a]];
    props.onPriceRowsChange(next);
  };

  const convertLegacy = () => {
    if (!legacyHtml) return;
    if (!window.confirm('Chuyển dữ liệu legacy sang Rich Editor? Dữ liệu gốc vẫn được giữ nguyên để tương thích ngược.')) return;
    props.onDescriptionChange(legacyHtml);
  };

  const importLegacyGallery = () => {
    if (!legacyGallery.length) return;
    if (!window.confirm(`Đưa ${legacyGallery.length} ảnh dữ liệu cũ vào gallery mới? Dữ liệu gốc vẫn được giữ nguyên để tương thích ngược.`)) return;
    const importedRows = legacyGallery.map((image): AdminPriceRowItem => ({
      kind: 'image', productType: '', area: '', price: '', payment: '', status: '', note: '',
      title: image.title, description: image.description, image_url: image.url,
      file_url: '', file_type: 'other', file_size: '', button_label: 'Phóng to', highlight: false,
    }));
    props.onPriceRowsChange([...props.priceRows, ...importedRows]);
  };

  return (
    <div className="space-y-5">
      <div data-project-field="pricing_policy_description" className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
        <h3 className="text-sm font-bold text-[#1F1B16]">1. Nội dung bảng giá &amp; chính sách</h3>
        <p className="mb-4 mt-1 text-xs text-[#8C7A6B]">Đây là nguồn nội dung chính ngoài client. Có thể chèn bảng, ảnh, liên kết và tài liệu từ Media Library.</p>
        <RichTextEditor value={props.description} onChange={props.onDescriptionChange} placeholder="Soạn toàn bộ nội dung bảng giá và chính sách bán hàng" editorLabel="Nội dung bảng giá & chính sách" stickyToolbar />
        {legacyPresent ? (
          <details className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <summary className="cursor-pointer text-xs font-bold text-amber-900">Phát hiện dữ liệu legacy: {legacyCounts.rows} dòng giá, {legacyCounts.notes} ghi chú, {legacyCounts.files} file, {legacyCounts.policies} chính sách</summary>
            <p className="mt-2 text-xs text-amber-800">Dữ liệu legacy chỉ dùng làm fallback và không bị xóa. Nút chuyển đổi thay nội dung Rich Editor bằng bản dựng ổn định nên không nhân đôi khi bấm lại.</p>
            <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-amber-200 bg-white p-3">
              <RichHtmlContent html={legacyHtml} />
            </div>
            <button type="button" onClick={convertLegacy} className="mt-3 rounded-lg bg-[#8F632F] px-4 py-2 text-xs font-bold text-white">Chuyển dữ liệu legacy vào Rich Editor</button>
          </details>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="text-sm font-bold text-[#1F1B16]">2. Ảnh bảng giá &amp; chính sách</h3><p className="mt-1 text-xs text-[#8C7A6B]">Chỉ chọn ảnh. Tiêu đề/alt là bắt buộc trước khi xuất bản; chú thích là tùy chọn.</p></div>
          <button type="button" onClick={() => setMediaOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#B88746] px-4 py-2 text-xs font-bold text-white"><ImagePlus className="h-4 w-4" /> Chọn nhiều ảnh</button>
        </div>
        {legacyGallery.length ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900">Phát hiện {legacyGallery.length} ảnh trong dữ liệu cũ</p>
                <p className="mt-1 text-xs text-amber-800">Ảnh chưa mất nhưng không còn tự động hiển thị ngoài client. Hãy chuyển vào gallery mới để sử dụng và quản lý tại đây.</p>
              </div>
              <button type="button" onClick={importLegacyGallery} className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white"><ImagePlus className="h-4 w-4" /> Đưa ảnh cũ vào gallery</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {legacyGallery.map((image) => (
                <div key={image.url} className="overflow-hidden rounded-lg border border-amber-200 bg-white p-1.5">
                  <img src={image.url} alt={image.title} className="aspect-[4/3] w-full rounded object-cover" />
                  <p className="mt-1 truncate px-1 text-[10px] font-semibold text-amber-900" title={image.title}>{image.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {gallery.length ? <div className="mt-4 space-y-3">{gallery.map(({ item, index }, galleryIndex) => (
          <div key={`${item.image_url}-${index}`} className="grid gap-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] p-3 md:grid-cols-[170px_minmax(0,1fr)_auto]">
            <img src={item.image_url} alt={item.title || ''} className="h-28 w-full rounded-lg bg-white object-contain" />
            <div className="space-y-2">
              <input value={item.title} onChange={(event) => updateGalleryItem(index, { title: event.target.value })} className={inputClass} placeholder="Tiêu đề ảnh / alt ảnh (bắt buộc)" />
              <textarea value={item.description} onChange={(event) => updateGalleryItem(index, { description: event.target.value })} rows={2} className={inputClass} placeholder="Chú thích ảnh (không bắt buộc)" />
              <p className="text-[11px] font-semibold text-[#8F632F]">Nhãn nút ngoài client: Phóng to</p>
            </div>
            <div className="flex gap-1 md:flex-col">
              <button type="button" aria-label="Đưa ảnh lên" disabled={galleryIndex === 0} onClick={() => moveGalleryItem(galleryIndex, -1)} className="rounded-lg border border-[#E8DCCB] bg-white p-2 disabled:opacity-35"><MoveUp className="h-4 w-4" /></button>
              <button type="button" aria-label="Đưa ảnh xuống" disabled={galleryIndex === gallery.length - 1} onClick={() => moveGalleryItem(galleryIndex, 1)} className="rounded-lg border border-[#E8DCCB] bg-white p-2 disabled:opacity-35"><MoveDown className="h-4 w-4" /></button>
              <button type="button" aria-label="Xóa ảnh" onClick={() => props.onPriceRowsChange(props.priceRows.filter((_, rowIndex) => rowIndex !== index))} className="rounded-lg border border-red-200 bg-white p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}</div> : <p className="mt-4 rounded-xl border border-dashed border-[#E8DCCB] bg-[#FBF8F2] p-5 text-center text-xs text-[#8C7A6B]">Chưa có ảnh bảng giá hoặc chính sách.</p>}
      </div>

      <details className="group rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#1F1B16]">3. Trường giá hệ thống <ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
        <p className="mt-2 text-xs text-[#8C7A6B]">Các trường này chỉ dùng cho bộ lọc, thẻ dự án và sắp xếp; không phải nội dung trình bày chính.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-xs font-semibold text-[#6E5F51]">Giá khởi điểm (tỷ)<input type="number" min="0" step="0.1" value={props.priceMin} onChange={(e) => props.onPriceMinChange(e.target.value ? Number(e.target.value) : '')} className={`${inputClass} mt-1`} /></label>
          <label className="text-xs font-semibold text-[#6E5F51]">Giá cao nhất (tỷ)<input type="number" min="0" step="0.1" value={props.priceMax} onChange={(e) => props.onPriceMaxChange(e.target.value ? Number(e.target.value) : '')} className={`${inputClass} mt-1`} /></label>
          <label className="text-xs font-semibold text-[#6E5F51]">Giá hiển thị<input value={props.priceText} onChange={(e) => props.onPriceTextChange(e.target.value)} className={`${inputClass} mt-1`} /></label>
          <label className="text-xs font-semibold text-[#6E5F51]">Giá/m² thấp nhất (triệu)<input type="number" min="0" step="0.1" value={props.pricePerSqmMin} onChange={(e) => props.onPricePerSqmMinChange(e.target.value ? Number(e.target.value) : '')} className={`${inputClass} mt-1`} /></label>
          <label className="text-xs font-semibold text-[#6E5F51]">Giá/m² cao nhất (triệu)<input type="number" min="0" step="0.1" value={props.pricePerSqmMax} onChange={(e) => props.onPricePerSqmMaxChange(e.target.value ? Number(e.target.value) : '')} className={`${inputClass} mt-1`} /></label>
        </div>
      </details>

      <MediaSelectModal isOpen={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={(value) => { replaceGallery(Array.isArray(value) ? value : [value]); setMediaOpen(false); }} multiple kind="image" selectedUrls={gallery.map(({ item }) => item.image_url)} />
    </div>
  );
}
