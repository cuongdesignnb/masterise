"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MapPin,
  Sparkles,
  Building2,
  Globe,
  Shield,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import Partners from "@/components/Partners";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import { homepageService } from "@/services/homepageService";
import { projectService } from "@/services/projectService";
import { postService } from "@/services/postService";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import { getSalesStatusLabel, getSalesStatusColor } from "@/lib/salesStatus";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import {
  fadeUp,
  fadeIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerContainerSlow,
} from "@/lib/motion";
import type { Post, Project } from "@/types/api";

type HomepageHero = {
  id?: string | number;
  title_lines?: string[];
  title?: string;
  subtitle?: string;
  highlight?: string;
  description?: string;
  image?: string;
  image_url?: string;
  link?: string;
  sort_order?: number;
  is_active?: boolean;
};

const fallbackHero: Required<
  Pick<HomepageHero, "id" | "title_lines" | "highlight" | "description" | "image" | "link">
> = {
  id: "fallback",
  title_lines: ["Masterise Homes"],
  highlight: "Kiến tạo chuẩn sống hàng hiệu",
  description:
    "Bộ sưu tập bất động sản cao cấp dành cho cộng đồng tinh hoa, nơi thiết kế, vị trí và trải nghiệm sống được nâng tầm theo chuẩn quốc tế.",
  image:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1800&auto=format&fit=crop",
  link: "/du-an",
};

// Sales status labels are now centralized in @/lib/salesStatus

const heroStats = [
  { icon: Building2, label: "BĐS cao cấp" },
  { icon: MapPin, label: "Vị trí chiến lược" },
  { icon: Globe, label: "Tiện ích chuẩn quốc tế" },
  { icon: TrendingUp, label: "Giá trị đầu tư bền vững" },
];

const aboutBullets = [
  "Định vị bất động sản cao cấp và hạng sang",
  "Hợp tác cùng các đối tác quốc tế hàng đầu",
  "Tập trung vào trải nghiệm sống tinh tế",
  "Không gian sống hiện đại, tiện ích đồng bộ",
  "Gia tăng giá trị khai thác và đầu tư dài hạn",
];

export default function HomePageClient() {
  const { homepageSlides, isLoaded } = useSiteSettings();
  const [heroSlides, setHeroSlides] = useState<HomepageHero[]>([fallbackHero]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroAutoplay, setHeroAutoplay] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    projectService
      .getFeaturedProjects({ limit: "6" })
      .then(setProjects)
      .catch(() => setProjects([]));

    postService
      .getPosts({ per_page: 6, post_type: "news" })
      .then((response) => setPosts(unwrapData<Post[]>(response) || []))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    if (!homepageSlides.length) return;
    setHeroSlides(
      homepageSlides.map((slide, index) => ({
        id: `setting-${index}`,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        link: slide.link || "/du-an",
      }))
    );
    setCurrentHeroIndex(0);
  }, [homepageSlides]);

  useEffect(() => {
    if (!isLoaded || homepageSlides.length > 0) return;

    homepageService
      .getHeroBanners()
      .then((response) => {
        const banners = unwrapData<HomepageHero[]>(response) || [];
        const activeBanners = banners
          .filter((banner) => banner.is_active !== false)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .filter((banner) => banner.image || banner.image_url);

        if (activeBanners.length > 0) {
          setHeroSlides(activeBanners);
          setCurrentHeroIndex(0);
        }
      })
      .catch(() => setHeroSlides([fallbackHero]));
  }, [homepageSlides.length, isLoaded]);

  useEffect(() => {
    if (!heroAutoplay || heroSlides.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentHeroIndex((index) => (index + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [heroAutoplay, heroSlides.length]);

  const currentHero = heroSlides[currentHeroIndex] || fallbackHero;
  const currentHeroTitle = useMemo(() => {
    if (Array.isArray(currentHero.title_lines) && currentHero.title_lines.length) {
      return currentHero.title_lines.join(" ");
    }
    return currentHero.title || "Masterise Homes";
  }, [currentHero]);
  const currentHeroSubtitle = currentHero.subtitle || currentHero.highlight || fallbackHero.highlight;
  const currentHeroDescription = currentHero.description || fallbackHero.description;
  const currentHeroImage = currentHero.image || currentHero.image_url || fallbackHero.image;
  const currentHeroLink = currentHero.link || "/du-an";

  const goToHeroSlide = (index: number) => {
    if (heroSlides.length <= 1) return;
    setHeroAutoplay(false);
    setCurrentHeroIndex((index + heroSlides.length) % heroSlides.length);
  };

  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">

        {/* ═══════════════════════════════════════════
            HERO SECTION — Full-screen immersive
        ═══════════════════════════════════════════ */}
        <section className="relative min-h-[680px] sm:min-h-[760px] lg:min-h-[860px] overflow-hidden bg-ink-deep text-white">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={`${currentHero.id || currentHeroIndex}-${currentHeroImage}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={currentHeroImage}
                alt={currentHeroTitle}
                fill
                priority={currentHeroIndex === 0}
                className="object-cover scale-[1.02]"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
          <div className="hero-overlay" />
          <div className="hero-glow" />

          <Container className="relative z-10 flex min-h-[680px] sm:min-h-[760px] lg:min-h-[860px] items-center">
            <motion.div
              className="max-w-3xl pt-24 pb-32 text-left"
              variants={staggerContainer}
              initial={false}
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Eyebrow + accent line */}
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="accent-line" />
                <p className="text-eyebrow text-champagne">Masterise Homes</p>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeUp} className="text-hero mt-6 text-white">
                {currentHeroTitle}
              </motion.h1>

              {/* Highlight */}
              <motion.p
                variants={fadeUp}
                className="mt-4 text-xl font-bold text-champagne sm:text-2xl lg:text-3xl"
              >
                {currentHeroSubtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-2xl text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8"
              >
                {currentHeroDescription}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
                <Link href={currentHeroLink} className="btn-primary">
                  Khám phá dự án <ArrowRight size={16} />
                </Link>
                <Link href="#global-contact-form" className="btn-outline">
                  Đăng ký tư vấn
                </Link>
              </motion.div>

              {/* Mini stats strip */}
              <motion.div
                variants={fadeUp}
                className="mt-14 flex flex-wrap gap-3"
              >
                {heroStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="stat-item">
                      <Icon size={15} className="text-champagne shrink-0" />
                      <span className="text-[13px] font-medium text-white/80">{stat.label}</span>
                    </div>
                  );
                })}
              </motion.div>

              {heroSlides.length > 1 && (
                <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToHeroSlide(currentHeroIndex - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-ink"
                    aria-label="Banner trước"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 backdrop-blur">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.id || index}
                        type="button"
                        onClick={() => goToHeroSlide(index)}
                        className={`h-2 rounded-full transition-all duration-500 ${index === currentHeroIndex ? "w-8 bg-champagne" : "w-2 bg-white/55 hover:bg-white"}`}
                        aria-label={`Chọn banner ${index + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToHeroSlide(currentHeroIndex + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-ink"
                    aria-label="Banner tiếp theo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </Container>

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <ChevronDown size={24} strokeWidth={1.5} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PROJECTS SECTION
        ═══════════════════════════════════════════ */}
        <motion.section
          className="section-depth bg-ivory py-16 sm:py-24"
          variants={staggerContainer}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Container>
            {/* Section header */}
            <motion.div
              variants={fadeUp}
              className="mb-12 flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="accent-line" />
                  <p className="text-eyebrow">Dự án nổi bật</p>
                </div>
                <h2 className="text-section-title mt-3">
                  Khám phá bộ sưu tập dự án
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
                  Những dự án bất động sản cao cấp tại các vị trí chiến lược,
                  mang đến không gian sống và giá trị đầu tư vượt trội.
                </p>
              </div>
              <Link
                href="/du-an"
                className="inline-flex items-center gap-2 text-sm font-bold text-champagne transition hover:gap-3"
              >
                Xem tất cả dự án <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Project cards */}
            {projects.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted"
              >
                Dữ liệu dự án đang được cập nhật.
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {projects.map((project) => (
                  <motion.div key={project.id} variants={fadeUp}>
                    <Link
                      href={`/du-an/${project.slug}`}
                      className="project-card group block text-left"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={project.thumbnail || fallbackHero.image}
                          alt={project.name}
                          fill
                          className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

                        {/* Badges */}
                        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-2">
                          {project.is_hot && (
                            <span className="badge-soft-hot rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                              Hot
                            </span>
                          )}
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getSalesStatusColor(project.sales_status).bg} ${getSalesStatusColor(project.sales_status).text}`}>
                            {getSalesStatusLabel(project.sales_status)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-card-title text-ink transition-colors duration-300 group-hover:text-champagne">
                          {project.name}
                        </h3>
                        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted">
                          <MapPin size={13} className="shrink-0" />
                          {project.location || project.address || "Đang cập nhật"}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm font-bold text-champagne">
                            {project.price_text || "Liên hệ"}
                          </p>
                          {project.open_sale_at && (
                            <p className="flex items-center gap-1 text-[11px] text-muted">
                              <CalendarDays size={12} />
                              {new Date(project.open_sale_at).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Container>
        </motion.section>

        {/* ═══════════════════════════════════════════
            ABOUT SECTION — Brand introduction
        ═══════════════════════════════════════════ */}
        <motion.section
          className="relative bg-cream py-16 sm:py-24 overflow-hidden"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 75% 50%, rgba(200,169,106,0.06) 0%, transparent 70%)",
            }}
          />

          <Container>
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Text content */}
              <motion.div variants={slideInLeft} className="text-left">
                <div className="flex items-center gap-3">
                  <div className="accent-line" />
                  <p className="text-eyebrow">Về Masterise Homes</p>
                </div>
                <h2 className="text-section-title mt-4">
                  Nhà phát triển bất động sản hàng hiệu
                </h2>
                <p className="mt-5 text-[15px] leading-7 text-muted sm:text-base sm:leading-8">
                  Masterise Homes theo đuổi triết lý phát triển bất động sản cao
                  cấp với trọng tâm là thiết kế, chất lượng sống, tiện ích đồng
                  bộ và giá trị sở hữu bền vững cho cộng đồng cư dân tinh hoa.
                </p>

                {/* Bullet points */}
                <div className="mt-8 grid gap-4">
                  {aboutBullets.map((item, i) => (
                    <motion.div
                      key={item}
                      variants={fadeUp}
                      custom={i}
                      className="flex items-center gap-3.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15">
                        <BadgeCheck className="text-champagne" size={15} />
                      </div>
                      <span className="text-sm font-semibold text-ink">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/gioi-thieu"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-champagne transition hover:gap-3"
                >
                  Tìm hiểu thêm <ArrowRight size={16} />
                </Link>
              </motion.div>

              {/* Image with decorative frame */}
              <motion.div variants={slideInRight} className="relative">
                {/* Decorative accent behind image */}
                <div className="absolute -right-4 -top-4 h-full w-full rounded-3xl border border-champagne/20 hidden lg:block" />
                <div className="image-frame relative z-10 aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop"
                    alt="Masterise Homes"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>
            </div>
          </Container>
        </motion.section>

        {/* ═══════════════════════════════════════════
            PARTNERS + TESTIMONIALS
        ═══════════════════════════════════════════ */}
        <motion.section
          className="section-depth bg-ivory py-16 sm:py-24"
          variants={staggerContainer}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Container>
            <motion.div variants={fadeUp} className="mb-10 text-left">
              <div className="flex items-center gap-3">
                <div className="accent-line" />
                <p className="text-eyebrow">Hệ sinh thái uy tín</p>
              </div>
              <h2 className="text-section-title mt-3">
                Đối tác chiến lược &amp; Cộng đồng khách hàng
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid gap-8 lg:grid-cols-2">
              <Partners />
              <Testimonials />
            </motion.div>
          </Container>
        </motion.section>

        {/* ═══════════════════════════════════════════
            NEWS + FAQ
        ═══════════════════════════════════════════ */}
        <motion.section
          className="section-depth bg-cream py-16 sm:py-24"
          variants={staggerContainerSlow}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              {/* News */}
              <motion.div variants={fadeUp} className="text-left">
                <div className="flex items-center gap-3">
                  <div className="accent-line" />
                  <p className="text-eyebrow">Tin tức &amp; Sự kiện</p>
                </div>
                <h2 className="text-section-title mt-3 mb-8">
                  Cập nhật mới nhất
                </h2>

                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted">
                    Tin tức đang được cập nhật.
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {posts.slice(0, 4).map((post) => (
                      <Link
                        key={post.id}
                        href={`/tin-tuc/${post.slug}`}
                        className="news-card group block"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={
                              post.thumbnail ||
                              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
                            }
                            alt={post.title}
                            fill
                            className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="p-4">
                          <span className="inline-block rounded-full bg-champagne/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-champagne">
                            {post.category?.name || "Tin tức"}
                          </span>
                          <h3 className="text-card-title mt-2 line-clamp-2 transition-colors duration-300 group-hover:text-champagne">
                            {post.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted">
                            {post.summary}
                          </p>
                          {post.published_at && (
                            <p className="mt-3 text-[11px] text-muted/60">
                              {new Date(post.published_at).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* FAQ */}
              <motion.div variants={fadeUp}>
                <FAQ />
              </motion.div>
            </div>
          </Container>
        </motion.section>

        {/* ═══════════════════════════════════════════
            CONTACT FORM
        ═══════════════════════════════════════════ */}
        <GlobalContactForm />
      </main>
      <Footer />
    </>
  );
}
