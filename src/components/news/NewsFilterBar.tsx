"use client";

import React, { useState } from "react";
import {
  Search,
  Building2,
  TrendingUp,
  Heart,
  Scale,
  Compass,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { newsCategories } from "@/data/newsSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

/* Map category labels to lucide icon components */
const categoryIconMap: Record<string, LucideIcon> = {
  "Tin dự án": Building2,
  "Thị trường": TrendingUp,
  "Phong cách sống": Heart,
  "Pháp lý": Scale,
  "Kiến trúc": Compass,
};

export default function NewsFilterBar() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  return (
    <section className="py-6 bg-cream">
      <Container>
        <MotionWrapper>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* ── Search input ── */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, chủ đề, dự án..."
                className="w-full bg-white border border-line/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition"
              />
            </div>

            {/* ── Category chips ── */}
            <div className="flex-1 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-2 min-w-max">
                {newsCategories.map((label) => {
                  const isActive = activeCategory === label;
                  const IconComponent = categoryIconMap[label];
                  return (
                    <button
                      key={label}
                      onClick={() => setActiveCategory(label)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "gold-gradient text-white shadow-sm"
                          : "bg-white border border-line/60 text-muted hover:border-gold hover:text-gold"
                      }`}
                    >
                      {IconComponent && <IconComponent size={13} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Sort dropdown ── */}
            <div className="relative shrink-0">
              <button className="inline-flex items-center gap-2 bg-white border border-line/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold transition cursor-pointer">
                Sắp xếp: Mới nhất
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
