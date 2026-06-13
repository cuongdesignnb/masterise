"use client";

import React from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { investmentOpportunities } from "@/data/seed";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

const getIcon = (iconName: string) => {
  const LucideIcon = (Icons as any)[iconName];
  if (LucideIcon) return <LucideIcon size={20} className="text-gold" />;
  return <Icons.TrendingUp size={20} className="text-gold" />;
};

export default function InvestmentOpportunities() {
  return (
    <div className="flex flex-col h-full text-left">
      <MotionWrapper>
        {/* Gold Serif Title with Leaf Icon */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gold text-lg">🌿</span>
          <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
            CƠ HỘI ĐẦU TƯ
          </h2>
        </div>
      </MotionWrapper>

      {/* 4-Card Horizontal Row (Responsive grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {investmentOpportunities.map((opportunity, idx) => (
          <MotionWrapper key={opportunity.id} delay={idx * 0.05} className="h-full">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-[#FDFBF7] border border-[#E8DCCB]/60 rounded-xl shadow-soft p-4 sm:p-5 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon Container - Centered */}
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-105 shadow-sm mx-auto flex-shrink-0">
                {getIcon(opportunity.icon)}
              </div>

              {/* Title Container - Centered with min-height */}
              <div className="min-h-[38px] flex items-center justify-center w-full mb-1">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-[#B88746] group-hover:text-[#A97432] transition-colors duration-300 heading-font leading-tight">
                  {opportunity.title}
                </h3>
              </div>

              {/* Description - Centered and pushed to bottom */}
              <p className="text-[10.5px] sm:text-[11.5px] text-muted leading-relaxed mt-auto">
                {opportunity.description}
              </p>
            </motion.div>
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}
