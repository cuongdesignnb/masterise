"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { homepageService } from "@/services/homepageService";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import MotionWrapper from "./MotionWrapper";

interface PartnerDisplayItem {
  id: number;
  name: string;
  logo_url?: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<PartnerDisplayItem[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await homepageService.getPartners();
        const data = unwrapData<any[]>(response) || [];
        const mapped: PartnerDisplayItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          logo_url: item.logo_url,
        }));
        setPartners(mapped);
      } catch {
        setPartners([]);
      }
    };
    fetchPartners();
  }, []);
  const updateScrollState = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    // Scroll snap aligns the first card after the horizontal padding, so the
    // browser may report an initial scrollLeft equal to that padding. Treat
    // that position as the logical start of the slider.
    const startOffset = Number.parseFloat(getComputedStyle(slider).paddingLeft || '0');
    setCanScrollPrev(slider.scrollLeft > startOffset + 2);
    setCanScrollNext(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 2);
  };
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    updateScrollState();
    slider.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      slider.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [partners]);
  const scrollPartners = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    const card = slider?.querySelector<HTMLElement>('[data-partner-card]');
    if (!slider || !card) return;
    const gap = Number.parseFloat(getComputedStyle(slider).columnGap || '0');
    slider.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };
  const renderPartnerName = (name: string) => {
    if (name.toLowerCase() === "savills") {
      // Keep the lowercase partner wordmark without switching font family.
      return (
        <span className="italic lowercase tracking-wide text-sm font-semibold text-muted/80 group-hover:text-gold transition-colors">
          savills
        </span>
      );
    }
    return (
      <span className="text-[10px] sm:text-[11px] font-extrabold text-muted/65 group-hover:text-gold uppercase tracking-[0.15em] heading-font transition-colors">
        {name}
      </span>
    );
  };

  if (partners.length === 0) return null;

  return (
    <div className="flex min-w-0 max-w-full flex-col h-full text-left overflow-x-clip">
      <MotionWrapper>
        {/* Gold Serif Title with Leaf Icon */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gold text-lg">🌿</span>
          <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
            ĐỐI TÁC & THƯƠNG HIỆU ĐỒNG HÀNH
          </h2>
        </div>
      </MotionWrapper>

      {/* Horizontal row centered vertically to match Testimonials height */}
      <div className="flex-grow flex items-center w-full relative">
        {/* Left Arrow Button */}
        <button type="button" disabled={!canScrollPrev} onClick={() => scrollPartners(-1)} className="absolute left-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-muted hover:text-gold transition disabled:cursor-not-allowed disabled:opacity-30 shadow-sm" aria-label="Đối tác trước">
          <ChevronLeft size={16} className="stroke-[2.5]" />
        </button>

        {/* 6 Logo Cards */}
        <div ref={sliderRef} className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-9 pb-2 hide-scrollbar lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-5 lg:pb-0">
          {partners.map((partner) => (
            <div
              key={partner.id}
              data-partner-card
              className="flex h-14 basis-[56%] shrink-0 snap-start items-center justify-center rounded-xl border border-[#E8DCCB]/60 bg-white px-2 py-3 shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:border-[#B88746] sm:basis-[31%] lg:basis-auto lg:shrink lg:snap-none"
            >
              {renderPartnerName(partner.name)}
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button type="button" disabled={!canScrollNext} onClick={() => scrollPartners(1)} className="absolute right-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-muted hover:text-gold transition disabled:cursor-not-allowed disabled:opacity-30 shadow-sm" aria-label="Đối tác tiếp theo">
          <ChevronRight size={16} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
