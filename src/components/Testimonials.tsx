"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { testimonials } from "@/data/seed";
import MotionWrapper from "./MotionWrapper";

export default function Testimonials() {
  return (
    <div className="flex flex-col h-full text-left">
      <MotionWrapper>
        {/* Gold Serif Title with Leaf Icon */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gold text-lg">🌿</span>
          <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
            KHÁCH HÀNG & NHÀ ĐẦU TƯ NÓI GÌ VỀ CHÚNG TÔI
          </h2>
        </div>
      </MotionWrapper>

      {/* 2-Card Horizontal Row on Desktop (Horizontal slide on Mobile) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-2 md:mx-0 md:px-0 md:pb-0 md:overflow-visible flex-grow">
        {testimonials.map((testimonial, idx) => (
          <MotionWrapper
            key={testimonial.id}
            delay={idx * 0.08}
            className="w-[85vw] sm:w-[380px] md:w-auto flex-shrink-0 snap-center md:flex-shrink md:snap-align-none h-full"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#E8DCCB]/60 rounded-[20px] shadow-soft p-5 flex items-start gap-4 h-full relative cursor-pointer group"
            >
              {/* Left Side: Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#E8DCCB]/40 flex-shrink-0">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Right Side: Content & Profile details */}
              <div className="flex flex-col flex-1 justify-between h-full text-left min-w-0">
                <p className="text-[11.5px] sm:text-[12.5px] text-ink leading-relaxed font-light italic">
                  "{testimonial.content}"
                </p>

                <div className="flex flex-col mt-3.5">
                  <span className="text-xs font-bold text-[#B88746] heading-font uppercase tracking-wide">
                    {testimonial.name}
                  </span>
                  <span className="text-[10px] text-muted font-semibold mt-0.5">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </motion.div>
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}
