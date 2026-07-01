"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ChevronRight, Phone, ChevronDown } from "lucide-react";
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

export default function AboutHero() {
  const { aboutPageHero } = useSiteSettings();

  return (
    <section className="relative h-[500px] sm:h-[520px] lg:h-[540px] w-full overflow-hidden bg-cream pt-[72px]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${aboutPageHero.image})` }}
      >
        {/* Cream overlay left-to-right */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent lg:from-cream lg:via-cream/60 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-black/5" />
      </div>

      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative z-10 h-full flex flex-col justify-center pb-10 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center h-full pt-6 sm:pt-4">
          {/* Left column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Breadcrumb */}
              <motion.nav variants={fadeUp} className="flex items-center gap-1.5 text-xs text-muted mb-4">
                {aboutPageHero.breadcrumb.map((label, idx) => (
                  <React.Fragment key={label}>
                    {idx > 0 && <ChevronRight size={12} className="text-gold" />}
                    <Link
                      href={idx === 0 ? "/" : "/gioi-thieu"}
                      className={`hover:text-gold transition-colors ${idx === aboutPageHero.breadcrumb.length - 1 ? "text-gold font-semibold" : ""}`}
                    >
                      {label}
                    </Link>
                  </React.Fragment>
                ))}
              </motion.nav>

              {/* Badge */}
              <motion.span
                variants={fadeUp}
                className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.18em] text-gold uppercase mb-3"
              >
                {aboutPageHero.badge}
              </motion.span>

              {/* H1 */}
              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-[48px] heading-font font-bold text-ink tracking-tight leading-[1.15]"
              >
                {aboutPageHero.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mt-4 text-sm text-muted max-w-xl leading-relaxed font-light"
              >
                {aboutPageHero.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-4 items-center">
                <Button
                  href="/#du-an-hot"
                  variant="solid"
                  size="md"
                  icon={<ChevronDown size={14} />}
                  iconPosition="right"
                >
                  {aboutPageHero.primaryCta}
                </Button>
                <Button
                  href="/lien-he#global-contact-form"
                  variant="outline"
                  size="md"
                  className="bg-white/90 border-white text-ink hover:bg-gold hover:text-white"
                  icon={<Phone size={14} className="text-gold" />}
                  iconPosition="left"
                >
                  {aboutPageHero.secondaryCta}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right column – floating stats card */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="luxury-card px-5 py-5 sm:px-7 sm:py-6 grid grid-cols-2 gap-x-6 gap-y-4 w-full max-w-xs sm:max-w-sm"
            >
              {aboutPageHero.statsCard.map((stat, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center text-center ${
                    idx < 2 ? "pb-4 border-b border-line/50" : "pt-1"
                  } ${idx % 2 === 0 ? "border-r border-line/50 pr-4" : "pl-4"}`}
                >
                  <span className="text-xl sm:text-2xl font-bold text-gold heading-font leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted mt-1.5 uppercase tracking-wide leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
