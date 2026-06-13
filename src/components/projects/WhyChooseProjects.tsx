"use client";

import React from "react";
import { whyChooseProjects } from "@/data/projectsSeed";
import { Landmark, MapPin, BadgeCheck, Sparkles, FileCheck2, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

const iconMap: Record<string, LucideIcon> = {
  Landmark,
  MapPin,
  BadgeCheck,
  Sparkles,
  FileCheck2,
  TrendingUp,
};

export default function WhyChooseProjects() {
  return (
    <section className="py-10">
      <Container>
        <MotionWrapper>
          <div className="mb-6">
            <span className="uppercase text-[11px] font-bold tracking-wider text-gold">
              VÌ SAO CHỌN MASTERISE HOMES?
            </span>
          </div>
        </MotionWrapper>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {whyChooseProjects.map((item, idx) => {
            const IconComp = iconMap[item.icon] || Sparkles;
            return (
              <MotionWrapper key={idx} delay={0.06 * idx}>
                <div className="bg-white rounded-[16px] border border-line/50 p-4 text-center hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(87,61,28,0.08)] transition-all duration-300 cursor-pointer">
                  <IconComp className="w-8 h-8 text-gold mx-auto" />
                  <h3 className="text-xs font-bold text-ink mt-3">{item.title}</h3>
                  <p className="text-[10px] text-muted mt-1">{item.description}</p>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
