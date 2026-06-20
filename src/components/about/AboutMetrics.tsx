"use client";

import React from "react";
import { CalendarCheck, Building2, UsersRound, MapPinned } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CalendarCheck,
  Building2,
  UsersRound,
  MapPinned,
};

export default function AboutMetrics() {
  const { aboutPageMetrics } = useSiteSettings();

  return (
    <section className="py-12 sm:py-14 soft-section-bg">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {aboutPageMetrics.map((metric, idx) => {
            const Icon = iconMap[metric.icon];
            return (
              <MotionWrapper key={idx} delay={idx * 0.08}>
                <div
                  className={`luxury-card flex flex-col items-center text-center px-4 py-6 sm:px-5 sm:py-7 transition-transform duration-300 hover:-translate-y-1 ${
                    idx < aboutPageMetrics.length - 1
                      ? "lg:border-r lg:border-line/40 lg:rounded-none lg:shadow-none lg:bg-transparent lg:border-t-0 lg:border-b-0 lg:border-l-0"
                      : ""
                  }`}
                >
                  {Icon && <Icon size={28} className="text-gold mb-3" />}
                  <span className="text-2xl sm:text-3xl font-bold text-gold heading-font leading-none">
                    {metric.value}
                  </span>
                  <span className="text-[11px] sm:text-xs text-muted mt-2 uppercase tracking-wide font-medium">
                    {metric.label}
                  </span>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
