"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  X,
  ZoomIn,
} from "lucide-react";
import type { ProjectDetail, ProjectPriceItem } from "@/types/project-detail";

type Props = {
  project: ProjectDetail;
};

const fileIconMap = {
  pdf: FileText,
  excel: FileSpreadsheet,
  word: FileText,
  image: ImageIcon,
  other: FileText,
};

function getFileName(url: string) {
  return decodeURIComponent(url.split("/").pop()?.split("?")[0] || "Tài liệu");
}

function isImageFile(item: Extract<ProjectPriceItem, { kind: "file" }>) {
  return item.fileType === "image" || /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(item.fileUrl);
}

export default function ProjectPricingPolicySection({ project }: Props) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxImage) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxImage(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage]);

  const { rowItems, imageItems, fileItems, noteItems } = useMemo(() => {
    const items = Array.isArray(project.priceRows) ? project.priceRows : [];
    return {
      rowItems: items.filter((item): item is Extract<ProjectPriceItem, { kind: "row" }> => item.kind === "row"),
      imageItems: items.filter((item): item is Extract<ProjectPriceItem, { kind: "image" }> => item.kind === "image" && Boolean(item.imageUrl)),
      fileItems: items.filter((item): item is Extract<ProjectPriceItem, { kind: "file" }> => item.kind === "file" && Boolean(item.fileUrl)),
      noteItems: items.filter((item): item is Extract<ProjectPriceItem, { kind: "note" }> => item.kind === "note"),
    };
  }, [project.priceRows]);

  const hasPriceData = rowItems.length > 0 || imageItems.length > 0 || fileItems.length > 0 || noteItems.length > 0;
  const hasPolicyData = project.policies.length > 0;

  if (!hasPriceData && !hasPolicyData) return null;

  const scrollToForm = () => {
    document.getElementById("project-consult-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="rounded-[24px] border border-line/80 bg-[#fffaf4] p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 text-left lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-gold normal-case">
            {project.sectionTitles?.pricingPolicy?.eyebrow || "Bảng giá & Chính sách"}
          </p>
          <h2 className="heading-font mt-2 text-[24px] font-semibold leading-tight text-ink normal-case sm:text-[30px]">
            {project.sectionTitles?.pricingPolicy?.title || "Cập nhật giá bán và chính sách ưu đãi"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
            Cập nhật thông tin giá bán, tiến độ thanh toán và chính sách ưu đãi mới nhất của dự án.
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToForm}
          className="gold-gradient inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-3 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5"
        >
          Nhận bảng giá <Download className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {hasPriceData ? (
          <div className="rounded-[20px] border border-line/80 bg-white p-4 shadow-[0_12px_35px_rgba(87,61,28,.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-ink">Bảng giá & tài liệu giá</h3>
                <p className="mt-1 text-xs leading-5 text-muted">Ảnh, file và dòng giá được lấy từ dữ liệu admin.</p>
              </div>
              <BadgeDollarSign className="h-8 w-8 text-gold" />
            </div>

            {imageItems.length > 0 ? (
              <div className="mb-4 grid gap-4">
                {imageItems.map((item, index) => (
                  <article key={`${item.imageUrl}-${index}`} className="overflow-hidden rounded-[16px] border border-line/80 bg-[#fbf7f0]">
                    <button
                      type="button"
                      onClick={() => setLightboxImage(item.imageUrl)}
                      className="group relative block w-full overflow-hidden bg-[#fbf7f0] text-left"
                    >
                      <img src={item.imageUrl} alt={item.title || "Bảng giá dự án"} className="h-auto w-full object-contain" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-gold-dark shadow-sm">Bảng giá</span>
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-ink shadow-lg">
                          <ZoomIn className="h-4 w-4" /> {item.buttonLabel || "Xem ảnh lớn"}
                        </span>
                      </span>
                    </button>
                    <div className="p-3">
                      {item.title ? <h4 className="text-[13px] font-bold text-ink">{item.title}</h4> : null}
                      {item.description ? <p className="mt-1 text-[12px] leading-5 text-muted">{item.description}</p> : null}
                      <a href={item.imageUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-gold-dark">
                        Mở ảnh gốc <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {fileItems.length > 0 ? (
              <div className="mb-4 grid gap-4">
                {fileItems.map((item, index) => {
                  if (isImageFile(item)) {
                    return (
                      <article key={`${item.fileUrl}-${index}`} className="overflow-hidden rounded-[16px] border border-line/80 bg-[#fbf7f0]">
                        <button
                          type="button"
                          onClick={() => setLightboxImage(item.fileUrl)}
                          className="group relative block w-full overflow-hidden bg-[#fbf7f0] text-left"
                        >
                          <img src={item.fileUrl} alt={item.title || "Bảng giá dự án"} className="h-auto w-full object-contain" />
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-gold-dark shadow-sm">Bảng giá</span>
                          <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-ink shadow-lg">
                              <ZoomIn className="h-4 w-4" /> {item.buttonLabel || "Xem ảnh lớn"}
                            </span>
                          </span>
                        </button>
                        <div className="p-3">
                          {item.title ? <h4 className="text-[13px] font-bold text-ink">{item.title}</h4> : null}
                          {item.description ? <p className="mt-1 text-[12px] leading-5 text-muted">{item.description}</p> : null}
                          <a href={item.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-gold-dark">
                            Mở ảnh gốc <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </article>
                    );
                  }

                  const Icon = fileIconMap[item.fileType || "other"] || FileText;
                  return (
                    <a key={`${item.fileUrl}-${index}`} href={item.fileUrl} target="_blank" rel="noreferrer" className="flex gap-3 rounded-[14px] border border-line/80 bg-[#fcfaf6] p-3 transition hover:border-gold/50 hover:bg-white">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gold shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold text-ink">{item.title || getFileName(item.fileUrl)}</span>
                        {item.description ? <span className="mt-1 block text-[12px] leading-5 text-muted">{item.description}</span> : null}
                        <span className="mt-1 block text-[10px] font-bold text-gold-dark">{item.fileSize || item.fileType || "Tài liệu"}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : null}

            {rowItems.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto rounded-[14px] border border-line/80 md:block">
                  <table className="w-full min-w-[720px] border-collapse text-left text-[12px]">
                    <thead className="bg-[#fbf7f0] text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Loại sản phẩm</th>
                        <th className="px-4 py-3 font-semibold">Diện tích</th>
                        <th className="px-4 py-3 font-semibold">Giá tham khảo</th>
                        <th className="px-4 py-3 font-semibold">Thanh toán</th>
                        <th className="px-4 py-3 font-semibold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowItems.map((row, index) => (
                        <tr key={`${row.productType}-${index}`} className="border-t border-line/70 transition hover:bg-beige/35">
                          <td className="px-4 py-3 font-bold text-ink">{row.productType}</td>
                          <td className="px-4 py-3 text-muted">{row.area}</td>
                          <td className="px-4 py-3 font-bold text-gold-dark">{row.price}</td>
                          <td className="px-4 py-3 text-muted">{row.payment || row.note || "-"}</td>
                          <td className="px-4 py-3 text-muted">{row.status || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-2 md:hidden">
                  {rowItems.map((row, index) => (
                    <article key={`${row.productType}-${index}`} className="rounded-[14px] border border-line/80 bg-[#fcfaf6] p-3">
                      <h4 className="text-[13px] font-bold text-ink">{row.productType}</h4>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <span className="text-muted">Diện tích: <strong className="text-ink">{row.area}</strong></span>
                        <span className="text-muted">Giá: <strong className="text-gold-dark">{row.price}</strong></span>
                      </div>
                      {row.payment || row.status || row.note ? <p className="mt-2 text-[12px] leading-5 text-muted">{row.payment || row.status || row.note}</p> : null}
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            {noteItems.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {noteItems.map((item, index) => (
                  <div key={`${item.title}-${index}`} className={`rounded-[14px] border p-3 text-[12px] leading-5 ${item.highlight ? "border-gold/50 bg-[#fff7ea] text-ink" : "border-line/80 bg-[#fcfaf6] text-muted"}`}>
                    {item.title ? <p className="font-bold text-ink">{item.title}</p> : null}
                    {item.description ? <p className="mt-1">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasPolicyData ? (
          <div className="space-y-3">
            {project.policies.map((policy, index) => (
              <article key={`${policy.title}-${index}`} className="overflow-hidden rounded-[20px] border border-line/80 bg-white shadow-[0_12px_35px_rgba(87,61,28,.06)] transition hover:-translate-y-0.5 hover:border-gold/50">
                {policy.imageUrl ? (
                  <button type="button" onClick={() => setLightboxImage(policy.imageUrl || null)} className="relative block w-full overflow-hidden bg-[#fbf7f0]">
                    <img src={policy.imageUrl} alt={policy.title} className="h-auto w-full object-contain" />
                  </button>
                ) : null}
                <div className="p-4">
                  {policy.badge ? <span className="mb-2 inline-flex rounded-full bg-[#fff7ea] px-3 py-1 text-[10px] font-bold text-gold-dark">{policy.badge}</span> : null}
                  <h3 className="text-[14px] font-bold leading-5 text-ink">{policy.title}</h3>
                  {policy.description ? <p className="mt-2 text-[12px] leading-5 text-muted">{policy.description}</p> : null}
                  {policy.bullets.length ? (
                    <ul className="mt-3 space-y-1.5">
                      {policy.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-[12px] leading-5 text-muted">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {(policy.fileUrl || policy.ctaUrl) ? (
                    <a href={policy.fileUrl || policy.ctaUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-gold-dark">
                      {policy.ctaLabel || "Xem chi tiết"} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-[18px] border border-gold/30 bg-white/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Nhận bảng giá & chính sách mới nhất</h3>
          <p className="mt-1 text-[12px] leading-5 text-muted">Chuyên viên sẽ gửi tài liệu chi tiết theo từng giai đoạn mở bán.</p>
        </div>
        <button type="button" onClick={scrollToForm} className="gold-gradient mt-3 rounded-[8px] px-5 py-3 text-[11px] font-bold text-white sm:mt-0">
          Đăng ký nhận bảng giá
        </button>
      </div>

      {lightboxImage ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4" onClick={() => setLightboxImage(null)}>
          <button type="button" aria-label="Đóng ảnh" onClick={() => setLightboxImage(null)} className="absolute right-4 top-4 rounded-full bg-white p-2 text-ink shadow-lg">
            <X className="h-5 w-5" />
          </button>
          <img src={lightboxImage} alt="Ảnh phóng to" className="max-h-[86vh] max-w-[94vw] rounded-[14px] object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </section>
  );
}
