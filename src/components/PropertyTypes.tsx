"use client";

import React from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { propertyTypes } from "@/data/seed";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

const getIcon = (iconName: string) => {
  const LucideIcon = (Icons as any)[iconName];
  if (LucideIcon) return <LucideIcon size={18} className="text-gold transition-transform duration-300 group-hover:scale-105" />;
  return <Icons.Building2 size={18} className="text-gold" />;
};

export default function PropertyTypes() {
  return (
    <div className="flex flex-col h-full text-left">
      <MotionWrapper>
        {/* Gold Serif Title with Leaf Icon */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gold text-lg">🌿</span>
          <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
            ĐA DẠNG LOẠI HÌNH BẤT ĐỘNG SẢN
          </h2>
        </div>
      </MotionWrapper>

      {/* 6-Card Horizontal Row (Responsive grid) */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {propertyTypes.map((type, idx) => (
          <MotionWrapper key={type.id} delay={idx * 0.04} className="h-full">
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-[#FDFBF7] border border-[#E8DCCB]/60 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300 hover:border-[#B88746] h-full"
            >
              {/* Icon Wrapper */}
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-white shadow-sm flex-shrink-0">
                {getIcon(type.icon)}
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1F1B16] group-hover:text-gold transition-colors duration-300 uppercase tracking-wide whitespace-nowrap">
                {type.title}
              </span>
            </motion.div>
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}
