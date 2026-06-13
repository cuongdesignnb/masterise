"use client";

import { articleDetail } from "@/data/newsDetailSeed";
import Container from "@/components/Container";
import Image from "next/image";
import {
  ChevronRight,
  Clock,
  Calendar,
  Share2,
  Globe,
  MessageSquare,
  Link2,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.65,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

function handleCopyLink() {
  if (typeof window !== "undefined") {
    navigator.clipboard.writeText(window.location.href);
  }
}

export default function ArticleHero() {
  const d = articleDetail;

  return (
    <section className="bg-cream pt-[72px] pb-8">
      <Container>
        {/* Breadcrumb */}
        <motion.nav
          {...fadeUp(0)}
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-xs text-muted pt-6 pb-4"
        >
          {d.breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-gold shrink-0" />
              )}
              <span
                className={
                  i === d.breadcrumb.length - 1
                    ? "text-ink font-medium"
                    : "hover:text-gold transition-colors cursor-pointer"
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </motion.nav>

        {/* Badge */}
        <motion.div {...fadeUp(0.05)}>
          <span className="gold-gradient inline-block text-white text-[10px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full">
            {d.badge}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUp(0.1)}
          className="heading-font text-2xl md:text-3xl lg:text-4xl text-ink leading-tight font-bold mt-4 max-w-3xl"
        >
          {d.title}
        </motion.h1>

        {/* Excerpt */}
        <motion.p
          {...fadeUp(0.15)}
          className="text-sm text-muted max-w-2xl mt-3 leading-relaxed"
        >
          {d.excerpt}
        </motion.p>

        {/* Meta Row */}
        <motion.div
          {...fadeUp(0.2)}
          className="flex flex-wrap items-center gap-3 mt-5"
        >
          {/* Category chip */}
          <span className="bg-beige/60 rounded-full px-3 py-1 text-[11px] font-medium text-ink">
            {d.category}
          </span>

          {/* Divider */}
          <span className="hidden sm:block w-px h-4 bg-line" />

          {/* Author */}
          <span className="text-xs text-muted">{d.author.name}</span>

          {/* Divider */}
          <span className="hidden sm:block w-px h-4 bg-line" />

          {/* Read time */}
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3.5 h-3.5 text-gold" />
            {d.readTime}
          </span>

          {/* Date */}
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Calendar className="w-3.5 h-3.5 text-gold" />
            {d.date}
          </span>

          {/* Spacer pushes share buttons right on larger screens */}
          <span className="hidden lg:block flex-1" />

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted hidden sm:inline mr-1">
              Chia sẻ:
            </span>
            {[
              {
                Icon: Share2,
                label: "Facebook",
                action: () =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank"
                  ),
              },
              {
                Icon: Globe,
                label: "LinkedIn",
                action: () =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                    "_blank"
                  ),
              },
              {
                Icon: MessageSquare,
                label: "Twitter",
                action: () =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                    "_blank"
                  ),
              },
              {
                Icon: Link2,
                label: "Copy link",
                action: handleCopyLink,
              },
            ].map(({ Icon, label, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                aria-label={label}
                className="w-8 h-8 rounded-full border border-line/60 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          {...fadeUp(0.3)}
          className="relative w-full aspect-[21/9] rounded-[18px] overflow-hidden shadow-soft mt-6"
        >
          <Image
            src={d.heroImage}
            alt={`Hình ảnh bài viết: ${d.title}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          />
        </motion.div>
      </Container>
    </section>
  );
}
