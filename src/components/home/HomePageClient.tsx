"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, ChevronDown, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
import {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerContainerSlow,
} from "@/lib/motion";
import type { Post, Project } from "@/types/api";

type HomepageHero = {
  title_lines?: string[];
  highlight?: string;
  description?: string;
  image?: string;
  image_url?: string;
};

const fallbackHero: Required<Pick<HomepageHero, "title_lines" | "highlight" | "description" | "image">> = {
  title_lines: ["Masterise Homes"],
  highlight: "Kiến tạo chuẩn sống hàng hiệu",
  description: "Bộ sưu tập bất động sản cao cấp dành cho cộng đồng tinh hoa.",
  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1800&auto=format&fit=crop",
};

const salesStatusLabel: Record<string, string> = {
  coming_soon: "Sắp mở bán",
  selling: "Đang mở bán",
  sold_out: "Đã bán hết",
  handover: "Đã bàn giao",
};

const heroStats = [
  { label: "BĐS cao cấp" },
  { label: "Vị trí chiến lược" },
  { label: "Tiện ích chuẩn quốc tế" },
  { label: "Giá trị đầu tư bền vững" },
];

const aboutBullets = [
  "Định vị bất động sản cao cấp và hạng sang",
  "Hợp tác cùng các đối tác quốc tế",
  "Tập trung vào trải nghiệm sống tinh tế",
  "Không gian sống hiện đại, tiện ích đồng bộ",
  "Gia tăng giá trị khai thác và đầu tư dài hạn",
];

export default function HomePageClient() {
  const [hero, setHero] = useState<HomepageHero>(fallbackHero);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    homepageService
      .getHeroBanners()
      .then((response) => {
        const banners = unwrapData<HomepageHero[]>(response) || [];
        if (banners.length > 0) setHero(banners[0]);
      })
      .catch(() => setHero(fallbackHero));

    projectService
      .getProjects({ per_page: "6", sort_by: "open_sale_at", sort_order: "asc" })
      .then(setProjects)
      .catch(() => setProjects([]));

    postService
      .getPosts({ per_page: 6, post_type: "news" })
      .then((response) => setPosts(unwrapData<Post[]>(response) || []))
      .catch(() => setPosts([]));
  }, []);

  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        {/* ─── HERO SECTION ─── */}
        <section className="relative min-h-[760px] lg:min-h-[860px] overflow-hidden bg-ink text-white">
          <Image
            src={hero.image || hero.image_url || fallbackHero.image}
            alt="Masterise Homes"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="hero-overlay" />
          <div className="hero-glow" />

          <Container className="relative flex min-h-[760px] lg:min-h-[860px] items-center">
            <motion.div
              className="max-w-3xl pt-24 pb-28 text-left"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p variants={fadeUp} className="text-eyebrow text-champagne">
                Masterise Homes
              </motion.p>

              <motion.h1 variants={fadeUp} className="text-hero mt-5">
                {Array.isArray(hero.title_lines) ? hero.title_lines.join(" ") : "Masterise Homes"}
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-4 text-2xl font-bold text-champagne sm:text-3xl">
                {hero.highlight || fallbackHero.highlight}
              </motion.p>

              <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
                {hero.description || fallbackHero.description}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/du-an"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-champagne px-6 text-sm font-bold text-ink-deep transition hover:brightness-110"
                >
                  Khám phá dự án <ArrowRight size={16} />
                </Link>
                <Link
                  href="#global-contact-form"
                  className="inline-flex h-12 items-center rounded-lg border border-champagne/60 px-6 text-sm font-bold text-white transition hover:border-champagne hover:text-champagne"
                >
                  Đăng ký tư vấn
                </Link>
              </motion.div>

              {/* Mini stats strip */}
              <motion.div
                variants={fadeUp}
                className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6"
              >
                {heroStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 text-sm text-white/70">
                    <Sparkles size={14} className="text-champagne" />
                    <span>{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Container>

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <ChevronDown size={22} />
          </div>
        </section>

        {/* ─── PROJECTS SECTION ─── */}
        <motion.section
          className="bg-ivory py-16 sm:py-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Container>
            <motion.div variants={fadeUp} className="mb-10 flex flex-col gap-3 text-left sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-eyebrow text-champagne">Dự án nổi bật</p>
                <h2 className="text-section-title mt-2">Khám phá bộ sưu tập dự án</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                  Những dự án bất động sản cao cấp tại các vị trí chiến lược, mang đến không gian sống và giá trị đầu tư vượt trội.
                </p>
              </div>
              <Link href="/du-an" className="inline-flex items-center gap-2 text-sm font-bold text-champagne hover:underline">
                Xem tất cả dự án <ArrowRight size={16} />
              </Link>
            </motion.div>

            {projects.length === 0 ? (
              <motion.div variants={fadeUp} className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
                Dữ liệu dự án đang được cập nhật.
              </motion.div>
            ) : (
              <motion.div variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <motion.div key={project.id} variants={fadeUp}>
                    <Link
                      href={`/du-an/${project.slug}`}
                      className="project-card group block overflow-hidden text-left transition hover:-translate-y-1"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={project.thumbnail || fallbackHero.image}
                          alt={project.name}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {project.is_hot && (
                            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                              Hot
                            </span>
                          )}
                          <span className="rounded-full bg-champagne/90 px-2.5 py-1 text-[10px] font-bold uppercase text-ink-deep">
                            {salesStatusLabel[project.sales_status] || "Đang cập nhật"}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-card-title group-hover:text-champagne transition-colors">
                          {project.name}
                        </h3>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                          <MapPin size={13} />
                          {project.location || project.address || "Đang cập nhật"}
                        </p>
                        <p className="mt-2 text-sm font-bold text-champagne">
                          {project.price_text || "Liên hệ"}
                        </p>
                        {project.open_sale_at && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                            <CalendarDays size={13} />
                            Mở bán: {new Date(project.open_sale_at).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Container>
        </motion.section>

        {/* ─── ABOUT SECTION ─── */}
        <motion.section
          className="relative bg-cream py-16 sm:py-20 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Subtle champagne glow background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(212,175,118,0.08) 0%, transparent 70%)",
            }}
          />

          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <motion.div variants={slideInLeft} className="text-left">
                <p className="text-eyebrow text-champagne">Về Masterise Homes</p>
                <h2 className="text-section-title mt-3">Nhà phát triển bất động sản hàng hiệu</h2>
                <p className="mt-5 text-sm leading-7 text-muted sm:text-base sm:leading-8">
                  Masterise Homes theo đuổi triết lý phát triển bất động sản cao cấp với trọng tâm là thiết kế,
                  chất lượng sống, tiện ích đồng bộ và giá trị sở hữu bền vững cho cộng đồng cư dân tinh hoa.
                </p>
                <div className="mt-7 grid gap-3.5">
                  {aboutBullets.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-semibold text-ink">
                      <BadgeCheck className="shrink-0 text-champagne" size={18} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={slideInRight} className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop"
                  alt="Masterise Homes"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </Container>
        </motion.section>

        {/* ─── PARTNERS + TESTIMONIALS SECTION ─── */}
        <motion.section
          className="bg-ivory py-16 sm:py-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Container>
            <motion.div variants={fadeUp} className="mb-10 text-left">
              <p className="text-eyebrow text-champagne">Hệ sinh thái uy tín</p>
              <h2 className="text-section-title mt-2">Đối tác chiến lược &amp; Cộng đồng khách hàng</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid gap-8 lg:grid-cols-2">
              <Partners />
              <Testimonials />
            </motion.div>
          </Container>
        </motion.section>

        {/* ─── NEWS + FAQ SECTION ─── */}
        <motion.section
          className="bg-cream py-16 sm:py-20"
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              {/* News */}
              <motion.div variants={fadeUp} className="text-left">
                <p className="text-eyebrow text-champagne">Tin tức &amp; Sự kiện</p>
                <h2 className="text-section-title mt-2 mb-6">Cập nhật mới nhất</h2>

                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-line bg-white p-10 text-sm text-muted">
                    Tin tức đang được cập nhật.
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {posts.slice(0, 4).map((post) => (
                      <Link
                        key={post.id}
                        href={`/tin-tuc/${post.slug}`}
                        className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:border-champagne hover:shadow-lg"
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
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <span className="inline-block rounded-full bg-champagne/15 px-2.5 py-0.5 text-[11px] font-bold uppercase text-champagne">
                            {post.category?.name || "Tin tức"}
                          </span>
                          <h3 className="text-card-title mt-2 line-clamp-2">{post.title}</h3>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{post.summary}</p>
                          {post.published_at && (
                            <p className="mt-3 text-[11px] text-muted/70">
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

        {/* ─── CONTACT FORM ─── */}
        <GlobalContactForm />
      </main>
      <Footer />
    </>
  );
}
