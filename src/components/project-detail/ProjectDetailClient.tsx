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
import { useState, useEffect } from "react";
import type { ProjectIconName, ProjectDetail } from "@/types/project-detail";
import VR360Section from "@/components/vr360/VR360Section";

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
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="heading-font text-[24px] font-semibold uppercase leading-tight tracking-[0.02em] text-ink sm:text-[30px]">
        {children}
      </h2>
    </div>
  );
}

function LocationMap({ projectName, mapImageUrl }: { projectName: string; mapImageUrl?: string | null }) {
  if (mapImageUrl) {
    return (
      <div className="relative h-[330px] overflow-hidden rounded-[18px] border border-gold/35 bg-[#faf7f0] lg:h-[410px] flex items-center justify-center">
        <img
          src={mapImageUrl}
          alt={`Bản đồ dự án ${projectName}`}
          className={`h-full w-full ${mapImageUrl.toLowerCase().includes('.svg') ? 'object-contain' : 'object-cover'}`}
        />
        <div className="absolute bottom-3 right-3 rounded-full border border-line bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-muted shadow-sm backdrop-blur">
          Bản đồ dự án
        </div>
      </div>
    );
  }

  return null;
}

function FloorPlanSketch() {
  return (
    <svg viewBox="0 0 180 120" className="h-full w-full text-[#9e968b]" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="8" y="8" width="70" height="104" />
        <rect x="90" y="8" width="82" height="104" />
        <path d="M8 42H78M8 78H78M38 8V112M90 38H172M90 76H172M122 8V112" />
        <path d="M21 23h18v12H21zM49 51h18v18H49zM19 88h25v14H19zM102 17h12v12h-12zM134 18h26v14h-26zM101 49h28v18h-28zM140 85h20v16h-20z" />
        <path d="M78 55h12M84 49v12M122 92h18" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

export default function ProjectDetailClient({ project }: { project: ProjectDetail }) {
  const floorTabs = project.floorTabs.length ? project.floorTabs : (project.floorPlans.length ? ["Sản phẩm"] : []);
  const [activeTab, setActiveTab] = useState(floorTabs[0] ?? "");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeImageIndex]);

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
  const hasFacts = project.facts.length > 0;
  const hasStats = project.stats.length > 0;
  const hasGallery = project.gallery.images.length > 0;
  const hasGalleryCopy = Boolean(project.gallery.label || project.gallery.title || project.gallery.description);
  const hasConnectivity = project.connectivity.length > 0 || Boolean(project.mapImageUrl);
  const hasAmenities = project.amenities.length > 0;
  const hasFloorPlans = project.floorPlans.length > 0;
  const hasPriceRows = project.priceRows.length > 0;
  const hasPolicies = project.policies.length > 0;
  const hasTimeline = project.timeline.length > 0;
  const hasInvestmentReasons = project.investmentReasons.length > 0;
  const hasTestimonials = project.testimonials.length > 0;
  const hasFaqs = project.faqs.length > 0;
  const visibleFloorPlans = project.floorTabs.length && activeTab
    ? project.floorPlans.filter((plan) => !plan.productType || plan.productType === activeTab)
    : project.floorPlans;

  return (
    <main className="overflow-hidden bg-ivory pb-0 pt-[76px] text-ink">
      <ProjectContainer className="space-y-5 pb-10 pt-4 sm:space-y-7 lg:pt-6">
        <motion.section
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease }}
          className="relative min-h-[610px] overflow-hidden rounded-[24px] border border-white/70 bg-beige shadow-luxury lg:min-h-[600px]"
        >
          <Image
            src={project.heroImage}
            alt={`Toàn cảnh dự án ${project.name}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1500px"
            className="object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,248,.97)_0%,rgba(255,253,248,.86)_31%,rgba(255,253,248,.28)_55%,rgba(15,20,22,.04)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(255,253,248,.95)_0%,rgba(255,253,248,.68)_48%,rgba(24,27,27,.08)_100%)]" />

          <div className="relative z-10 flex min-h-[610px] items-center px-6 py-10 sm:px-10 lg:min-h-[600px] lg:px-14 xl:px-16">
            <div className="max-w-[760px]">
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
                className="heading-font mt-5 text-[44px] font-medium leading-[.98] tracking-[0.015em] text-ink sm:text-[58px] lg:whitespace-nowrap xl:text-[66px]"
              >
                {project.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease }}
                className="mt-4 text-base font-semibold text-ink sm:text-xl"
              >
                {project.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44, ease }}
                className="mt-7 flex flex-wrap gap-3"
              >
                <Link
                  href="#dang-ky-tu-van"
                  className="gold-gradient rounded-[6px] px-6 py-3.5 text-[11px] font-bold tracking-[0.05em] text-white shadow-[0_12px_28px_rgba(143,99,47,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(143,99,47,.34)]"
                >
                  ĐĂNG KÝ NHẬN THÔNG TIN
                </Link>
                {project.videoUrl ? <Link
                  href={project.videoUrl}
                  className="flex items-center gap-2 rounded-[6px] border border-gold/50 bg-white/85 px-5 py-3 text-[11px] font-bold text-gold-dark shadow-sm backdrop-blur transition hover:border-gold hover:bg-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/45">
                    <Play size={10} fill="currentColor" />
                  </span>
                  XEM VIDEO DỰ ÁN
                </Link> : null}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {hasFacts ? <Reveal className="-mt-1 rounded-[18px] border border-line/80 bg-white/90 px-4 py-4 shadow-soft">
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
                  <p className="text-[9px] text-muted">{fact.label}</p>
                  <p className="mt-0.5 text-[10px] font-bold leading-4 text-ink">{fact.value}</p>
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
                <p className="mt-2 text-[11px] font-medium text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal> : null}

        {/* TỔNG QUAN DỰ ÁN */}
        {project.content ? (
          <Reveal className="rounded-[22px] border border-line/80 bg-white p-5 shadow-soft sm:p-7">
            <section id="tong-quan">
              <SectionTitle eyebrow="TỔNG QUAN DỰ ÁN">GIỚI THIỆU CHI TIẾT</SectionTitle>
              <div
                className="prose prose-stone max-w-none mt-5 text-left text-sm leading-7 text-ink prose-headings:font-heading prose-headings:font-semibold prose-headings:text-[#1F1B16] prose-a:text-[#B88746] hover:prose-a:underline prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
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
                  <p className="mt-4 text-[13px] leading-6 text-muted">{project.gallery.description}</p>
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

        {hasConnectivity ? <Reveal className="rounded-[22px] border border-line/80 bg-white p-5 shadow-soft sm:p-7">
          <section className={`grid items-center gap-8 ${project.mapImageUrl ? "lg:grid-cols-[310px_minmax(0,1fr)]" : ""}`}>
            <div>
              <SectionTitle eyebrow="VỊ TRÍ CHIẾN LƯỢC">KẾT NỐI TOÀN DIỆN</SectionTitle>
              {project.locationDescription ? (
                <p className="mb-6 text-[13px] leading-6 text-muted">{project.locationDescription}</p>
              ) : null}
              <div className="space-y-4">
                {project.connectivity.map((item) => (
                  <div key={item.time} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige text-gold">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-ink">{item.time}</p>
                      <p className="text-[10px] text-muted">{item.label}</p>
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
            <SectionTitle>TIỆN ÍCH NỔI BẬT</SectionTitle>
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
                      <h3 className="text-[10px] font-bold leading-4 text-ink">{amenity.title}</h3>
                      <p className="text-[9px] leading-4 text-muted">{amenity.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal> : null}

        {hasFloorPlans ? <Reveal>
          <section>
            <SectionTitle>MẶT BẰNG &amp; LOẠI HÌNH SẢN PHẨM</SectionTitle>
            <div className="mb-4 grid overflow-hidden rounded-[6px] border border-line bg-white sm:grid-cols-4">
              {floorTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b border-line px-4 py-2.5 text-[10px] font-bold uppercase transition last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                    activeTab === tab ? "gold-gradient text-white" : "text-muted hover:bg-beige/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {visibleFloorPlans.map((plan, index) => (
                <motion.article
                  key={plan.name}
                  layout
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-[16px] border border-line/80 bg-white shadow-[0_12px_35px_rgba(87,61,28,.07)]"
                >
                  <div className="grid h-[170px] grid-cols-[1.1fr_.9fr] gap-2 bg-[#fbfaf7] p-3">
                    <div className="relative overflow-hidden rounded-[10px]">
                      <Image
                        src={plan.image}
                        alt={`${plan.productType || activeTab || "Sản phẩm"} - ${plan.name}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="rounded-[10px] border border-line/60 bg-white p-2">
                      <FloorPlanSketch />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gold">
                      {plan.productType || activeTab || "Sản phẩm"} · Mẫu {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-ink">{plan.name}</h3>
                    <p className="mt-2 text-[10px] text-muted">
                      Diện tích: <strong className="text-ink">{plan.area}</strong>
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      Tổng diện tích sàn: <strong className="text-ink">{plan.totalArea}</strong>
                    </p>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-[5px] border border-gold/45 py-2 text-[9px] font-bold text-gold-dark transition hover:bg-gold hover:text-white"
                    >
                      XEM CHI TIẾT
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </Reveal> : null}

        {hasPriceRows || hasPolicies ? <Reveal>
          <section className="grid gap-5 lg:grid-cols-[1.85fr_1fr]">
            {hasPriceRows ? <div className="rounded-[18px] border border-line/80 bg-white p-5 shadow-soft">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.06em] text-gold-dark">
                BẢNG GIÁ DỰ KIẾN
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-[10px]">
                  <thead>
                    <tr className="bg-[#fbf7f0] text-muted">
                      <th className="border border-line/70 px-4 py-2.5 font-semibold">LOẠI HÌNH</th>
                      <th className="border border-line/70 px-4 py-2.5 text-center font-semibold">
                        DIỆN TÍCH (m²)
                      </th>
                      <th className="border border-line/70 px-4 py-2.5 text-center font-semibold">
                        GIÁ TỪ (TỶ/CĂN)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.priceRows.map((row) => (
                      <tr key={row[0]} className="transition hover:bg-beige/35">
                        <td className="border border-line/70 px-4 py-2.5 font-medium">{row[0]}</td>
                        <td className="border border-line/70 px-4 py-2.5 text-center">{row[1]}</td>
                        <td className="border border-line/70 px-4 py-2.5 text-center font-semibold text-gold-dark">
                          {row[2]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[9px] italic text-muted">
                * Giá dự kiến chưa bao gồm VAT và phí. Thông tin chỉ mang tính chất tham khảo.
              </p>
            </div> : null}
            {hasPolicies ? <div className="rounded-[18px] border border-gold/35 bg-[#fffaf2] p-5 shadow-soft">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.06em] text-gold-dark">
                CHÍNH SÁCH BÁN HÀNG
              </h2>
              <div className="space-y-4">
                {project.policies.map((policy) => (
                  <div key={policy.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gold shadow-sm">
                      <ProjectIcon name={policy.icon} size={18} />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-ink">{policy.title}</h3>
                      <p className="mt-0.5 text-[9px] leading-4 text-muted">{policy.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="#dang-ky-tu-van"
                className="gold-gradient mt-6 block rounded-[5px] py-3 text-center text-[10px] font-bold text-white shadow-sm"
              >
                NHẬN CHÍNH SÁCH CHI TIẾT
              </Link>
            </div> : null}
          </section>
        </Reveal> : null}

        {hasTimeline ? <Reveal>
          <section className="py-2">
            <SectionTitle>TIẾN ĐỘ THI CÔNG</SectionTitle>
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
                      <p className={`text-[11px] font-bold ${active ? "text-gold-dark" : "text-ink"}`}>{item.date}</p>
                      <p className="mt-1 text-[9px] leading-4 text-muted">{item.title}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </Reveal> : null}

        {hasInvestmentReasons ? <Reveal>
          <section>
            <SectionTitle>VÌ SAO NÊN ĐẦU TƯ {project.name}?</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {project.investmentReasons.map((reason) => (
                <motion.article
                  key={reason.title}
                  whileHover={{ y: -4 }}
                  className="rounded-[14px] border border-line/75 bg-white px-4 py-5 text-center shadow-[0_10px_26px_rgba(87,61,28,.05)]"
                >
                  <ProjectIcon name={reason.icon} size={27} className="mx-auto text-gold" />
                  <h3 className="mt-3 text-[10px] font-bold leading-4 text-ink">{reason.title}</h3>
                  <p className="mt-1 text-[9px] text-muted">{reason.description}</p>
                </motion.article>
              ))}
            </div>
          </section>
        </Reveal> : null}

        {hasTestimonials ? <Reveal>
          <section>
            <SectionTitle>KHÁCH HÀNG NÓI GÌ?</SectionTitle>
            <div className="grid gap-4 lg:grid-cols-3">
              {project.testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="rounded-[16px] border border-line/75 bg-white p-5 shadow-[0_10px_30px_rgba(87,61,28,.05)]"
                >
                  <div className="flex gap-3">
                    <Quote size={25} fill="currentColor" className="shrink-0 text-gold/35" />
                    <p className="text-[11px] leading-5 text-muted">{testimonial.content}</p>
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
                        <h3 className="truncate text-[11px] font-bold">{testimonial.name}</h3>
                        <p className="text-[9px] text-muted">{testimonial.role}</p>
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
            <SectionTitle>CÂU HỎI THƯỜNG GẶP</SectionTitle>
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
                      <span className="text-[10px] font-semibold leading-4 text-ink">{faq.question}</span>
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
                          <p className="border-t border-line/60 px-4 py-3 text-[10px] leading-5 text-muted">
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
            id="dang-ky-tu-van"
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
                <p className="heading-font text-[24px] font-semibold uppercase leading-tight sm:text-[28px]">
                  ĐĂNG KÝ TƯ VẤN
                  <br />
                  NHẬN THÔNG TIN DỰ ÁN
                </p>
                <p className="mt-3 max-w-sm text-[11px] leading-5 text-muted">
                  Để lại thông tin, chuyên viên tư vấn sẽ liên hệ và gửi chính sách bán hàng mới nhất.
                </p>
              </div>
              <form
                onSubmit={(event) => event.preventDefault()}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <label className="text-[9px] font-semibold text-muted">
                  Họ và tên <span className="text-red-500">*</span>
                  <input
                    required
                    name="name"
                    placeholder="Nhập họ và tên"
                    className="mt-1.5 w-full rounded-[6px] border border-line bg-white/90 px-3 py-2.5 text-[10px] text-ink outline-none transition placeholder:text-muted/60 focus:border-gold"
                  />
                </label>
                <label className="text-[9px] font-semibold text-muted">
                  Số điện thoại <span className="text-red-500">*</span>
                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    className="mt-1.5 w-full rounded-[6px] border border-line bg-white/90 px-3 py-2.5 text-[10px] text-ink outline-none transition placeholder:text-muted/60 focus:border-gold"
                  />
                </label>
                <label className="text-[9px] font-semibold text-muted">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email"
                    className="mt-1.5 w-full rounded-[6px] border border-line bg-white/90 px-3 py-2.5 text-[10px] text-ink outline-none transition placeholder:text-muted/60 focus:border-gold"
                  />
                </label>
                <label className="relative text-[9px] font-semibold text-muted">
                  Nhu cầu quan tâm
                  <select
                    name="interest"
                    defaultValue=""
                    className="mt-1.5 w-full appearance-none rounded-[6px] border border-line bg-white/90 px-3 py-2.5 pr-8 text-[10px] text-muted outline-none transition focus:border-gold"
                  >
                    <option value="" disabled>
                      Chọn loại sản phẩm
                    </option>
                    {floorTabs.map((tab) => (
                      <option key={tab}>{tab}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute bottom-3 right-3 text-gold" />
                </label>
                <button
                  type="submit"
                  className="gold-gradient mt-auto h-[37px] rounded-[6px] px-6 text-[9px] font-bold text-white shadow-sm sm:col-span-2 lg:col-span-2 xl:col-span-1"
                >
                  ĐĂNG KÝ NGAY
                </button>
              </form>
            </div>
          </section>
        </Reveal>
      </ProjectContainer>

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
