"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { ProjectDetail } from "@/types/project-detail";

type Props = {
  project: ProjectDetail;
};

export default function ProjectGalleryAlbumSection({ project }: Props) {
  const images = useMemo(
    () => Array.from(new Set(project.detailGallery.images.filter(Boolean))),
    [project.detailGallery.images],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((value) => (value === null ? value : (value - 1 + images.length) % images.length));
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((value) => (value === null ? value : (value + 1) % images.length));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length]);

  if (!images.length) return null;

  const visibleImages = images.slice(0, 6);
  const moreCount = Math.max(images.length - visibleImages.length, 0);

  return (
    <section className="rounded-[24px] border border-line/80 bg-white p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="mb-5 text-left">
        {project.detailGallery.label ? (
          <p className="text-[11px] font-bold tracking-[0.16em] text-gold normal-case">{project.detailGallery.label}</p>
        ) : null}
        <h2 className="heading-font mt-2 text-[24px] font-semibold leading-tight text-ink normal-case sm:text-[30px]">
          {project.detailGallery.title || "Album ảnh dự án"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
          {project.detailGallery.description || "Khám phá hình ảnh thực tế, tiện ích, cảnh quan và những góc nhìn nổi bật của dự án."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[180px] md:grid-cols-4">
        {visibleImages.map((image, index) => {
          const isFeature = index === 0;
          const showMore = index === visibleImages.length - 1 && moreCount > 0;
          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group relative min-h-[210px] overflow-hidden rounded-[16px] bg-beige text-left md:min-h-0 ${
                isFeature ? "md:col-span-2 md:row-span-2" : index === 3 ? "md:col-span-2" : ""
              }`}
            >
              <Image
                src={image}
                alt={`${project.detailGallery.title || project.name} ${index + 1}`}
                fill
                sizes={isFeature ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent opacity-70" />
              <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
              {showMore ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xl font-bold text-white backdrop-blur-[1px]">
                  +{moreCount} ảnh
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeIndex !== null ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/88 p-4" onClick={() => setActiveIndex(null)}>
          <button type="button" aria-label="Đóng album" onClick={() => setActiveIndex(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-ink shadow-lg">
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((activeIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img
            src={images[activeIndex]}
            alt={`${project.detailGallery.title || project.name} ${activeIndex + 1}`}
            className="max-h-[86vh] max-w-[94vw] rounded-[14px] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((activeIndex + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="absolute bottom-5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-ink shadow-lg">
            {activeIndex + 1}/{images.length}
          </span>
        </div>
      ) : null}
    </section>
  );
}
