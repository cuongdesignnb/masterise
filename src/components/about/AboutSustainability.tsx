"use client";

import Image from "next/image";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { Leaf, UsersRound, SearchCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  UsersRound,
  SearchCheck,
};

export default function AboutSustainability() {
  const { aboutPageSustainability } = useSiteSettings();

  return (
    <section className="py-16 md:py-24">
      <Container>
        {/* Section title */}
        <MotionWrapper>
          <h2 className="heading-font text-xl md:text-2xl font-bold text-gold mb-10 md:mb-14 text-center uppercase">
            🌿 {aboutPageSustainability.title}
          </h2>
        </MotionWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ── Left: Image ──────────────────────────── */}
          <MotionWrapper className="lg:col-span-5">
            <div className="rounded-[22px] overflow-hidden shadow-soft relative aspect-[4/5]">
              <Image
                src={aboutPageSustainability.image}
                alt="Phát triển bền vững Masterise Homes"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </MotionWrapper>

          {/* ── Right: Pillars ───────────────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {aboutPageSustainability.pillars.map((pillar, idx) => {
              const Icon = iconMap[pillar.icon];
              return (
                <MotionWrapper key={idx} delay={idx * 0.12}>
                  <div className="flex items-start gap-4 p-5 bg-white rounded-[18px] border border-line/40 transition-shadow duration-300 hover:shadow-soft">
                    {/* Icon */}
                    {Icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-6 h-6 text-gold" strokeWidth={1.8} />
                      </div>
                    )}

                    {/* Text */}
                    <div>
                      <h3 className="font-bold text-sm text-ink">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </MotionWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
