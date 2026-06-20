"use client";

import React from "react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

export default function AboutTimeline() {
  const { aboutTimeline } = useSiteSettings();

  return (
    <section className="py-16 sm:py-20 bg-cream">
      <Container>
        {/* Section heading */}
        <MotionWrapper className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] text-gold uppercase">
            <span>🌿</span>
            LỊCH SỬ PHÁT TRIỂN
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] heading-font font-bold text-ink tracking-tight">
            Hành trình phát triển
          </h2>
        </MotionWrapper>

        {/* ─── Desktop: Horizontal timeline ─── */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Gold line */}
            <div className="absolute top-4 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/20 via-gold to-gold/20" />

            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${aboutTimeline.length}, 1fr)` }}
            >
              {aboutTimeline.map((item, idx) => (
                <MotionWrapper key={idx} delay={idx * 0.1} className="flex flex-col items-center">
                  {/* Dot */}
                  <div className="relative z-10 w-[10px] h-[10px] rounded-full bg-gold ring-4 ring-cream" />

                  {/* Year */}
                  <span className="mt-4 text-sm font-bold text-gold heading-font">
                    {item.year}
                  </span>

                  {/* Title */}
                  <span className="mt-1.5 text-xs text-muted text-center leading-snug max-w-[120px]">
                    {item.title}
                  </span>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Mobile: Vertical timeline ─── */}
        <div className="lg:hidden relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gold/20 via-gold to-gold/20" />

          <div className="flex flex-col gap-8">
            {aboutTimeline.map((item, idx) => (
              <MotionWrapper key={idx} delay={idx * 0.08} className="relative">
                {/* Dot */}
                <div className="absolute -left-[23px] top-1 w-[10px] h-[10px] rounded-full bg-gold ring-4 ring-cream z-10" />

                {/* Content */}
                <div>
                  <span className="text-sm font-bold text-gold heading-font">
                    {item.year}
                  </span>
                  <p className="text-sm text-muted mt-0.5 leading-snug">
                    {item.title}
                  </p>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
