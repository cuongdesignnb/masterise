"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Dumbbell,
  FileCheck2,
  GraduationCap,
  HardHat,
  LandPlot,
  MapPin,
  Network,
  PanelsTopLeft,
  Play,
  Plus,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trees,
  TrendingUp,
  Waves,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useState, useEffect, useMemo, useRef } from "react";
import type { ProjectIconName, ProjectDetail } from "@/types/project-detail";
import ProjectGalleryAlbumSection from "@/components/project-detail/ProjectGalleryAlbumSection";
import ProjectPricingPolicySection from "@/components/project-detail/ProjectPricingPolicySection";
import VR360Section from "@/components/vr360/VR360Section";
import { leadService } from "@/services/leadService";

const iconMap: Record<ProjectIconName, LucideIcon> = {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  FileCheck2,
  GraduationCap,
  HardHat,
  LandPlot,
  MapPin,
  Network,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  Store,
  Trees,
  TrendingUp,
  Waves,
};

const ease = [0.22, 1, 0.36, 1] as const;
const compactProductLabels = new Set([
  "gia tham khao",
  "ban giao",
  "dien tich",
  "so luong san pham",
  "so block",
  "so tang",
  "so huu",
]);

function normalizeInfoLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeOption(value: unknown) {
  return String(value || "").trim();
}

function isAllOption(value: string) {
  return value.toLocaleLowerCase("vi-VN") === "tất cả";
}

function getYouTubeEmbedUrl(url: string) {
  const trimmedUrl = url.trim();

  try {
    const parsedUrl = new URL(trimmedUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (hostname === "youtu.be") {
      const id = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : trimmedUrl;
    }

    if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      if (parsedUrl.pathname.startsWith("/embed/")) {
        return trimmedUrl;
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        const id = parsedUrl.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : trimmedUrl;
      }

      const id = parsedUrl.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : trimmedUrl;
    }
  } catch {
    const match = trimmedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return trimmedUrl;
}

function isVideoFileUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function ProjectVideoFrame({
  url,
  embedUrl,
  title,
}: {
  url: string;
  embedUrl: string;
  title: string;
}) {
  return (
    <div className="aspect-video w-full bg-black">
      {isVideoFileUrl(url) ? (
        <video src={url} controls className="h-full w-full" />
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}

function getConsultInterestOptions(project: ProjectDetail) {
  const options = new Set<string>();

  project.floorTabs.forEach((tab) => {
    const label = normalizeOption(tab);
    if (label && !isAllOption(label)) {
      options.add(label);
    }
  });

  project.floorPlans.forEach((plan) => {
    const productType = normalizeOption(plan.productType);
    const name = normalizeOption(plan.name);

    if (productType && !isAllOption(productType)) {
      options.add(productType);
    } else if (name) {
      options.add(name);
    }
  });

  project.priceRows.forEach((row) => {
    if (row.kind !== "row") return;
    const productType = normalizeOption(row.productType);
    if (productType && !isAllOption(productType)) {
      options.add(productType);
    }
  });

  if (options.size === 0) {
    options.add("Tư vấn dự án hiện tại");
    options.add("Căn hộ");
    options.add("Duplex");
    options.add("Penthouse");
    options.add("Shophouse");
  }

  return Array.from(options);
}

function ProjectContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0.82, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProjectIcon({
  name,
  size = 22,
  className = "",
}: {
  name: ProjectIconName;
  size?: number;
  className?: string;
}) {
  const Icon = iconMap[name];
  return <Icon size={size} strokeWidth={1.65} className={className} />;
}

function SectionTitle({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow ? (
        <p className="mb-1.5 text-[11px] font-bold tracking-[0.14em] text-gold normal-case">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="heading-font text-[24px] font-semibold leading-tight tracking-[0.02em] text-ink normal-case sm:text-[30px]">
        {children}
      </h2>
    </div>
  );
}

function LocationMap({ projectName, mapImageUrl }: { projectName: string; mapImageUrl?: string | null }) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (!isMapOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMapOpen]);

  if (mapImageUrl) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="group relative flex h-[330px] w-full items-center justify-center overflow-hidden rounded-[18px] border border-gold/35 bg-[#faf7f0] text-left lg:h-[410px]"
        >
          <img
            src={mapImageUrl}
            alt={`Bản đồ dự án ${projectName}`}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.015] sm:p-3"
          />
          <div className="absolute bottom-3 right-3 rounded-full border border-line bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-muted shadow-sm backdrop-blur">
            Bấm để phóng to
          </div>
        </button>
        <AnimatePresence>
          {isMapOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
              onClick={() => setIsMapOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-ink shadow-lg"
                aria-label="Đóng bản đồ"
              >
                <X className="h-5 w-5" />
              </button>
              <motion.img
                src={mapImageUrl}
                alt={`Bản đồ dự án ${projectName}`}
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 12 }}
                transition={{ duration: 0.24, ease }}
                className="max-h-[88vh] max-w-[94vw] rounded-[14px] bg-white object-contain p-2 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </>
    );
  }

  return null;
}

export default function ProjectDetailClient({ project }: { project: ProjectDetail }) {
  const floorTabs = project.floorTabs.length ? ["Tất cả", ...project.floorTabs] : (project.floorPlans.length ? ["Sản phẩm"] : []);
  const consultInterestOptions = useMemo(() => getConsultInterestOptions(project), [project]);
  const projectVideoEmbedUrl = useMemo(() => project.videoUrl ? getYouTubeEmbedUrl(project.videoUrl) : "", [project.videoUrl]);
  const [activeTab, setActiveTab] = useState(floorTabs[0] ?? "");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [floorPlanImageModal, setFloorPlanImageModal] = useState<{ images: string[]; index: number; title: string } | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [heroTextExpanded, setHeroTextExpanded] = useState(false);
  const [canToggleHeroText, setCanToggleHeroText] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [floorPlansExpanded, setFloorPlansExpanded] = useState(false);
  const [floorPlanLimit, setFloorPlanLimit] = useState(6);
  const [consultStatus, setConsultStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [consultError, setConsultError] = useState("");
  const [consultForm, setConsultForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "",
  });
  const heroSubtitleRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (!consultForm.interest && consultInterestOptions.length > 0) {
      setConsultForm((value) => ({
        ...value,
        interest: consultInterestOptions[0],
      }));
    }
  }, [consultForm.interest, consultInterestOptions]);

  const handleConsultSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConsultError("");

    if (!consultForm.name.trim() || !consultForm.phone.trim()) {
      setConsultError("Vui lòng nhập họ tên và số điện thoại.");
      setConsultStatus("error");
      return;
    }

    if (consultForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consultForm.email)) {
      setConsultError("Email chưa đúng định dạng.");
      setConsultStatus("error");
      return;
    }

    setConsultStatus("loading");

    try {
      const params = new URLSearchParams(window.location.search);
      const selectedInterest = consultForm.interest || consultInterestOptions[0] || "Tư vấn dự án hiện tại";
      await leadService.submitLead({
        name: consultForm.name.trim(),
        phone: consultForm.phone.trim(),
        email: consultForm.email.trim() || undefined,
        type: "consultation",
        project_id: project.id,
        demand_type: selectedInterest,
        product_type: selectedInterest,
        message: `Khách hàng đăng ký tư vấn dự án ${project.name} - nhu cầu: ${selectedInterest}`,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
        utm_term: params.get("utm_term") || undefined,
        landing_page: window.location.href,
        referrer: document.referrer || undefined,
        visitor_id: localStorage.getItem("mh_visitor_id") || undefined,
        lead_source_position: "project_detail_consult_form",
      });

      setConsultStatus("success");
      setConsultForm({ name: "", phone: "", email: "", interest: consultInterestOptions[0] || "Tư vấn dự án hiện tại" });
    } catch (err: unknown) {
      setConsultError(err instanceof Error ? err.message : "Chưa thể gửi thông tin. Vui lòng thử lại sau.");
      setConsultStatus("error");
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeImageIndex !== null || floorPlanImageModal || isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeImageIndex, floorPlanImageModal, isVideoModalOpen]);

  useEffect(() => {
    if (!isVideoModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoModalOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (activeImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveImageIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => 
          prev !== null ? (prev + 1) % project.gallery.images.length : null
        );
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => 
          prev !== null 
            ? (prev - 1 + project.gallery.images.length) % project.gallery.images.length 
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, project.gallery.images.length]);

  useEffect(() => {
    if (!floorPlanImageModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFloorPlanImageModal(null);
      } else if (e.key === "ArrowRight") {
        setFloorPlanImageModal((current) => current
          ? { ...current, index: (current.index + 1) % current.images.length }
          : current);
      } else if (e.key === "ArrowLeft") {
        setFloorPlanImageModal((current) => current
          ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length }
          : current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [floorPlanImageModal]);

  useEffect(() => {
    const measureHeroText = () => {
      const shouldToggle = heroSubtitleRefs.current.some((element) => {
        if (!element) return false;
        const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
        return Number.isFinite(lineHeight) && element.scrollHeight > lineHeight * 3 + 2;
      });
      setCanToggleHeroText(shouldToggle);
      if (!shouldToggle) {
        setHeroTextExpanded(false);
      }
    };

    measureHeroText();
    window.addEventListener("resize", measureHeroText);
    return () => {
      window.removeEventListener("resize", measureHeroText);
    };
  }, [project.subtitle]);

  useEffect(() => {
    const updateFloorLimit = () => {
      const width = window.innerWidth;
      setFloorPlanLimit(width < 640 ? 2 : width < 1280 ? 4 : 6);
    };

    updateFloorLimit();
    window.addEventListener("resize", updateFloorLimit);
    return () => {
      window.removeEventListener("resize", updateFloorLimit);
    };
  }, []);

  useEffect(() => {
    setFloorPlansExpanded(false);
  }, [activeTab]);

  const hasFacts = project.facts.length > 0;
  const hasStats = project.stats.length > 0;
  const hasGallery = project.gallery.images.length > 0;
  const hasGalleryCopy = Boolean(project.gallery.label || project.gallery.title || project.gallery.description);
  const hasConnectivity = project.connectivity.length > 0 || Boolean(project.mapImageUrl);
  const hasAmenities = project.amenities.length > 0;
  const hasFloorPlans = project.floorPlans.length > 0;
  const hasFloorSection = hasFloorPlans || project.floorTabs.length > 0;
  const hasHandoverStandards = project.handoverStandards.length > 0;
  const hasPriceRows = project.priceRows.length > 0;
  const hasProductInfo = hasPriceRows || project.productSummary.length > 0;
  const hasPolicies = project.policies.length > 0;
  const hasTimeline = project.timeline.length > 0;
  const hasInvestmentReasons = project.investmentReasons.length > 0;
  const hasTestimonials = project.testimonials.length > 0;
  const hasFaqs = project.faqs.length > 0;
  const productSummaryLabels = new Set(project.productSummary.map((item) => normalizeInfoLabel(item.label)));
  const mobileHeroFactsSource = project.facts.length ? project.facts : project.quickCard;
  const mobileHeroFacts = mobileHeroFactsSource
    .filter((fact) => {
      const label = normalizeInfoLabel(fact.label);
      return !productSummaryLabels.has(label) && !compactProductLabels.has(label);
    })
    .slice(0, 4);
  const visibleFloorPlans = project.floorTabs.length && activeTab
    ? project.floorPlans.filter((plan) => activeTab === "Tất cả" || !plan.productType || plan.productType === activeTab)
    : project.floorPlans;
  const floorPlansCanExpand = visibleFloorPlans.length > floorPlanLimit;
  const displayedFloorPlans = floorPlansExpanded ? visibleFloorPlans : visibleFloorPlans.slice(0, floorPlanLimit);
  const getFloorPlanImages = (plan: ProjectDetail["floorPlans"][number]) =>
    Array.from(new Set([...(plan.images || []), plan.image].map((image) => String(image || "").trim()).filter(Boolean)));
  const openFloorPlanImages = (plan: ProjectDetail["floorPlans"][number], index = 0) => {
    const images = getFloorPlanImages(plan);
    if (!images.length) return;
    setFloorPlanImageModal({ images, index: Math.min(Math.max(index, 0), images.length - 1), title: plan.name });
  };
  const canToggleOverview = Boolean(project.content && project.content.replace(/<[^>]*>/g, '').trim().length > 520);
  const ProjectSectionTitle = ({
    sectionKey,
    fallbackTitle,
    fallbackEyebrow,
  }: {
    sectionKey: string;
    fallbackTitle: string;
    fallbackEyebrow?: string;
  }) => {
    const heading = project.sectionTitles?.[sectionKey];
    return (
      <SectionTitle eyebrow={heading?.eyebrow || fallbackEyebrow}>
        {heading?.title || fallbackTitle}
      </SectionTitle>
    );
  };

  return (
    <main className="overflow-hidden bg-ivory pb-0 pt-[76px] text-ink">
      <ProjectContainer className="space-y-5 pb-10 pt-4 sm:space-y-7 lg:pt-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="space-y-4 md:hidden"
        >
          <div className="relative h-[320px] overflow-hidden rounded-[24px] border border-white/70 bg-beige shadow-luxury">
            <Image
              src={project.heroImage}
              alt={`Toàn cảnh dự án ${project.name}`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
          <div className="rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              {project.badge ? (
                <span className="inline-flex rounded-full border border-gold/35 bg-[#fffaf2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-gold-dark">
                  {project.badge}
                </span>
              ) : null}
              {project.salesStatus ? (
                <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                  {project.salesStatus}
                </span>
              ) : null}
            </div>
            <h1 className="heading-font mt-4 text-[38px] font-medium leading-[1.08] text-ink">
              {project.name}
            </h1>
            <p
              ref={(element) => { heroSubtitleRefs.current[0] = element; }}
              className={`mt-3 text-[14px] font-medium leading-6 text-muted ${heroTextExpanded ? '' : 'line-clamp-3'}`}
            >
              {project.subtitle}
            </p>
            {canToggleHeroText ? (
              <button
                type="button"
                onClick={() => setHeroTextExpanded((value) => !value)}
                className="mt-3 text-[11px] font-bold uppercase tracking-[0.06em] text-gold-dark"
              >
                {heroTextExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            ) : null}
            <div className="mt-5 grid gap-2">
              <Link
                href="#project-consult-form"
                className="gold-gradient flex h-12 items-center justify-center rounded-[8px] text-[11px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_12px_28px_rgba(143,99,47,.24)]"
              >
                Đăng ký tư vấn
              </Link>
              {project.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-gold/45 bg-white text-[11px] font-bold uppercase tracking-[0.04em] text-gold-dark"
                >
                  <Play size={12} fill="currentColor" />
                  Xem video dự án
                </button>
              ) : null}
            </div>
            {mobileHeroFacts.length ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {mobileHeroFacts.map((fact) => (
                  <div key={`${fact.label}-${fact.value}`} className="rounded-[14px] border border-line/80 bg-[#fcfaf6] p-3">
                    <ProjectIcon name={fact.icon} size={17} className="text-gold" />
                    <p className="mt-2 text-[10px] text-muted">{fact.label}</p>
                    <p className="mt-0.5 text-[12px] font-bold leading-5 text-ink">{fact.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease }}
          className="relative hidden min-h-[610px] overflow-hidden rounded-[24px] border border-white/70 bg-beige shadow-luxury md:block lg:min-h-[600px]"
        >
          <Image
            src={project.heroImage}
            alt={`Toàn cảnh dự án ${project.name}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1500px"
            className="object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,248,.76)_0%,rgba(255,253,248,.46)_28%,rgba(255,253,248,.12)_43%,rgba(15,20,22,.03)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(255,253,248,.9)_0%,rgba(255,253,248,.52)_44%,rgba(24,27,27,.06)_100%)]" />

          <div className="relative z-10 flex min-h-[610px] items-center px-6 py-10 sm:px-10 lg:min-h-[600px] lg:px-14 xl:px-16">
            <div className="max-w-[620px] rounded-[22px] border border-white/65 bg-white/[0.54] p-5 shadow-[0_20px_56px_rgba(78,54,28,.11)] backdrop-blur-md sm:p-6 lg:bg-white/[0.48] xl:max-w-[660px]">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease }}
                className="flex flex-wrap items-center gap-2"
              >
                {project.badge ? (
                  <span className="inline-flex rounded-full border border-gold/35 bg-white/75 px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-gold-dark backdrop-blur">
                    {project.badge}
                  </span>
                ) : null}
                {project.salesStatus && (
                  <span className="inline-flex rounded-full bg-emerald-600/90 px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white shadow-sm">
                    {project.salesStatus}
                  </span>
                )}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.22, ease }}
                className="heading-font mt-5 break-words text-[42px] font-medium leading-[1.02] tracking-[0.015em] text-ink sm:text-[52px] xl:text-[58px]"
              >
                {project.name}
              </motion.h1>
              <motion.p
                ref={(element) => { heroSubtitleRefs.current[1] = element; }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease }}
                className={`mt-4 text-base font-semibold text-ink sm:text-xl ${heroTextExpanded ? '' : 'line-clamp-3'}`}
              >
                {project.subtitle}
              </motion.p>
              {canToggleHeroText ? (
                <button
                  type="button"
                  onClick={() => setHeroTextExpanded((value) => !value)}
                  className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-gold-dark transition hover:text-ink"
                >
                  {heroTextExpanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
              ) : null}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44, ease }}
                className="mt-6 flex flex-wrap gap-3"
              >
                <Link
                  href="#project-consult-form"
                  className="gold-gradient rounded-[6px] px-6 py-3.5 text-[11px] font-bold tracking-[0.05em] text-white shadow-[0_12px_28px_rgba(143,99,47,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(143,99,47,.34)]"
                >
                  ĐĂNG KÝ NHẬN THÔNG TIN
                </Link>
                {project.videoUrl ? <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-2 rounded-[6px] border border-gold/50 bg-white/85 px-5 py-3 text-[11px] font-bold text-gold-dark shadow-sm backdrop-blur transition hover:border-gold hover:bg-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/45">
                    <Play size={10} fill="currentColor" />
                  </span>
                  XEM VIDEO DỰ ÁN
                </button> : null}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {hasFacts ? <Reveal className="-mt-1 hidden rounded-[18px] border border-line/80 bg-white/90 px-4 py-4 shadow-soft md:block">
          <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0">
            {project.facts.map((fact, index) => (
              <div
                key={fact.label}
                className={`flex min-w-0 items-center gap-3 px-3 lg:px-5 ${
                  index ? "lg:border-l lg:border-line/80" : ""
                }`}
              >
                <ProjectIcon name={fact.icon} className="shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted">{fact.label}</p>
                  <p className="mt-0.5 text-[11px] font-bold leading-5 text-ink">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal> : null}

        {hasStats ? <Reveal className="rounded-[18px] border border-line/80 bg-[#fcfaf6] px-5 py-6 shadow-sm">
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
            {project.stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center lg:px-5 ${index ? "lg:border-l lg:border-line/80" : ""}`}
              >
                <p className="text-2xl font-bold text-gold sm:text-[28px]">{stat.value}</p>
                <p className="mt-2 text-[12px] font-medium text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal> : null}

        {/* TỔNG QUAN DỰ ÁN */}
        {project.content ? (
          <Reveal className="rounded-[22px] border border-line/80 bg-white p-5 shadow-soft sm:p-7">
            <section id="tong-quan">
              <ProjectSectionTitle sectionKey="overview" fallbackEyebrow="Tổng quan dự án" fallbackTitle="Giới thiệu chi tiết" />
              <div className="relative mt-5">
                <div
                  className={`prose prose-stone max-w-none text-left text-[15px] leading-7 text-ink prose-p:my-4 prose-headings:font-heading prose-headings:font-semibold prose-headings:text-[#1F1B16] prose-a:text-[#B88746] hover:prose-a:underline prose-img:rounded-2xl sm:text-base sm:leading-8 ${
                    !overviewExpanded && canToggleOverview ? 'max-h-[360px] overflow-hidden sm:max-h-[430px]' : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
                {!overviewExpanded && canToggleOverview ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-white/0 backdrop-blur-[1px]" />
                ) : null}
              </div>
              {canToggleOverview ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setOverviewExpanded((value) => !value)}
                    className="rounded-full border border-gold/35 bg-[#fffaf2] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-gold-dark transition hover:border-gold hover:bg-white"
                  >
                    {overviewExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                </div>
              ) : null}
            </section>
          </Reveal>
        ) : null}

        {hasGallery ? <Reveal
          className="rounded-[22px] border border-line/80 bg-white p-4 shadow-soft sm:p-5"
          delay={0.04}
        >
          <section id="khong-gian-song" className={`grid gap-5 ${hasGalleryCopy ? "lg:grid-cols-[320px_minmax(0,1fr)]" : ""}`}>
            {hasGalleryCopy ? (
              <div className="flex flex-col justify-center rounded-[18px] bg-[#fcfaf6] p-6 lg:p-8">
                {project.gallery.label ? (
                  <p className="text-[10px] font-bold tracking-[0.12em] text-gold">{project.gallery.label}</p>
                ) : null}
                {project.gallery.title ? (
                  <h2 className="heading-font mt-2 text-[25px] font-semibold leading-tight text-ink">
                    {project.gallery.title}
                  </h2>
                ) : null}
                {project.gallery.description ? (
                  <p className="mt-4 text-sm leading-6 text-muted sm:text-[15px] sm:leading-7">{project.gallery.description}</p>
                ) : null}
              </div>
            ) : null}
            <div className="grid h-[500px] grid-cols-2 grid-rows-4 gap-2 sm:grid-cols-4 sm:grid-rows-2 lg:h-[420px]">
              {project.gallery.images.map((image, index) => (
                <div
                  key={image}
                  onClick={() => setActiveImageIndex(index)}
                  className={`group relative overflow-hidden rounded-[13px] cursor-pointer ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${project.gallery.title} ${index + 1}`}
                    fill
                    sizes={index === 0 ? "(max-width: 768px) 100vw, 55vw" : "25vw"}
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal> : null}

        {project.videoUrl ? (
          <Reveal className="rounded-[22px] border border-line/80 bg-white p-4 shadow-soft sm:p-5" delay={0.05}>
            <section id="project-video">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] text-gold normal-case">Video giới thiệu</p>
                  <h2 className="heading-font mt-2 text-2xl font-semibold text-ink sm:text-[30px]">
                    Khám phá {project.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-[#fffaf2] px-4 py-2 text-[11px] font-bold text-gold-dark transition hover:border-gold hover:bg-white"
                >
                  Xem popup
                  <Play size={12} fill="currentColor" />
                </button>
              </div>
              <div className="overflow-hidden rounded-[18px] border border-line/80 bg-[#fbf7f0] shadow-[0_16px_40px_rgba(87,61,28,.08)]">
                <ProjectVideoFrame
                  url={project.videoUrl}
                  embedUrl={projectVideoEmbedUrl}
                  title={`Video giới thiệu ${project.name}`}
                />
              </div>
            </section>
          </Reveal>
        ) : null}

        {hasConnectivity ? <Reveal className="rounded-[22px] border border-line/80 bg-white p-5 shadow-soft sm:p-7">
          <section className={`grid items-center gap-8 ${project.mapImageUrl ? "lg:grid-cols-[310px_minmax(0,1fr)]" : ""}`}>
            <div>
              <ProjectSectionTitle sectionKey="location" fallbackEyebrow="Vị trí chiến lược" fallbackTitle="Kết nối toàn diện" />
              {project.locationDescription ? (
                <p className="mb-6 text-sm leading-6 text-muted sm:text-[15px] sm:leading-7">{project.locationDescription}</p>
              ) : null}
              <div className="space-y-4">
                {project.connectivity.map((item) => (
                  <div key={item.time} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige text-gold">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-ink">{item.time}</p>
                      <p className="text-[12px] leading-5 text-muted">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {project.mapImageUrl ? <LocationMap projectName={project.name} mapImageUrl={project.mapImageUrl} /> : null}
          </section>
        </Reveal> : null}

        {hasAmenities ? <Reveal className="rounded-[22px] border border-line/80 bg-white p-5 shadow-soft sm:p-7">
          <section id="tien-ich">
            <ProjectSectionTitle sectionKey="amenities" fallbackTitle="Tiện ích nổi bật" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {project.amenities.map((amenity) => (
                <article key={amenity.title} className="group min-w-0">
                  <div className="relative aspect-[1.25] overflow-hidden rounded-[13px] bg-beige">
                    <Image
                      src={amenity.image}
                      alt={amenity.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-start gap-2.5">
                    <ProjectIcon name={amenity.icon} size={18} className="mt-0.5 shrink-0 text-gold" />
                    <div>
                      <h3 className="text-[12px] font-bold leading-5 text-ink">{amenity.title}</h3>
                      <p className="text-[11px] leading-5 text-muted">{amenity.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal> : null}

        {hasFloorSection ? <Reveal>
          <section>
            <ProjectSectionTitle sectionKey="floorPlans" fallbackEyebrow="Mặt bằng" fallbackTitle="Mặt bằng điển hình" />
            {floorTabs.length ? <div className="mb-4 grid overflow-hidden rounded-[6px] border border-line bg-white sm:grid-cols-4">
              {floorTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b border-line px-4 py-2.5 text-[10px] font-bold normal-case transition last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                    activeTab === tab ? "gold-gradient text-white" : "text-muted hover:bg-beige/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div> : null}
            {visibleFloorPlans.length ? <>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {displayedFloorPlans.map((plan, index) => {
                const planImages = getFloorPlanImages(plan);
                const thumbnailImage = planImages[0] || "";
                return (
                <motion.article
                  key={`${plan.productType || 'floor'}-${plan.name}-${index}`}
                  layout
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-[14px] border border-line/80 bg-white shadow-[0_12px_35px_rgba(87,61,28,.07)] sm:rounded-[16px]"
                >
                  <div className="bg-[#fbfaf7] p-2 sm:p-3">
                    {thumbnailImage ? (
                      <button
                        type="button"
                        onClick={() => openFloorPlanImages(plan)}
                        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[10px] text-left sm:aspect-[16/9]"
                      >
                        <Image
                          src={thumbnailImage}
                          alt={`${plan.productType || activeTab || "Sản phẩm"} - ${plan.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-ink">Xem ảnh</span>
                        </span>
                      </button>
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[10px] border border-dashed border-line bg-white p-4 text-center text-[10px] font-semibold text-muted sm:aspect-[16/9]">
                        Chưa có ảnh mặt bằng
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] font-bold tracking-[0.08em] text-gold normal-case">
                      {plan.productType || activeTab || "Sản phẩm"} · Mẫu {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-ink">{plan.name}</h3>
                    <div className="mt-2 space-y-1.5 text-[12px] leading-5 text-muted">
                      {plan.area ? <p>Diện tích: <strong className="text-ink">{plan.area}</strong></p> : null}
                      {plan.totalArea && plan.totalArea !== plan.area ? <p>Tổng diện tích sàn: <strong className="text-ink">{plan.totalArea}</strong></p> : null}
                      {plan.price ? <p>Giá tham khảo: <strong className="text-ink">{plan.price}</strong></p> : null}
                      {plan.bedrooms ? <p>Phòng ngủ: <strong className="text-ink">{plan.bedrooms}</strong></p> : null}
                      {plan.status ? <p>Tình trạng: <strong className="text-ink">{plan.status}</strong></p> : null}
                    </div>
                    {plan.description ? <p className="mt-3 text-[12px] leading-5 text-muted">{plan.description}</p> : null}
                    {thumbnailImage ? (
                      <button
                        type="button"
                        onClick={() => openFloorPlanImages(plan)}
                        className="mt-4 w-full rounded-[5px] border border-gold/45 py-2 text-[9px] font-bold text-gold-dark transition hover:bg-gold hover:text-white"
                      >
                        XEM ẢNH LỚN
                      </button>
                    ) : null}
                  </div>
                </motion.article>
                );
              })}
              </div>
              {floorPlansCanExpand ? (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setFloorPlansExpanded((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-gold-dark shadow-sm transition hover:bg-gold hover:text-white"
                  >
                    {floorPlansExpanded ? "Thu gọn" : `Xem thêm ${visibleFloorPlans.length - floorPlanLimit} mặt bằng`}
                    <ChevronDown className={`h-4 w-4 transition ${floorPlansExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              ) : null}
            </> : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {project.floorTabs.map((tab) => (
                  <div key={tab} className="rounded-[14px] border border-line/75 bg-white p-4 shadow-[0_10px_26px_rgba(87,61,28,.05)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">Loại sản phẩm</p>
                    <p className="mt-1 text-sm font-bold text-ink">{tab}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal> : null}

        {hasHandoverStandards ? <Reveal>
          <section>
            <ProjectSectionTitle sectionKey="handover" fallbackEyebrow="Bàn giao" fallbackTitle="Tiêu chuẩn bàn giao" />
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex snap-x snap-mandatory gap-3">
              {project.handoverStandards.map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="w-[78vw] shrink-0 snap-start overflow-hidden rounded-[16px] border border-line/80 bg-white shadow-[0_10px_28px_rgba(87,61,28,.06)] sm:w-[340px] lg:w-[360px]"
                >
                  {item.image ? (
                    <div className="relative aspect-[4/3] bg-[#fbfaf7]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7ea] text-gold">
                      <ProjectIcon name={item.icon} size={19} />
                    </div>
                    <h3 className="text-[14px] font-bold leading-5 text-ink">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-muted">{item.description}</p>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </section>
        </Reveal> : null}

        <Reveal>
          <ProjectPricingPolicySection project={project} />
        </Reveal>

        {hasTimeline ? <Reveal>
          <section className="py-2">
            <ProjectSectionTitle sectionKey="timeline" fallbackTitle="Tiến độ thi công" />
            <div className="relative grid gap-5 md:grid-cols-5 md:gap-0">
              <div className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-gold/55 md:block" />
              {project.timeline.map((item, index) => {
                const active = index === project.timeline.length - 1;
                return (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0.82, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease }}
                    className="relative flex gap-4 md:block md:px-4 md:text-center"
                  >
                    <div
                      className={`relative z-10 mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-ivory ${
                        active ? "border-gold text-gold shadow-[0_0_0_5px_rgba(184,135,70,.1)]" : "border-line text-muted"
                      }`}
                    >
                      <HardHat size={18} />
                    </div>
                    <div className="pt-1 md:pt-3">
                      <p className={`text-[12px] font-bold ${active ? "text-gold-dark" : "text-ink"}`}>{item.date}</p>
                      <p className="mt-1 text-[11px] leading-5 text-muted">{item.title}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </Reveal> : null}

        {hasInvestmentReasons ? <Reveal>
          <section>
            <ProjectSectionTitle sectionKey="investment" fallbackTitle={`Vì sao nên đầu tư ${project.name}?`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {project.investmentReasons.map((reason) => (
                <motion.article
                  key={reason.title}
                  whileHover={{ y: -4 }}
                  className="rounded-[14px] border border-line/75 bg-white px-4 py-5 text-center shadow-[0_10px_26px_rgba(87,61,28,.05)]"
                >
                  <ProjectIcon name={reason.icon} size={27} className="mx-auto text-gold" />
                  <h3 className="mt-3 text-[12px] font-bold leading-5 text-ink">{reason.title}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-muted">{reason.description}</p>
                </motion.article>
              ))}
            </div>
          </section>
        </Reveal> : null}

        {hasTestimonials ? <Reveal>
          <section>
            <ProjectSectionTitle sectionKey="testimonials" fallbackTitle="Khách hàng nói gì?" />
            <div className="grid gap-4 lg:grid-cols-3">
              {project.testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="rounded-[16px] border border-line/75 bg-white p-5 shadow-[0_10px_30px_rgba(87,61,28,.05)]"
                >
                  <div className="flex gap-3">
                    <Quote size={25} fill="currentColor" className="shrink-0 text-gold/35" />
                    <p className="text-[13px] leading-6 text-muted">{testimonial.content}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold/30">
                        <Image
                          src={testimonial.avatar}
                          alt={`Ảnh đại diện ${testimonial.name}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-[12px] font-bold">{testimonial.name}</h3>
                        <p className="text-[11px] text-muted">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 text-[#d79a2c]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="h-1.5 w-1.5 rounded-full border border-gold/50" />
              <span className="h-1.5 w-1.5 rounded-full border border-gold/50" />
            </div>
          </section>
        </Reveal> : null}

        {hasFaqs ? <Reveal>
          <section>
            <ProjectSectionTitle sectionKey="faq" fallbackTitle="Câu hỏi thường gặp" />
            <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {project.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="overflow-hidden rounded-[10px] border border-line/80 bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                    >
                      <span className="text-[12px] font-semibold leading-5 text-ink">{faq.question}</span>
                      <Plus
                        size={15}
                        className={`shrink-0 text-gold transition-transform ${isOpen ? "rotate-45" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease }}
                        >
                          <p className="border-t border-line/60 px-4 py-3 text-[12px] leading-6 text-muted">
                            {faq.answer}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal> : null}

        <Reveal>
          <ProjectGalleryAlbumSection project={project} />
        </Reveal>

        {project.virtualTourUrl ? (
          <VR360Section
            projectId={project.id || 1}
            projectSlug={project.slug}
            projectName={project.name}
            fallbackUrl={project.virtualTourUrl}
          />
        ) : null}

        <Reveal>
          <section
            id="project-consult-form"
            className="relative overflow-hidden rounded-[20px] border border-gold/30 bg-white shadow-soft"
          >
            <Image
              src={project.heroImage}
              alt={`Không gian nội thất cao cấp tại ${project.name}`}
              fill
              sizes="1500px"
              className="object-cover opacity-[.14]"
            />
            <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[.75fr_1.6fr] lg:items-center lg:p-10">
              <div>
                <p className="heading-font whitespace-pre-line text-[24px] font-semibold leading-tight normal-case sm:text-[28px]">
                  {project.sectionTitles?.contact?.title || "Đăng ký tư vấn\nNhận thông tin dự án"}
                </p>
                <p className="mt-3 max-w-sm text-[13px] leading-6 text-muted">
                  Để lại thông tin, chuyên viên tư vấn sẽ liên hệ và gửi chính sách bán hàng mới nhất.
                </p>
              </div>
              <form
                onSubmit={handleConsultSubmit}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <label className="text-[11px] font-semibold text-muted">
                  Họ và tên <span className="text-red-500">*</span>
                  <input
                    required
                    name="name"
                    value={consultForm.name}
                    onChange={(event) => setConsultForm((value) => ({ ...value, name: event.target.value }))}
                    placeholder="Nhập họ và tên"
                    className="mt-1.5 w-full rounded-[6px] border border-line bg-white/90 px-3 py-2.5 text-[12px] text-ink outline-none transition placeholder:text-muted/60 focus:border-gold"
                  />
                </label>
                <label className="text-[11px] font-semibold text-muted">
                  Số điện thoại <span className="text-red-500">*</span>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={consultForm.phone}
                    onChange={(event) => setConsultForm((value) => ({ ...value, phone: event.target.value }))}
                    placeholder="Nhập số điện thoại"
                    className="mt-1.5 w-full rounded-[6px] border border-line bg-white/90 px-3 py-2.5 text-[12px] text-ink outline-none transition placeholder:text-muted/60 focus:border-gold"
                  />
                </label>
                <label className="text-[11px] font-semibold text-muted">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={consultForm.email}
                    onChange={(event) => setConsultForm((value) => ({ ...value, email: event.target.value }))}
                    placeholder="Nhập email"
                    className="mt-1.5 w-full rounded-[6px] border border-line bg-white/90 px-3 py-2.5 text-[12px] text-ink outline-none transition placeholder:text-muted/60 focus:border-gold"
                  />
                </label>
                <label className="relative text-[11px] font-semibold text-muted">
                  Nhu cầu quan tâm
                  <select
                    name="interest"
                    value={consultForm.interest}
                    onChange={(event) => setConsultForm((value) => ({ ...value, interest: event.target.value }))}
                    className="mt-1.5 w-full appearance-none rounded-[6px] border border-line bg-white/90 px-3 py-2.5 pr-8 text-[12px] text-ink outline-none transition focus:border-gold"
                  >
                    {consultInterestOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute bottom-3 right-3 text-gold" />
                </label>
                <button
                  type="submit"
                  disabled={consultStatus === "loading"}
                  className="gold-gradient mt-auto h-[39px] rounded-[6px] px-6 text-[11px] font-bold text-white shadow-sm transition disabled:opacity-60 sm:col-span-2 lg:col-span-2 xl:col-span-1"
                >
                  {consultStatus === "loading" ? "ĐANG GỬI..." : "ĐĂNG KÝ NGAY"}
                </button>
                {consultStatus === "success" ? (
                  <p className="text-[11px] font-semibold text-emerald-700 sm:col-span-2 xl:col-span-4">
                    Cảm ơn Quý khách. Chuyên viên tư vấn sẽ liên hệ trong thời gian sớm nhất.
                  </p>
                ) : null}
                {consultStatus === "error" && consultError ? (
                  <p className="text-[11px] font-semibold text-red-600 sm:col-span-2 xl:col-span-4">
                    {consultError}
                  </p>
                ) : null}
              </form>
            </div>
          </section>
        </Reveal>
      </ProjectContainer>

      <AnimatePresence>
        {isVideoModalOpen && project.videoUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute right-5 top-5 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="Đóng video"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-5xl overflow-hidden rounded-[18px] border border-white/10 bg-black shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <ProjectVideoFrame
                url={project.videoUrl}
                embedUrl={projectVideoEmbedUrl}
                title={`Video giới thiệu ${project.name}`}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Floor plan lightbox */}
      <AnimatePresence>
        {floorPlanImageModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setFloorPlanImageModal(null)}
          >
            <div className="absolute left-5 top-5 z-[10000] rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80">
              {floorPlanImageModal.index + 1} / {floorPlanImageModal.images.length}
            </div>
            <button
              type="button"
              onClick={() => setFloorPlanImageModal(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            >
              <X size={20} />
            </button>
            {floorPlanImageModal.images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFloorPlanImageModal((current) => current
                      ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length }
                      : current);
                  }}
                  className="absolute left-4 top-1/2 z-[10000] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                  aria-label="Xem ảnh trước"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFloorPlanImageModal((current) => current
                      ? { ...current, index: (current.index + 1) % current.images.length }
                      : current);
                  }}
                  className="absolute right-4 top-1/2 z-[10000] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                  aria-label="Xem ảnh tiếp theo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            ) : null}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative h-[82vh] w-full max-w-5xl overflow-hidden rounded-[16px] border border-white/10 bg-zinc-950"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={floorPlanImageModal.images[floorPlanImageModal.index]}
                alt={floorPlanImageModal.title}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md select-none"
            onClick={() => setActiveImageIndex(null)}
          >
            {/* Top controls */}
            <div className="absolute top-4 left-0 right-0 z-[10000] flex justify-between items-center px-6">
              <span className="text-[12px] font-bold text-white/60 tracking-wider">
                {activeImageIndex + 1} / {project.gallery.images.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveImageIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/25 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative flex items-center justify-center w-full max-w-5xl aspect-video max-h-[80vh] px-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous button */}
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => 
                  prev !== null ? (prev - 1 + project.gallery.images.length) % project.gallery.images.length : null
                )}
                className="absolute left-0 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next button */}
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => 
                  prev !== null ? (prev + 1) % project.gallery.images.length : null
                )}
                className="absolute right-0 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
              >
                <ChevronRight size={24} />
              </button>

              {/* Active Image */}
              <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-zinc-900 border border-white/5">
                <Image
                  src={project.gallery.images[activeImageIndex]}
                  alt={`${project.gallery.title} ${activeImageIndex + 1}`}
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
