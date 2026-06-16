"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { news } from "@/data/seed";
import MotionWrapper from "./MotionWrapper";

const getTagStyles = (tag: string) => {
  const styles: Record<string, { text: string; border: string }> = {
    "Thị trường": {
      text: "text-[#A0703C]",
      border: "border-[#A0703C]/45",
    },
    "Dự án": {
      text: "text-[#1E6B3E]",
      border: "border-[#1E6B3E]/45",
    },
    "Phong cách sống": {
      text: "text-[#558B2F]",
      border: "border-[#558B2F]/45",
    },
    "Cẩm nang": {
      text: "text-[#15803D]",
      border: "border-[#15803D]/45",
    },
  };
  return styles[tag] || { text: "text-[#B88746]", border: "border-[#E8DCCB]" };
};

export default function NewsAndGuide() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by approximately one card width plus gap
      const cardWidth = clientWidth / 3;
      const scrollTo =
        direction === "left"
          ? scrollLeft - cardWidth * 1.05
          : scrollLeft + cardWidth * 1.05;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col h-full text-left">
      {/* Header with Title, Navigation Arrows, and "Xem tất cả" link */}
      <MotionWrapper>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E8DCCB]/20">
          <div className="flex items-center gap-2">
            <span className="text-gold text-lg">🌿</span>
            <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
              TIN TỨC THỊ TRƯỜNG & CẨM NANG
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="#news"
              className="text-xs font-bold text-gold hover:text-gold-dark transition-colors inline-flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            {/* Slider Navigation Arrows */}
            <div className="flex items-center gap-1.5 border-l border-[#E8DCCB]/30 pl-4">
              <button
                onClick={() => scroll("left")}
                aria-label="Tin trước"
                className="w-7 h-7 rounded-full border border-[#E8DCCB] bg-white flex items-center justify-center text-[#B88746] hover:bg-[#B88746] hover:text-white hover:border-[#B88746] transition-all cursor-pointer shadow-sm"
              >
                <ChevronLeft size={14} className="stroke-[2.5]" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Tin sau"
                className="w-7 h-7 rounded-full border border-[#E8DCCB] bg-white flex items-center justify-center text-[#B88746] hover:bg-[#B88746] hover:text-white hover:border-[#B88746] transition-all cursor-pointer shadow-sm"
              >
                <ChevronRight size={14} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </MotionWrapper>

      {/* 3-Card sliding horizontal viewport */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar flex-grow w-full py-1 px-0.5"
      >
        {news.map((item, idx) => (
          <div 
            key={item.id}
            className="flex-shrink-0 snap-start min-w-[82%] md:min-w-[calc((100%-12px)/2)] lg:min-w-[calc((100%-24px)/3)] w-[82%] md:w-[calc((100%-12px)/2)] lg:w-[calc((100%-24px)/3)] h-full"
          >
            <MotionWrapper delay={idx * 0.04} className="h-full">
              <Link href={`#news-${item.id}`} className="block h-full group">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-[#E8DCCB]/60 rounded-2xl shadow-soft h-full flex flex-col cursor-pointer hover:border-[#B88746]"
                >
                  {/* Image Container with tag badge overlay on boundary */}
                  <div className="relative h-28 sm:h-32 w-full flex-shrink-0">
                    <div className="w-full h-full overflow-hidden rounded-t-[15px] bg-beige/10 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    {/* Badge overlaps the bottom of the image wrapper */}
                    <span className={`absolute bottom-0 translate-y-1/2 left-3.5 bg-[#FFFDF8] border ${getTagStyles(item.tag).border} ${getTagStyles(item.tag).text} text-[8.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm whitespace-nowrap`}>
                      {item.tag}
                    </span>
                  </div>

                  {/* Info Content */}
                  <div className="p-3.5 pt-4 flex flex-col flex-grow text-left">
                    <h3 className="text-[12.5px] sm:text-[13px] font-bold text-ink group-hover:text-gold transition-colors duration-300 heading-font line-clamp-2 leading-snug min-h-[36px]">
                      {item.title}
                    </h3>

                    <span className="text-[10px] text-muted/70 mt-3 font-semibold block">
                      {item.date}
                    </span>
                  </div>
                </motion.div>
              </Link>
            </MotionWrapper>
          </div>
        ))}
      </div>
    </div>
  );
}
