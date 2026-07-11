"use client";

import React from "react";
import Image from "next/image";
import {
  PhoneCall,
  Users,
  BadgeCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import Container from "@/components/Container";
import Button from "@/components/Button";
import { contactHero } from "@/data/contactSeed";

const heroIconMap: Record<string, LucideIcon> = {
  PhoneCall,
  Users,
  BadgeCheck,
};

/* ── stagger helpers ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ContactHero() {
  return (
    <section className="bg-ivory pt-[72px] pb-8">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:grid lg:grid-cols-12 gap-8 items-center"
        >
          {/* ─── Left column ─── */}
          <motion.div variants={fadeUp} className="lg:col-span-6">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs text-muted"
            >
              {contactHero.breadcrumb.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && (
                    <ChevronRight className="w-3 h-3 text-gold shrink-0" />
                  )}
                  <span
                    className={
                      i === contactHero.breadcrumb.length - 1
                        ? "text-gold font-medium"
                        : ""
                    }
                  >
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {/* Badge */}
            <span className="inline-block mt-4 gold-gradient text-white text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full">
              {contactHero.badge}
            </span>

            {/* Heading */}
            <h1 className="heading-font text-3xl md:text-4xl lg:text-[56px] text-ink leading-[1.1] font-bold mt-4">
              {contactHero.title}
            </h1>

            {/* Description */}
            <p className="text-sm text-muted max-w-xl mt-3">
              {contactHero.description}
            </p>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                href="#global-contact-form"
                variant="gold-gradient"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {contactHero.primaryCta}
              </Button>

              <Button href="/du-an#du-an-noi-bat" variant="outline">
                {contactHero.secondaryCta}
              </Button>
            </div>
          </motion.div>

          {/* ─── Right column ─── */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-6 mt-8 lg:mt-0 relative"
          >
            {/* Image */}
            <div className="rounded-[22px] overflow-hidden shadow-soft aspect-[4/3] relative">
              <Image
                src={contactHero.image}
                alt="Masterise Homes - Văn phòng tư vấn"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Floating quick-info card */}
            <div className="lg:absolute lg:right-[-20px] lg:top-1/2 lg:-translate-y-1/2 mt-4 lg:mt-0 bg-white/95 backdrop-blur-sm rounded-[18px] p-5 shadow-soft w-full lg:w-[280px] space-y-4">
              {contactHero.quickInfo.map((item) => {
                const Icon = heroIconMap[item.icon] ?? PhoneCall;
                return (
                  <div key={item.title} className="flex gap-3 items-center">
                    <span className="w-9 h-9 rounded-xl bg-beige/60 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gold" />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase text-muted tracking-wider">
                        {item.title}
                      </p>
                      <p className="heading-font text-base font-bold text-gold">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
