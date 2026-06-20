"use client";

import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import {
  BadgeCheck,
  Gem,
  MapPin,
  Sparkles,
  TrendingUp,
  Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  Gem,
  MapPin,
  Sparkles,
  TrendingUp,
  Handshake,
};

export default function AboutWhyChoose() {
  const { aboutPageWhyChoose } = useSiteSettings();

  return (
    <section className="py-16 md:py-24 soft-section-bg">
      <Container>
        {/* Section title */}
        <MotionWrapper>
          <h2 className="heading-font text-xl md:text-2xl font-bold text-gold mb-10 md:mb-14 text-center">
            🌿 VÌ SAO CHỌN MASTERISE HOMES?
          </h2>
        </MotionWrapper>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {aboutPageWhyChoose.map((item, idx) => {
            const Icon = iconMap[item.icon];
            return (
              <MotionWrapper key={idx} delay={idx * 0.07}>
                <div className="bg-white rounded-[16px] border border-line/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                  {/* Icon */}
                  {Icon && (
                    <Icon
                      className="w-6 h-6 text-gold mx-auto"
                      strokeWidth={1.8}
                    />
                  )}

                  {/* Title */}
                  <h3 className="font-bold text-xs uppercase text-ink mt-2 tracking-wide">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
