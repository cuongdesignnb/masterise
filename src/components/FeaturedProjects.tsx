"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { featuredProjects } from "@/data/seed";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

export default function FeaturedProjects() {
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="py-16 sm:py-20 bg-cream">
      <Container>
        <MotionWrapper>
          {/* Header section with view-all link */}
          <SectionHeader
            title="DỰ ÁN NỔI BẬT"
            subtitle="KIẾN TẠO PHONG CÁCH SỐNG"
            description="Tuyển chọn những bất động sản hàng hiệu tiêu biểu nhất, sở hữu thiết kế độc đáo và chất lượng vượt trội."
            align="left"
          >
            <Link
              href="#du-an-tat-ca"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-gold hover:text-gold-dark transition-colors mt-2 sm:mt-0"
            >
              <span>Xem tất cả dự án</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </SectionHeader>
        </MotionWrapper>

        {/* Projects Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar gap-6 mt-6 pb-6 -mx-4 px-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible">
          {featuredProjects.map((project, idx) => {
            const isFav = !!favorites[project.id];

            return (
              <MotionWrapper
                key={project.id}
                delay={idx * 0.05}
                className="w-[85vw] sm:w-[380px] flex-shrink-0 snap-center lg:w-auto lg:flex-shrink-0 lg:snap-align-none"
              >
                <div className="block h-full group">
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-line/50 rounded-luxury shadow-soft overflow-hidden h-full flex flex-col cursor-pointer"
                  >
                    {/* Project Image Area */}
                    <div className="relative h-60 w-full overflow-hidden">
                      {/* Image wrapped in Link */}
                      <Link href={`#project-${project.id}`} className="block w-full h-full">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                        />
                      </Link>

                      {/* Heart Icon Toggle (Placed OUTSIDE the Link) */}
                      <button
                        onClick={(e) => toggleFavorite(project.id, e)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-muted hover:text-gold hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200"
                        aria-label="Save to favorites"
                      >
                        <Heart
                          size={16}
                          className={`transition-colors duration-300 ${
                            isFav ? "text-gold fill-gold" : "text-muted hover:text-gold"
                          }`}
                        />
                      </button>

                      {/* Floating tag */}
                      {project.type && (
                        <span className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-md border border-white/10 pointer-events-none">
                          {project.type}
                        </span>
                      )}
                    </div>

                    {/* Card Content details */}
                    <div className="p-6 flex flex-col flex-grow text-left">
                      <Link href={`#project-${project.id}`} className="block hover:text-gold transition-colors duration-300">
                        <h3 className="text-lg font-bold text-ink heading-font">
                          {project.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-muted text-xs sm:text-sm mt-2">
                        <MapPin size={14} className="text-gold" />
                        <span>{project.location}</span>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-line/45 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-muted uppercase font-medium tracking-wider">
                          Giá dự kiến
                        </span>
                        <span className="text-base font-bold text-gold">
                          {project.price}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
