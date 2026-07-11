"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ChevronRight, Mail, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import Button from "@/components/Button";
import type { Post } from "@/types/api";

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

export default function NewsHero({ post, postLabel }: { post: Post | null; postLabel: string }) {
  const { newsPageHero: hero } = useSiteSettings();
  const postHref = post?.slug ? `/tin-tuc/${post.slug}` : "";

  return (
    <section className="relative w-full overflow-hidden bg-cream pt-[72px] min-h-[420px] lg:min-h-[460px]">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gold/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

      <Container className="relative z-10 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* ── Left column ── */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Breadcrumb */}
              <motion.nav
                variants={fadeUp}
                className="flex items-center gap-1.5 text-xs text-muted mb-4"
              >
                {hero.breadcrumb.map((label, idx) => (
                  <React.Fragment key={label}>
                    {idx > 0 && (
                      <ChevronRight size={12} className="text-gold" />
                    )}
                    <Link
                      href={idx === 0 ? "/" : "/tin-tuc"}
                      className={`hover:text-gold transition-colors ${
                        idx === hero.breadcrumb.length - 1
                          ? "text-gold font-semibold"
                          : ""
                      }`}
                    >
                      {label}
                    </Link>
                  </React.Fragment>
                ))}
              </motion.nav>

              {/* Badge */}
              <motion.span
                variants={fadeUp}
                className="inline-block gold-gradient text-white text-[10px] sm:text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-4"
              >
                {hero.badge}
              </motion.span>

              {/* H1 */}
              <motion.h1
                variants={fadeUp}
                className="text-3xl md:text-4xl lg:text-[46px] heading-font font-bold text-ink tracking-tight leading-tight"
              >
                {hero.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mt-4 text-sm text-muted max-w-xl leading-relaxed font-light"
              >
                {hero.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap gap-3 sm:gap-4 items-center"
              >
                <Button
                  href="#bai-viet-moi-nhat"
                  variant="solid"
                  size="md"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                >
                  {hero.primaryCta}
                </Button>
                <Button
                  href="/lien-he#global-contact-form"
                  variant="outline"
                  size="md"
                  icon={<Mail size={14} />}
                  iconPosition="left"
                >
                  {hero.secondaryCta}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-lg lg:max-w-none"
            >
              {/* Main hero image */}
              <Link
                href={postHref || "#bai-viet-moi-nhat"}
                aria-label={post ? `Đọc bài viết ${post.title}` : "Khám phá bài viết mới nhất"}
                className="relative block rounded-[22px] overflow-hidden shadow-soft aspect-[4/3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                <Image
                  src={post?.thumbnail || hero.image}
                  alt={post?.title || hero.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </Link>

              {/* Highlight overlay card */}
              {post && postHref && (
                <Link
                  href={postHref}
                  className="group absolute bottom-4 right-4 left-4 rounded-[16px] border border-line/30 bg-white/90 p-4 shadow-soft backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:left-auto sm:w-72"
                >
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                    {postLabel}
                  </span>
                  <h3 className="text-sm font-semibold text-ink mt-1 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mt-2 group-hover:text-gold-dark transition-colors">
                    Đọc ngay
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
