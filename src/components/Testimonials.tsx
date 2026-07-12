"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { homepageService } from "@/services/homepageService";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import MotionWrapper from "./MotionWrapper";

interface TestimonialDisplayItem {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialDisplayItem[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await homepageService.getTestimonials();
        const data = unwrapData<any[]>(response) || [];
        const mapped: TestimonialDisplayItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.role || item.position || "",
          content: item.content,
          avatar: item.avatar || item.avatar_url || "",
        }));
        setTestimonials(mapped);
      } catch {
        setTestimonials([]);
      }
    };
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <div className="flex min-w-0 max-w-full flex-col h-full overflow-x-clip text-left">
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
      <div className="flex max-w-full flex-grow snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 hide-scrollbar md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
        {testimonials.map((testimonial, idx) => (
          <MotionWrapper
            key={testimonial.id}
            delay={idx * 0.08}
            className="h-full w-[min(86vw,360px)] min-w-0 max-w-full flex-shrink-0 snap-center md:w-auto md:flex-shrink md:snap-align-none"
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
