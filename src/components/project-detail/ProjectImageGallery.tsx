"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ProjectImageGalleryProps = {
  images: string[];
  title: string;
  altPrefix: string;
  caption?: string;
  visibleLimit?: number;
  compact?: boolean;
  showFooter?: boolean;
  emptyText?: string;
};

function previewCellClass(index: number, count: number, compact: boolean): string {
  if (!compact) {
    return ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2"][index] || "";
  }
  if (count === 1) return "col-span-2 min-h-[260px] sm:min-h-[380px]";
  if (count === 2) return "min-h-[220px] sm:min-h-[340px]";
  if (count === 3) return index === 0 ? "row-span-2 min-h-[320px] sm:min-h-[420px]" : "min-h-[154px] sm:min-h-[204px]";
  if (index === 0) return "row-span-2 min-h-[320px] sm:min-h-[400px]";
  if (index === 3) return "col-span-2 min-h-[170px] sm:min-h-[210px]";
  return "min-h-[154px] sm:min-h-[194px]";
}

export default function ProjectImageGallery({
  images,
  title,
  altPrefix,
  caption,
  visibleLimit = 4,
  compact = false,
  showFooter = false,
  emptyText = "Hình ảnh tiến độ đang được cập nhật.",
}: ProjectImageGalleryProps) {
  const uniqueImages = useMemo(() => Array.from(new Set(images.map((image) => image.trim()).filter(Boolean))), [images]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeLightbox = () => {
    setActiveImageIndex(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  useEffect(() => {
    if (activeImageIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft" && uniqueImages.length > 1) {
        setActiveImageIndex((current) => current === null ? null : (current - 1 + uniqueImages.length) % uniqueImages.length);
      }
      if (event.key === "ArrowRight" && uniqueImages.length > 1) {
        setActiveImageIndex((current) => current === null ? null : (current + 1) % uniqueImages.length);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, uniqueImages.length]);

  const openLightbox = (index: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setActiveImageIndex(index);
  };

  if (!uniqueImages.length) {
    return <div className="flex min-h-[220px] items-center justify-center rounded-[16px] border border-dashed border-line bg-[#fbf8f2] px-6 text-center text-sm text-muted">{emptyText}</div>;
  }

  const visibleImages = uniqueImages.slice(0, Math.min(uniqueImages.length, visibleLimit));
  const moreCount = Math.max(uniqueImages.length - visibleImages.length, 0);
  const compactGrid = visibleImages.length === 3 || visibleImages.length >= 4
    ? "grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
    : "grid-cols-2";

  return (
    <div>
      <div className={compact
        ? `grid gap-2 ${compactGrid}`
        : "grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[180px] md:grid-cols-4"}
      >
        {visibleImages.map((image, index) => {
          const showMore = index === visibleImages.length - 1 && moreCount > 0;
          return (
            <button
              key={image}
              type="button"
              onClick={(event) => openLightbox(index, event.currentTarget)}
              className={`group relative overflow-hidden rounded-[15px] bg-beige text-left ${compact ? previewCellClass(index, visibleImages.length, true) : `min-h-[210px] md:min-h-0 ${previewCellClass(index, visibleImages.length, false)}`}`}
              aria-label={`Mở ${altPrefix} — ảnh ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${altPrefix} — ảnh ${index + 1}`}
                fill
                sizes={compact ? "(max-width: 768px) 100vw, 65vw" : "(max-width: 768px) 100vw, 50vw"}
                className="object-cover transition duration-500 group-hover:scale-[1.035]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-md transition group-hover:scale-105">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </span>
              {showMore ? <span className="absolute inset-0 grid place-items-center bg-black/50 text-xl font-bold text-white">+{moreCount} ảnh</span> : null}
            </button>
          );
        })}
      </div>

      {showFooter ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>{caption}</p>
          <div className="flex items-center gap-4">
            <span>1 / {uniqueImages.length}</span>
            <button type="button" onClick={(event) => openLightbox(0, event.currentTarget)} className="inline-flex min-h-10 items-center gap-2 rounded-[9px] border border-gold/45 bg-white px-4 text-xs font-semibold text-gold-dark transition hover:bg-[#fff8ec]">
              Xem tất cả ảnh <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {activeImageIndex !== null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => { if (event.target === event.currentTarget) closeLightbox(); }}>
          <button ref={closeButtonRef} type="button" aria-label="Đóng thư viện ảnh" onClick={closeLightbox} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <X className="h-5 w-5" />
          </button>
          {uniqueImages.length > 1 ? (
            <>
              <button type="button" aria-label="Ảnh trước" onClick={() => setActiveImageIndex((activeImageIndex - 1 + uniqueImages.length) % uniqueImages.length)} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg sm:left-6">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Ảnh tiếp theo" onClick={() => setActiveImageIndex((activeImageIndex + 1) % uniqueImages.length)} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg sm:right-6">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <div className="relative h-[78vh] w-[calc(100vw-5rem)] max-w-6xl" onMouseDown={(event) => event.stopPropagation()}>
            <Image src={uniqueImages[activeImageIndex]} alt={`${altPrefix} — ảnh ${activeImageIndex + 1}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <div className="absolute bottom-4 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl bg-black/65 px-4 py-2 text-center text-white backdrop-blur-sm">
            <p className="text-xs font-semibold sm:text-sm">{caption || title}</p>
            <p className="mt-1 text-[11px] text-white/75">{activeImageIndex + 1} / {uniqueImages.length}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
