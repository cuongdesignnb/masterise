"use client";

import React from "react";
import { Award } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

export default function AboutAwards() {
  const { aboutPageAwards } = useSiteSettings();

  return (
    <section className="py-16 sm:py-20 soft-section-bg">
      <Container>
        {/* Section heading */}
        <MotionWrapper className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] text-gold uppercase">
            <span>🌿</span>
            THÀNH TỰU NỔI BẬT
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] heading-font font-bold text-ink tracking-tight">
            Dấu ấn thương hiệu
          </h2>
        </MotionWrapper>

        {/* Award cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {aboutPageAwards.map((award, idx) => (
            <MotionWrapper key={idx} delay={idx * 0.08}>
              <div className="bg-white rounded-[18px] border border-line/50 p-4 sm:p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-soft cursor-default h-full flex flex-col items-center">
                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <Award size={30} className="text-gold" />
                </div>

                {/* Title */}
                <h3 className="heading-font font-bold text-sm text-ink leading-snug">
                  {award.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-muted mt-2 leading-snug">
                  {award.description}
                </p>
              </div>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
