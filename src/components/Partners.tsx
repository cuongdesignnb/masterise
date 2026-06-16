"use client";

import React, { useState, useEffect } from "react";
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
      } catch (error) {
        console.error("Error fetching partners:", error);
        setPartners([]);
      }
    };
    fetchPartners();
  }, []);
  const renderPartnerName = (name: string) => {
    if (name.toLowerCase() === "savills") {
      // Render "savills" in lowercase serif logotype
      return (
        <span className="font-serif italic lowercase tracking-wide text-sm font-semibold text-muted/80 group-hover:text-gold transition-colors">
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
    <div className="flex flex-col h-full text-left">
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
        <button className="absolute left-0 z-10 w-6 h-6 flex items-center justify-center text-muted/40 hover:text-gold transition-colors cursor-pointer select-none" aria-label="Đối tác trước">
          <ChevronLeft size={16} className="stroke-[2.5]" />
        </button>

        {/* 6 Logo Cards */}
        <div className="grid grid-cols-6 gap-2 w-full px-5">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white border border-[#E8DCCB]/60 rounded-xl py-3 px-1.5 flex items-center justify-center h-14 cursor-pointer group shadow-sm hover:border-[#B88746] hover:-translate-y-[2px] transition-all duration-300"
            >
              {renderPartnerName(partner.name)}
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button className="absolute right-0 z-10 w-6 h-6 flex items-center justify-center text-muted/40 hover:text-gold transition-colors cursor-pointer select-none" aria-label="Đối tác tiếp theo">
          <ChevronRight size={16} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
