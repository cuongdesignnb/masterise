"use client";

import React from "react";
import * as Icons from "lucide-react";
import Container from "./Container";
import Counter from "./Counter";
import MotionWrapper from "./MotionWrapper";

// TODO: Replace with Settings API fetch in the future
// These stats will be managed via the admin Settings panel
const stats = [
  { id: 1, value: 50, suffix: "+", label: "DỰ ÁN CAO CẤP", icon: "Building2" },
  { id: 2, value: 15000, suffix: "+", label: "NHÀ ĐẦU TƯ TIN TƯỞNG", icon: "Handshake" },
  { id: 3, value: 30000, suffix: "+", label: "GIAO DỊCH THÀNH CÔNG", icon: "BadgeCheck" },
  { id: 4, value: 10, suffix: "+", label: "NĂM KINH NGHIỆM", icon: "ShieldCheck" },
];

const getIcon = (iconName: string) => {
  const LucideIcon = (Icons as any)[iconName];
  if (LucideIcon) return <LucideIcon size={16} className="text-gold" />;
  return <Icons.Building2 size={16} className="text-gold" />;
};

export default function Stats() {
  return (
    <section className="py-6 sm:py-8 bg-cream">
      <Container>
        <MotionWrapper className="bg-white border border-line rounded-xl shadow-soft py-4 px-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-line/65">
            {stats.map((stat, idx) => (
              <div
                key={stat.id}
                className={`flex items-center gap-4 justify-start lg:justify-center ${
                  idx >= 2 ? "pt-4 lg:pt-0" : ""
                } ${idx === 1 ? "pt-0 lg:pt-0" : ""} ${idx % 2 !== 0 ? "pl-0 sm:pl-6" : ""} lg:px-6`}
              >
                {/* Gold Circle Outline Icon */}
                <div className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center bg-transparent flex-shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer">
                  {getIcon(stat.icon)}
                </div>

                {/* Stat Value and Text */}
                <div className="flex flex-col text-left">
                  <span className="text-xl sm:text-2xl font-bold text-gold tracking-tight leading-none heading-font">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-wider mt-1.5 leading-none">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
