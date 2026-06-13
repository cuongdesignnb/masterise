"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { regions, regionTabs } from "@/data/seed";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

// Mock data for other tabs
const regionsDataMap: Record<string, typeof regions> = {
  "TP.HCM": regions,
  "Hà Nội": [
    { id: 1, name: "Tây Hồ", count: 12 },
    { id: 2, name: "Gia Lâm", count: 6 },
    { id: 3, name: "Nam Từ Liêm", count: 8 },
    { id: 4, name: "Hai Bà Trưng", count: 4 },
  ],
  "Đà Nẵng": [
    { id: 1, name: "Ngũ Hành Sơn", count: 5 },
    { id: 2, name: "Sơn Trà", count: 3 },
    { id: 3, name: "Hải Châu", count: 2 },
  ],
  "Phú Quốc": [
    { id: 1, name: "Dương Đông", count: 4 },
    { id: 2, name: "An Thới", count: 3 },
  ],
  "Các tỉnh khác": [
    { id: 1, name: "Bình Dương", count: 6 },
    { id: 2, name: "Đồng Nai", count: 4 },
    { id: 3, name: "Hưng Yên", count: 5 },
  ],
};

export default function RegionProjects() {
  const [activeTab, setActiveTab] = useState("TP.HCM");
  const currentRegions = regionsDataMap[activeTab] || regions;

  return (
    <div className="flex flex-col h-full text-left">
      <MotionWrapper>
        {/* Gold Serif Title with Leaf Icon */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gold text-lg">🌿</span>
          <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
            DỰ ÁN THEO KHU VỰC
          </h2>
        </div>
      </MotionWrapper>

      {/* Tab Controls (Gold outline for active tab) */}
      <div className="flex justify-start mb-6 overflow-x-auto pb-1 border-b border-line/10 hide-scrollbar">
        <div className="flex gap-2.5 pb-2 whitespace-nowrap items-center">
          {regionTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none cursor-pointer ${
                activeTab === tab
                  ? "border border-[#B88746] bg-[#FDFBF7] text-[#B88746] rounded-lg px-3.5 py-1.5 shadow-sm"
                  : "text-muted/75 hover:text-ink px-3.5 py-1.5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Unified White-Cream Inset Card for Map and List */}
      <div className="bg-[#FDFBF7] border border-[#E8DCCB]/60 rounded-[24px] shadow-[0_12px_40px_rgba(87,61,28,0.04)] p-5 flex-grow flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-grow">
          
          {/* Map Vector (7/12 cols) */}
          <div className="md:col-span-7 bg-[#FFFDF8] border border-[#E8DCCB]/40 rounded-xl p-3 relative flex items-center justify-center min-h-[220px]">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
              backgroundImage: "radial-gradient(#b88746 1px, transparent 1px)",
              backgroundSize: "16px 16px"
            }} />

            {/* Container to lock aspect ratio of map + markers */}
            <div className="relative w-full max-w-[320px] aspect-[5/4]">
              {/* Mock Vector Map */}
              <svg viewBox="0 0 500 400" className="w-full h-full text-beige" fill="currentColor">
                <path d="M50,150 Q100,100 150,140 T250,130 T350,180 T450,160 Q480,240 400,280 T200,260 T100,280 Z" fillOpacity="0.45" stroke="#E8DCCB" strokeWidth="1.5" />
                <path d="M120,220 Q180,180 220,240 T320,210 T410,250" fill="none" stroke="#E8DCCB" strokeWidth="2.5" strokeDasharray="4,4" />
                <path d="M80,80 C120,120 160,80 220,120" fill="none" stroke="#B88746" strokeWidth="1" opacity="0.3" />
              </svg>

              {/* Pulse Markers */}
              <div className="absolute top-[38%] left-[30%] group cursor-pointer">
                <span className="absolute inline-flex h-5 w-5 rounded-full bg-gold/30 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold shadow-md border border-white" />
              </div>

              <div className="absolute top-[50%] left-[56%] group cursor-pointer">
                <span className="absolute inline-flex h-5 w-5 rounded-full bg-gold/30 animate-ping [animation-delay:0.5s]" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold shadow-md border border-white" />
              </div>

              <div className="absolute top-[65%] left-[42%] group cursor-pointer">
                <span className="absolute inline-flex h-5 w-5 rounded-full bg-gold/30 animate-ping [animation-delay:1s]" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold shadow-md border border-white" />
              </div>
            </div>
          </div>

          {/* List of Districts (5/12 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between h-full py-1">
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {currentRegions.slice(0, 5).map((region, idx) => (
                  <motion.div
                    key={`${activeTab}-${region.id}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-beige/10 border border-[#E8DCCB]/40 rounded-xl cursor-pointer group transition-all duration-300 hover:translate-x-0.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={12} className="text-gold flex-shrink-0" />
                      <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors truncate">
                        {region.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-cream text-gold py-0.5 px-2 rounded-full flex-shrink-0">
                      {region.count} BĐS
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Link
              href="#du-an"
              className="group inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-dark transition-colors mt-4 self-start"
            >
              <span>Xem tất cả khu vực</span>
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
