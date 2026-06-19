"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ChevronRight, ArrowRight, Download } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import Button from "@/components/Button";

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

export default function ProjectsHero() {
  const { projectsPageHero: hero } = useSiteSettings();

  return (
    <section className="relative w-full overflow-hidden bg-cream pt-[72px] pb-8">
      <Container>
        <div className="lg:grid lg:grid-cols-12 gap-8 items-center">
          {/* Left column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Breadcrumb */}
              <motion.nav
                variants={fadeUp}
                className="flex items-center gap-1.5 text-xs text-muted"
              >
                {hero.breadcrumb.map((label, idx) => (
                  <React.Fragment key={label}>
                    {idx > 0 && (
                      <ChevronRight size={12} className="text-gold" />
                    )}
                    <Link
                      href={idx === 0 ? "/" : "/du-an"}
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
                className="inline-block mt-4 text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-white uppercase gold-gradient px-4 py-1.5 rounded-full"
              >
                {hero.badge}
              </motion.span>

              {/* H1 */}
              <motion.h1
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl lg:text-[46px] heading-font font-bold text-ink leading-tight tracking-tight whitespace-pre-line"
              >
                {hero.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mt-3 text-sm text-muted max-w-xl leading-relaxed"
              >
                {hero.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                className="mt-5 flex flex-wrap gap-3"
              >
                <Button
                  href="/du-an"
                  variant="solid"
                  size="md"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                >
                  {hero.primaryCta}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={<Download size={14} />}
                  iconPosition="left"
                >
                  {hero.secondaryCta}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="relative rounded-[22px] overflow-hidden shadow-soft"
            >
              {/* Hero Image */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={hero.image}
                  alt="Tổng quan dự án Masterise Homes"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                />
              </div>

              {/* Overlay stats card */}
              <div className="absolute bottom-4 right-4 left-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-[16px] p-5 shadow-soft">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-3 text-center">
                    TỔNG QUAN DỰ ÁN
                  </p>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                    {hero.overview.map((stat, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center text-center ${
                          idx < 2 ? "pb-3 border-b border-line/50" : "pt-1"
                        } ${
                          idx % 2 === 0
                            ? "border-r border-line/50 pr-3"
                            : "pl-3"
                        }`}
                      >
                        <span className="heading-font text-xl font-bold text-gold leading-none">
                          {stat.value}
                        </span>
                        <span className="text-[10px] text-muted mt-1 uppercase tracking-wide leading-snug">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
