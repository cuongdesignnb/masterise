"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Play, X } from "lucide-react";
import type { PostMedia } from "@/types/api";

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function formatBytes(value?: number | null) {
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewsMediaBlocks({ mediaItems }: { mediaItems?: PostMedia[] }) {
  const images = useMemo(() => (mediaItems || []).filter((item) => item.type === "image" && item.url), [mediaItems]);
  const videos = useMemo(() => (mediaItems || []).filter((item) => (item.type === "video_upload" || item.type === "youtube") && item.url), [mediaItems]);
  const documents = useMemo(() => (mediaItems || []).filter((item) => item.type === "document" && item.url), [mediaItems]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length && !videos.length && !documents.length) return null;

  const currentImage = images[activeImage];

  return (
    <section className="mx-auto max-w-5xl space-y-6 py-6 sm:py-8">
      {images.length > 0 && currentImage?.url && (
        <div className="rounded-lg border border-line/60 bg-white p-3 shadow-sm">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-[#FBF8F2]">
            <button type="button" onClick={() => setLightboxIndex(activeImage)} className="absolute inset-0 z-10" aria-label="Xem ảnh lớn" />
            <Image src={currentImage.url} alt={currentImage.title || "Album ảnh tin tức"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 980px" />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((item, index) => (
                <button key={`${item.url}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border ${index === activeImage ? "border-gold" : "border-line"}`}>
                  {item.url && <Image src={item.url} alt={item.title || `Ảnh ${index + 1}`} fill className="object-cover" sizes="96px" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {videos.map((video, index) => (
            <div key={`${video.url}-${index}`} className="overflow-hidden rounded-lg border border-line/60 bg-white shadow-sm">
              <div className="aspect-video bg-black">
                {video.type === "youtube" ? (
                  <iframe src={getYouTubeEmbedUrl(video.url)} title={video.title || "Video tin tức"} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                ) : (
                  <video src={video.url || ""} controls poster={video.thumbnail_url || undefined} className="h-full w-full object-contain" />
                )}
              </div>
              {video.title && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-ink">
                  <Play className="h-4 w-4 text-gold" />
                  {video.title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="rounded-lg border border-line/60 bg-white p-4 shadow-sm">
          <h2 className="text-base font-black text-ink">Tài liệu đính kèm</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {documents.map((doc, index) => (
              <a key={`${doc.url}-${index}`} href={doc.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md border border-line bg-[#FBF8F2] p-3 transition hover:border-gold hover:bg-white">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{doc.title || `Tài liệu ${index + 1}`}</span>
                  {formatBytes(doc.file_size) && <span className="text-[11px] font-semibold text-muted">{formatBytes(doc.file_size)}</span>}
                </span>
                <Download className="h-4 w-4 shrink-0 text-gold" />
              </a>
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && images[lightboxIndex]?.url && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4" onClick={() => setLightboxIndex(null)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-ink" onClick={() => setLightboxIndex(null)} aria-label="Đóng ảnh">
            <X className="h-5 w-5" />
          </button>
          <a href={images[lightboxIndex].url || "#"} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-ink">
            Mở ảnh gốc <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <img src={images[lightboxIndex].url || ""} alt={images[lightboxIndex].title || "Ảnh tin tức"} className="max-h-[86vh] max-w-[94vw] rounded-lg object-contain" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
