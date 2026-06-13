"use client";

import React from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { whyChooseUs } from "@/data/seed";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

const getIcon = (iconName: string) => {
  const LucideIcon = (Icons as any)[iconName];
  if (LucideIcon) return <LucideIcon size={24} className="text-gold" />;
  return <Icons.Award size={24} className="text-gold" />;
};

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 bg-cream">
      <Container>
        <MotionWrapper>
          <SectionHeader
            title="VÌ SAO CHỌN MASTERISE HOMES?"
            subtitle="GIÁ TRỊ CỐT LÕI"
            description="Kiến tạo những chuẩn mực sống mới thông qua những ưu thế vượt trội về phát triển dự án bất động sản."
          />
        </MotionWrapper>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-6">
          {whyChooseUs.map((benefit, idx) => (
            <MotionWrapper key={benefit.id} delay={idx * 0.06}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-line/60 rounded-luxury p-6 flex flex-col items-center text-center cursor-pointer group h-full transition-colors duration-300 hover:border-gold hover:shadow-soft"
              >
                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center mb-5 transition-transform duration-500 group-hover:rotate-6 shadow-sm">
                  {getIcon(benefit.icon)}
                </div>

                {/* Content info */}
                <h3 className="text-sm sm:text-base font-bold text-ink heading-font group-hover:text-gold transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-3 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
