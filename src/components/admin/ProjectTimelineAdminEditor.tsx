"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronDown, ExternalLink, ImagePlus, MoveDown, MoveUp, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import MediaSelectModal from "@/components/admin/MediaSelectModal";
import { createProjectTimelineKey, uniqueProjectTimelineImages } from "@/lib/projectTimeline";
import type { ProjectTimelineItem } from "@/types/project-timeline";

type Props = {
  items: ProjectTimelineItem[];
  onChange: (items: ProjectTimelineItem[]) => void;
};

const inputClass = "w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm text-[#1F1B16] outline-none focus:border-[#B88746] focus:ring-2 focus:ring-[#B88746]/15";
const smallButtonClass = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-2.5 text-xs font-semibold text-[#6E5F51] transition hover:border-[#B88746] hover:text-[#8F632F] disabled:cursor-not-allowed disabled:opacity-35";

function emptyTimelineItem(): ProjectTimelineItem {
  return { key: createProjectTimelineKey(), date: "", title: "", description: "", bullets: [], images: [] };
}

export default function ProjectTimelineAdminEditor({ items, onChange }: Props) {
  const [mediaItemIndex, setMediaItemIndex] = useState<number | null>(null);

  const updateItem = (index: number, patch: Partial<ProjectTimelineItem>) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const removeItem = (index: number) => {
    const item = items[index];
    if (item.images.length && !window.confirm(`Mốc này đang có ${item.images.length} ảnh. Bạn có chắc muốn xóa toàn bộ mốc?`)) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateBullet = (itemIndex: number, bulletIndex: number, value: string) => {
    const bullets = items[itemIndex].bullets.map((bullet, index) => index === bulletIndex ? value : bullet);
    updateItem(itemIndex, { bullets });
  };

  const moveImage = (itemIndex: number, imageIndex: number, direction: -1 | 1) => {
    const images = [...items[itemIndex].images];
    const target = imageIndex + direction;
    if (target < 0 || target >= images.length) return;
    [images[imageIndex], images[target]] = [images[target], images[imageIndex]];
    updateItem(itemIndex, { images });
  };

  const selectedMediaImages = mediaItemIndex === null ? [] : items[mediaItemIndex]?.images || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1F1B16]">Các mốc tiến độ thi công</h3>
          <p className="mt-1 text-xs leading-5 text-[#8C7A6B]">Mốc cuối cùng là mốc mới nhất ngoài client. Ảnh đầu tiên của mỗi mốc là ảnh cover.</p>
        </div>
        <button type="button" onClick={() => onChange([...items, emptyTimelineItem()])} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#B88746] px-4 text-xs font-bold text-white"><Plus className="h-4 w-4" /> Thêm mốc tiến độ</button>
      </div>

      {!items.length ? (
        <div className="rounded-xl border border-dashed border-[#D9C7AD] bg-[#FBF8F2] px-5 py-8 text-center text-sm text-[#8C7A6B]">
          Chưa có dữ liệu tiến độ thi công.<br />Bấm “Thêm mốc tiến độ” để tạo mốc đầu tiên.
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item, index) => (
          <details key={item.key} name="project-timeline-item" className="group rounded-2xl border border-[#E8DCCB] bg-white shadow-[0_8px_22px_rgba(87,61,28,.04)]">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 marker:hidden">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F8EEDC] text-xs font-bold text-[#8F632F]">{index + 1}</span>
              <span className="min-w-[180px] flex-1">
                <span className="block text-xs font-bold text-[#1F1B16]">{item.date || "Chưa nhập mốc thời gian"}</span>
                <span className="mt-0.5 block truncate text-xs text-[#8C7A6B]">{item.title || "Chưa nhập tiêu đề"} · {item.images.length} ảnh</span>
              </span>
              <span className="flex flex-wrap gap-1" onClick={(event) => event.stopPropagation()}>
                <button type="button" aria-label="Đưa mốc lên" disabled={index === 0} onClick={(event) => { event.preventDefault(); moveItem(index, -1); }} className={smallButtonClass}><MoveUp className="h-4 w-4" /></button>
                <button type="button" aria-label="Đưa mốc xuống" disabled={index === items.length - 1} onClick={(event) => { event.preventDefault(); moveItem(index, 1); }} className={smallButtonClass}><MoveDown className="h-4 w-4" /></button>
                <button type="button" aria-label="Xóa mốc" onClick={(event) => { event.preventDefault(); removeItem(index); }} className={`${smallButtonClass} border-red-200 text-red-600 hover:border-red-400 hover:text-red-700`}><Trash2 className="h-4 w-4" /></button>
              </span>
              <ChevronDown className="h-4 w-4 text-[#8C7A6B] transition group-open:rotate-180" aria-hidden="true" />
            </summary>

            <div className="space-y-5 border-t border-[#EFE4D5] p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-semibold text-[#6E5F51]">Mốc thời gian *<input value={item.date} onChange={(event) => updateItem(index, { date: event.target.value })} className={`${inputClass} mt-1`} placeholder="Ví dụ: Tháng 07/2026" /></label>
                <label className="text-xs font-semibold text-[#6E5F51]">Tiêu đề tiến độ *<input value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} className={`${inputClass} mt-1`} placeholder="Ví dụ: Hoàn thành phần thân đến tầng 25" /></label>
              </div>
              <label className="block text-xs font-semibold text-[#6E5F51]">Mô tả chi tiết<textarea value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} rows={4} className={`${inputClass} mt-1 resize-y`} placeholder="Mô tả công việc và tình trạng thi công tại mốc này" /></label>

              <div>
                <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-[#6E5F51]">Danh sách bullet</p><button type="button" onClick={() => updateItem(index, { bullets: [...item.bullets, ""] })} className={smallButtonClass}><Plus className="h-3.5 w-3.5" /> Thêm bullet</button></div>
                <div className="mt-2 space-y-2">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={`${item.key}-bullet-${bulletIndex}`} className="flex gap-2">
                      <input value={bullet} onChange={(event) => updateBullet(index, bulletIndex, event.target.value)} className={inputClass} placeholder="Ví dụ: Kết cấu đạt tầng 25" />
                      <button type="button" aria-label="Xóa bullet" onClick={() => updateItem(index, { bullets: item.bullets.filter((_, valueIndex) => valueIndex !== bulletIndex) })} className={`${smallButtonClass} text-red-600`}><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-bold text-[#6E5F51]">Gallery hình ảnh</p><p className="mt-1 text-[11px] text-[#8C7A6B]">{item.images.length ? `${item.images.length} ảnh · ảnh số 1 là cover` : "Chưa có ảnh; vẫn có thể lưu mốc tiến độ."}</p></div>
                  <button type="button" onClick={() => setMediaItemIndex(index)} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#1F1B16] px-3 text-xs font-bold text-white"><ImagePlus className="h-4 w-4" /> Chọn nhiều ảnh</button>
                </div>
                {item.images.length ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {item.images.map((image, imageIndex) => (
                      <div key={image} className="overflow-hidden rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] p-2">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white"><img src={image} alt={`Ảnh tiến độ ${imageIndex + 1}`} className="h-full w-full object-cover" />{imageIndex === 0 ? <span className="absolute left-2 top-2 rounded bg-[#B88746] px-2 py-1 text-[10px] font-bold text-white">Cover</span> : null}</div>
                        <div className="mt-2 flex gap-1">
                          <button type="button" aria-label="Đưa ảnh lên" disabled={imageIndex === 0} onClick={() => moveImage(index, imageIndex, -1)} className={smallButtonClass}><MoveUp className="h-3.5 w-3.5" /></button>
                          <button type="button" aria-label="Đưa ảnh xuống" disabled={imageIndex === item.images.length - 1} onClick={() => moveImage(index, imageIndex, 1)} className={smallButtonClass}><MoveDown className="h-3.5 w-3.5" /></button>
                          <a href={image} target="_blank" rel="noreferrer" aria-label="Mở ảnh" className={smallButtonClass}><ExternalLink className="h-3.5 w-3.5" /></a>
                          <button type="button" aria-label="Xóa ảnh" onClick={() => updateItem(index, { images: item.images.filter((_, valueIndex) => valueIndex !== imageIndex) })} className={`${smallButtonClass} text-red-600`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </div>

      <MediaSelectModal
        key={`${mediaItemIndex ?? "closed"}-${selectedMediaImages.join("|")}`}
        isOpen={mediaItemIndex !== null}
        onClose={() => setMediaItemIndex(null)}
        onSelect={(value) => {
          if (mediaItemIndex === null) return;
          const selected = Array.isArray(value) ? value : [value];
          updateItem(mediaItemIndex, { images: uniqueProjectTimelineImages([...items[mediaItemIndex].images, ...selected]) });
          setMediaItemIndex(null);
        }}
        multiple
        kind="image"
        selectedUrls={selectedMediaImages}
      />
    </div>
  );
}
