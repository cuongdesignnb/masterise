"use client";

import React from "react";
import Image from "next/image";
import { projectCollections } from "@/data/projectsSeed";
import { Building2, Landmark, Store, Gem, Trees } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Landmark,
  Store,
  Gem,
  TreePalm: Trees,
};

export default function ProjectCollections() {
  return (
    <section className="py-10">
      <Container>
        {/* Header */}
        <MotionWrapper>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="uppercase text-[11px] font-bold tracking-wider text-gold">
                BỘ SƯU TẬP DỰ ÁN
              </span>
            </div>
            <a
              href="#"
              className="text-gold text-xs font-semibold hover:text-gold-dark transition-colors hidden sm:inline-flex items-center gap-1"
            >
              Xem tất cả bộ sưu tập →
            </a>
          </div>
        </MotionWrapper>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {projectCollections.map((col, idx) => {
            const IconComp = iconMap[col.icon] || Building2;
            return (
              <MotionWrapper key={idx} delay={0.06 * idx}>
                <div className="relative rounded-[16px] overflow-hidden group cursor-pointer h-[130px]">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Icon */}
                  <IconComp className="absolute top-3 right-3 w-5 h-5 text-white/60" />
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm">{col.title}</h3>
                    <p className="text-white/70 text-[11px] mt-0.5">{col.count}</p>
                  </div>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
