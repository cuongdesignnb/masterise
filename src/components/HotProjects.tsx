"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { hotProjects } from "@/data/seed";
import HotProjectCard from "@/components/HotProjectCard";
import Container from "@/components/Container";

export default function HotProjects() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by one card width on mobile (approx 85% of clientWidth)
      const scrollAmount = clientWidth > 768 ? clientWidth / 2 : clientWidth * 0.85;
      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section id="du-an-hot" className="relative bg-[#FFFDF8] py-16 md:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-12 flex items-center justify-between gap-5"
        >
          <h2 className="heading-font text-[38px] font-semibold uppercase leading-none tracking-[0.04em] text-[#1F1B16] md:text-[54px]">
            DỰ ÁN HOT
          </h2>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Dự án trước"
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#E8DCCB] bg-white/80 text-[#B88746] shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B88746] hover:bg-[#B88746] hover:text-white cursor-pointer focus:outline-none"
            >
              <ChevronLeft size={16} className="sm:w-[19px] sm:h-[19px]" />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Dự án tiếp theo"
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#E8DCCB] bg-white/80 text-[#B88746] shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B88746] hover:bg-[#B88746] hover:text-white cursor-pointer focus:outline-none"
            >
              <ChevronRight size={16} className="sm:w-[19px] sm:h-[19px]" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar gap-6 pb-6 -mx-4 px-4 lg:grid lg:gap-8 lg:grid-cols-2 2xl:grid-cols-4 lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible"
        >
          {hotProjects.map((project, index) => (
            <div
              key={project.id}
              className="w-[85vw] sm:w-[380px] flex-shrink-0 snap-center lg:w-auto lg:flex-shrink-0 lg:snap-align-none"
            >
              <HotProjectCard
                project={project}
                index={index}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
