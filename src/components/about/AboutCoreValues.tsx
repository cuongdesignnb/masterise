"use client";

import React from "react";
import {
  HeartHandshake,
  Gem,
  Sparkles,
  Handshake,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { coreValues } from "@/data/aboutSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  HeartHandshake,
  Gem,
  Sparkles,
  Handshake,
  Leaf,
  ShieldCheck,
};

export default function AboutCoreValues() {
  return (
    <section className="py-16 sm:py-20 bg-cream">
      <Container>
        {/* Section heading */}
        <MotionWrapper className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] text-gold uppercase">
            <span>🌿</span>
            NỀN TẢNG PHÁT TRIỂN
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] heading-font font-bold text-ink tracking-tight">
            Giá trị cốt lõi
          </h2>
        </MotionWrapper>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {coreValues.map((value, idx) => {
            const Icon = iconMap[value.icon];
            return (
              <MotionWrapper key={idx} delay={idx * 0.06}>
                <div className="bg-white rounded-[18px] border border-line/50 p-4 sm:p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-soft cursor-default h-full">
                  {/* Icon */}
                  {Icon && (
                    <div className="flex justify-center">
                      <Icon size={28} className="text-gold" />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xs uppercase font-bold text-ink mt-3 tracking-wide">
                    {value.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] text-muted mt-2 leading-snug">
                    {value.description}
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
