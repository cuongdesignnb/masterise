"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileArchive, FileSpreadsheet, FileText, FileVideo, Play, Presentation, X } from "lucide-react";
import type { PostMedia } from "@/types/api";

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    let id = "";

    if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (!id && parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (!id && parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (!id) id = parsed.searchParams.get("v") || "";

    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function getYouTubeThumbnailUrl(url?: string | null) {
  const embedUrl = getYouTubeEmbedUrl(url);
  const id = embedUrl.match(/\/embed\/([^?&/]+)/)?.[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

function formatBytes(value?: number | null) {
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(url?: string | null, mimeType?: string | null) {
  const clean = (url || "").split("?")[0].toLowerCase();
  const match = clean.match(/\.([a-z0-9]+)$/);
  if (match?.[1]) return match[1].toUpperCase();
  if (mimeType?.includes("pdf")) return "PDF";
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return "XLSX";
  if (mimeType?.includes("word")) return "DOCX";
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return "PPTX";
  if (mimeType?.includes("zip")) return "ZIP";
  return "FILE";
}

function documentStyle(extension: string) {
  if (extension === "PDF") return { icon: FileText, bg: "bg-red-50", text: "text-red-600", label: "PDF" };
  if (["XLS", "XLSX", "CSV"].includes(extension)) return { icon: FileSpreadsheet, bg: "bg-emerald-50", text: "text-emerald-700", label: extension };
  if (["DOC", "DOCX"].includes(extension)) return { icon: FileText, bg: "bg-blue-50", text: "text-blue-700", label: extension };
  if (["PPT", "PPTX"].includes(extension)) return { icon: Presentation, bg: "bg-orange-50", text: "text-orange-700", label: extension };
  if (["ZIP", "RAR"].includes(extension)) return { icon: FileArchive, bg: "bg-stone-100", text: "text-stone-700", label: extension };
  return { icon: FileText, bg: "bg-[#B88746]/10", text: "text-[#B88746]", label: extension };
}

export default function NewsMediaBlocks({ mediaItems }: { mediaItems?: PostMedia[] }) {
  const images = useMemo(() => (mediaItems || []).filter((item) => item.type === "image" && item.url), [mediaItems]);
  const videos = useMemo(() => (mediaItems || []).filter((item) => (item.type === "video_upload" || item.type === "youtube") && item.url), [mediaItems]);
  const documents = useMemo(() => (mediaItems || []).filter((item) => item.type === "document" && item.url), [mediaItems]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideos, setActiveVideos] = useState<string[]>([]);

  if (!images.length && !videos.length && !documents.length) return null;

  const currentImage = images[activeImage];
  const moveLightbox = (step: number) => {
    setLightboxIndex((current) => {
      if (current === null) return current;
      return (current + step + images.length) % images.length;
    });
  };

  return (
    <section className="space-y-6">
      {images.length > 0 && currentImage?.url && (
        <div className="rounded-[24px] border border-[#E8DCCB]/80 bg-white p-3 shadow-[0_18px_50px_rgba(31,27,22,0.06)] sm:p-4">
          <div className="mb-4 px-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B88746]">Album hình ảnh</p>
            {currentImage.title && <h2 className="mt-2 text-xl font-black text-[#1F1B16]">{currentImage.title}</h2>}
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] bg-[#FBF8F2]">
            <button type="button" onClick={() => setLightboxIndex(activeImage)} className="absolute inset-0 z-10" aria-label="Xem ảnh lớn" />
            <Image src={currentImage.url} alt={currentImage.title || "Album ảnh tin tức"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 860px" />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1F1B16] shadow-sm transition hover:bg-[#B88746] hover:text-white">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1F1B16] shadow-sm transition hover:bg-[#B88746] hover:text-white">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((item, index) => (
                <button key={`${item.url}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${index === activeImage ? "border-[#B88746]" : "border-[#E8DCCB] opacity-75 hover:opacity-100"}`}>
                  {item.url && <Image src={item.url} alt={item.title || `Ảnh ${index + 1}`} fill className="object-cover" sizes="96px" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <section>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B88746]">Video nổi bật</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F1B16]">Trải nghiệm dự án qua video</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {videos.map((video, index) => (
              <div key={`${video.url}-${index}`} className="overflow-hidden rounded-[22px] border border-[#E8DCCB]/80 bg-white shadow-[0_18px_50px_rgba(31,27,22,0.06)]">
                <div className="relative aspect-video bg-black">
                  {video.type === "youtube" ? (
                    activeVideos.includes(video.url || "") ? (
                      <iframe src={`${getYouTubeEmbedUrl(video.url)}?autoplay=1`} title={video.title || "Video tin tức"} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                    ) : (
                      <button type="button" onClick={() => video.url && setActiveVideos((current) => [...current, video.url!])} className="group absolute inset-0 flex items-center justify-center overflow-hidden" aria-label={`Phát ${video.title || `video ${index + 1}`}`}>
                        <Image src={video.thumbnail_url || getYouTubeThumbnailUrl(video.url) || "/file.svg"} alt={video.title || "Ảnh đại diện video"} fill className="object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-70" sizes="(max-width: 1024px) 100vw, 430px" />
                        <span className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#B88746] shadow-xl transition group-hover:scale-105"><Play className="ml-1 h-7 w-7 fill-current" /></span>
                      </button>
                    )
                  ) : (
                    <video src={video.url || ""} controls preload="metadata" poster={video.thumbnail_url || undefined} className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B88746]/10 text-[#B88746]">
                    <FileVideo className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#B88746]">{video.type === "youtube" ? "YouTube" : "Video upload"}</p>
                    <h3 className="text-sm font-bold leading-5 text-[#1F1B16]">{video.title || `Video ${index + 1}`}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="rounded-[24px] border border-[#E8DCCB]/80 bg-white p-5 shadow-[0_18px_50px_rgba(31,27,22,0.06)] sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B88746]">Tài liệu đính kèm</p>
          <h2 className="mt-2 text-2xl font-black text-[#1F1B16]">Tải về brochure và tài liệu liên quan</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc, index) => {
              const extension = getFileExtension(doc.url, doc.mime_type);
              const style = documentStyle(extension);
              const Icon = style.icon;
              return (
                <a key={`${doc.url}-${index}`} href={doc.url || "#"} target="_blank" rel="noopener noreferrer" className="group flex min-h-[118px] flex-col justify-between rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-4 transition hover:border-[#B88746] hover:bg-white">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 block">
                    <span className="line-clamp-2 text-sm font-black leading-5 text-[#1F1B16]">{doc.title || `Tài liệu ${index + 1}`}</span>
                    <span className="mt-2 flex items-center justify-between gap-3 text-[11px] font-bold text-[#8C7A6B]">
                      <span>{style.label}{formatBytes(doc.file_size) ? ` - ${formatBytes(doc.file_size)}` : ""}</span>
                      <span className="inline-flex items-center gap-1 text-[#B88746]">Tải xuống <Download className="h-3.5 w-3.5" /></span>
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {lightboxIndex !== null && images[lightboxIndex]?.url && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4" onClick={() => setLightboxIndex(null)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-[#1F1B16]" onClick={() => setLightboxIndex(null)} aria-label="Đóng ảnh">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#1F1B16]">
            {lightboxIndex + 1}/{images.length}
          </div>
          {images.length > 1 && (
            <>
              <button type="button" className="absolute left-4 top-1/2 rounded-full bg-white/90 p-3 text-[#1F1B16]" onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }} aria-label="Ảnh trước">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" className="absolute right-4 top-1/2 rounded-full bg-white/90 p-3 text-[#1F1B16]" onClick={(event) => { event.stopPropagation(); moveLightbox(1); }} aria-label="Ảnh tiếp theo">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <a href={images[lightboxIndex].url || "#"} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#1F1B16]">
            Mở ảnh gốc <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <img src={images[lightboxIndex].url || ""} alt={images[lightboxIndex].title || "Ảnh tin tức"} className="max-h-[86vh] max-w-[94vw] rounded-2xl object-contain" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
