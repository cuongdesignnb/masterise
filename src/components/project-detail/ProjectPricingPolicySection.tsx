'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Images,
  MessageCircle,
  X,
  ZoomIn,
} from 'lucide-react';
import RichHtmlContent from '@/components/content/RichHtmlContent';
import { ProjectSectionTitle } from '@/components/project-detail/ProjectTypography';
import type { ProjectDetail } from '@/types/project-detail';
import {
  buildLegacyPricingPolicyHtml,
  derivePricingPolicyGallery,
  formatProjectUpdatedAt,
  preparePricingPolicyHtml,
} from '@/lib/projectPricingPolicy';

type Props = {
  project: ProjectDetail;
};

const COLLAPSED_HEIGHT = 720;

function PricingImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#fbf4e9] px-6 text-center text-sm text-[#6f665c]`} role="img" aria-label={alt}>
        Ảnh hiện chưa tải được
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export default function ProjectPricingPolicySection({ project }: Props) {
  const canonicalHtml = project.pricingPolicyDescription?.trim() || '';
  const fallbackHtml = useMemo(
    () => canonicalHtml ? '' : buildLegacyPricingPolicyHtml(project.priceRows, project.policies),
    [canonicalHtml, project.policies, project.priceRows],
  );
  const preparedContent = useMemo(
    () => preparePricingPolicyHtml(canonicalHtml || fallbackHtml),
    [canonicalHtml, fallbackHtml],
  );
  const gallery = useMemo(
    () => derivePricingPolicyGallery(project.priceRows, project.policies),
    [project.policies, project.priceRows],
  );
  const updatedDate = formatProjectUpdatedAt(project.updatedAt);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canCollapse, setCanCollapse] = useState(false);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const contentMeasureRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = contentMeasureRef.current;
    if (!element) return;
    const update = () => setCanCollapse(element.scrollHeight > COLLAPSED_HEIGHT + 24);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.querySelectorAll('img').forEach((image) => {
      image.addEventListener('load', update);
      image.addEventListener('error', update);
    });
    return () => observer.disconnect();
  }, [preparedContent.html]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowLeft') setLightboxIndex((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length);
      if (event.key === 'ArrowRight') setLightboxIndex((current) => current === null ? null : (current + 1) % gallery.length);
      if (event.key === 'Tab') {
        const dialog = closeButtonRef.current?.closest('[role="dialog"]');
        const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled])') || []);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [gallery.length, lightboxIndex]);

  if (!preparedContent.html && !gallery.length) return null;

  const sectionHeading = project.sectionTitles?.pricingPolicy;
  const eyebrow = sectionHeading?.eyebrow?.trim() || 'THÔNG TIN DỰ ÁN';
  const title = sectionHeading?.title?.trim() || 'Bảng giá & Chính sách bán hàng';
  const safeActiveImageIndex = Math.min(activeImageIndex, Math.max(0, gallery.length - 1));
  const activeImage = gallery[safeActiveImageIndex];
  const lightboxImage = lightboxIndex === null ? null : gallery[lightboxIndex];

  const scrollToForm = () => {
    document.getElementById('project-consult-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleContent = () => {
    if (isExpanded) {
      setIsExpanded(false);
      requestAnimationFrame(() => {
        if ((contentCardRef.current?.getBoundingClientRect().top || 0) < 0) {
          contentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      return;
    }
    setIsExpanded(true);
  };

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxIndex(index);
  };

  return (
    <section className="project-pricing-policy rounded-[22px] border border-[#eadfce] bg-[#fffdf9] p-4 shadow-[0_18px_55px_rgba(87,61,28,.07)] sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9c692b]">{eyebrow}</p>
          <ProjectSectionTitle className="mt-1">{title}</ProjectSectionTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f665c] sm:text-[15px]">
            Thông tin giá bán, chính sách thanh toán, ưu đãi và tài liệu cập nhật của dự án.
          </p>
        </div>
        {updatedDate ? (
          <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-[9px] border border-[#eadfce] bg-white px-4 py-3 text-xs font-semibold text-[#6f665c]">
            <CalendarDays className="h-4 w-4 text-[#9c692b]" aria-hidden="true" />
            Cập nhật gần nhất: {updatedDate}
          </div>
        ) : null}
      </header>

      <div className={`grid items-stretch gap-5 ${preparedContent.html && gallery.length ? 'lg:grid-cols-[minmax(0,1.86fr)_minmax(330px,1fr)]' : ''}`}>
        {preparedContent.html ? (
          <article ref={contentCardRef} className="min-w-0 rounded-[16px] border border-[#eadfce] bg-white p-4 shadow-[0_10px_28px_rgba(87,61,28,.045)] sm:p-5">
            <h3 className="text-base font-semibold text-[#1f1b16] sm:text-lg">Mô tả bảng giá &amp; chính sách</h3>

            {preparedContent.headings.length >= 2 ? (
              <details className="mt-4 rounded-[10px] border border-[#eadfce] bg-[#fffdf9] p-3 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-[#1f1b16]">Nội dung chính</summary>
                <nav className="mt-3 space-y-2" aria-label="Mục lục bảng giá và chính sách">
                  {preparedContent.headings.map((heading) => (
                    <a key={heading.id} href={`#${heading.id}`} className="block text-sm text-[#6f665c] hover:text-[#9c692b]">{heading.label}</a>
                  ))}
                </nav>
              </details>
            ) : null}

            <div className={`mt-4 ${preparedContent.headings.length >= 2 ? 'lg:grid lg:grid-cols-[174px_minmax(0,1fr)] lg:gap-5' : ''}`}>
              {preparedContent.headings.length >= 2 ? (
                <nav className="hidden self-start rounded-[10px] border border-[#eadfce] bg-[#fffdf9] p-3 lg:sticky lg:top-28 lg:block" aria-label="Mục lục bảng giá và chính sách">
                  <p className="mb-3 text-sm font-semibold text-[#1f1b16]">Nội dung chính</p>
                  <div className="space-y-1.5 border-l border-[#eadfce]">
                    {preparedContent.headings.map((heading, index) => (
                      <a key={heading.id} href={`#${heading.id}`} className={`block border-l-2 px-3 py-1.5 text-xs leading-5 transition ${index === 0 ? '-ml-px border-[#b88746] font-semibold text-[#9c692b]' : '-ml-px border-transparent text-[#6f665c] hover:border-[#d7b98d] hover:text-[#9c692b]'}`}>
                        {heading.label}
                      </a>
                    ))}
                  </div>
                </nav>
              ) : null}

              <div className="min-w-0">
                <div
                  id="project-pricing-policy-content"
                  className={`project-pricing-content-collapse relative ${canCollapse && !isExpanded ? 'is-collapsed' : ''}`}
                  style={canCollapse && !isExpanded ? { maxHeight: COLLAPSED_HEIGHT } : undefined}
                >
                  <div ref={contentMeasureRef}>
                    <RichHtmlContent variant="project" html={preparedContent.html} className="pricing-policy-rich-content text-[#4f4942]" />
                  </div>
                  {canCollapse && !isExpanded ? <div className="project-pricing-collapse-fade" aria-hidden="true" /> : null}
                </div>
                {canCollapse ? (
                  <div className="mt-4 flex justify-center">
                    <button type="button" aria-expanded={isExpanded} aria-controls="project-pricing-policy-content" onClick={toggleContent} className="inline-flex min-h-10 items-center gap-2 rounded-[9px] border border-[#d8bc91] bg-white px-4 text-xs font-semibold text-[#9c692b] shadow-sm transition hover:bg-[#fbf4e9]">
                      {isExpanded ? 'Thu gọn nội dung' : 'Xem thêm nội dung'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ) : null}

        {activeImage ? (
          <aside className="min-w-0 rounded-[16px] border border-[#eadfce] bg-white p-4 shadow-[0_10px_28px_rgba(87,61,28,.045)] sm:p-5">
            <h3 className="text-base font-semibold text-[#1f1b16] sm:text-lg">Ảnh bảng giá &amp; chính sách</h3>
            <div className="relative mt-4 aspect-[4/4.15] overflow-hidden rounded-[10px] border border-[#eadfce] bg-[#fbf4e9]">
              <PricingImage src={activeImage.url} alt={activeImage.title} className="h-full w-full object-contain" />
              <div className="absolute inset-x-3 bottom-3 flex flex-wrap justify-between gap-2">
                <button type="button" onClick={() => openLightbox(safeActiveImageIndex)} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-white px-3 text-xs font-semibold text-[#1f1b16] shadow-lg transition hover:text-[#9c692b]">
                  <ZoomIn className="h-4 w-4" aria-hidden="true" /> Phóng to
                </button>
                <button type="button" onClick={() => openLightbox(safeActiveImageIndex)} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-white px-3 text-xs font-semibold text-[#1f1b16] shadow-lg transition hover:text-[#9c692b]">
                  <Images className="h-4 w-4" aria-hidden="true" /> Xem tất cả ảnh
                </button>
              </div>
            </div>

            {gallery.length > 1 ? (
              <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Chọn ảnh bảng giá và chính sách">
                {gallery.slice(0, 3).map((image, index) => (
                  <button key={image.url} type="button" onClick={() => setActiveImageIndex(index)} aria-label={`Xem ${image.title}`} aria-pressed={safeActiveImageIndex === index} className={`aspect-[4/3] overflow-hidden rounded-[8px] border-2 bg-[#fbf4e9] p-0.5 transition ${safeActiveImageIndex === index ? 'border-[#b88746]' : 'border-transparent hover:border-[#d8bc91]'}`}>
                    <PricingImage src={image.url} alt="" className="h-full w-full rounded-[5px] object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <p className="mt-4 text-sm font-medium leading-6 text-[#1f1b16]">{activeImage.title}</p>
            {activeImage.description ? <p className="mt-1 text-xs leading-5 text-[#6f665c]">{activeImage.description}</p> : null}
            {updatedDate ? (
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#6f665c]">
                <CalendarDays className="h-4 w-4 text-[#9c692b]" aria-hidden="true" /> Cập nhật {updatedDate}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-[16px] border border-[#e4cfae] bg-[#fffaf2] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f3dfbd] text-[#9c692b] ring-8 ring-[#fbf0dd]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-[#1f1b16] sm:text-lg">Nhận bảng giá &amp; chính sách mới nhất</h3>
            <p className="mt-1 text-xs leading-5 text-[#6f665c] sm:text-sm">Chuyên viên sẽ gửi tài liệu cập nhật theo loại căn và nhu cầu của bạn.</p>
          </div>
        </div>
        <div className="grid shrink-0 gap-2 sm:grid-cols-2">
          <button type="button" onClick={scrollToForm} className="min-h-11 rounded-[9px] bg-[#b88746] px-6 text-sm font-semibold text-white transition hover:bg-[#9c692b]">Nhận bảng giá</button>
          <button type="button" onClick={scrollToForm} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border border-[#b88746] bg-white px-6 text-sm font-semibold text-[#1f1b16] transition hover:bg-[#fbf4e9]">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Đăng ký tư vấn
          </button>
        </div>
      </div>

      {lightboxImage ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Thư viện ảnh bảng giá và chính sách" onMouseDown={(event) => { if (event.target === event.currentTarget) setLightboxIndex(null); }}>
          <button ref={closeButtonRef} type="button" aria-label="Đóng thư viện ảnh" onClick={() => setLightboxIndex(null)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#1f1b16] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88746]">
            <X className="h-5 w-5" />
          </button>
          {gallery.length > 1 ? (
            <>
              <button type="button" aria-label="Ảnh trước" onClick={() => setLightboxIndex((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length)} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1f1b16] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88746] sm:left-6">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" aria-label="Ảnh tiếp theo" onClick={() => setLightboxIndex((current) => current === null ? null : (current + 1) % gallery.length)} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1f1b16] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88746] sm:right-6">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div className="flex max-h-[90vh] max-w-[92vw] flex-col items-center gap-3">
            <PricingImage src={lightboxImage.url} alt={lightboxImage.title} className="max-h-[78vh] max-w-full rounded-[10px] bg-white object-contain" />
            <div className="text-center text-white">
              <p className="text-sm font-semibold">{lightboxImage.title}</p>
              <p className="mt-1 text-xs text-white/70">{(lightboxIndex || 0) + 1} / {gallery.length}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
