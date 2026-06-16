"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { projectStatusColumns } from "@/data/seed";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import MotionWrapper from "./MotionWrapper";

export default function ProjectStatus() {
  return (
    <section id="tien-do" className="py-16 sm:py-20 bg-[#FFFDF8] border-t border-line/30">
      <Container>
        {/* Status Columns Grid - Directly rendered to match mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projectStatusColumns.map((column, colIdx) => (
            <MotionWrapper key={column.id} delay={colIdx * 0.1} className="flex flex-col h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-4 border-b border-line/30 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="text-gold text-sm">🌿</span>
                  <h3 className="text-base sm:text-lg font-bold text-[#B88746] tracking-wider heading-font uppercase">
                    {column.title}
                  </h3>
                </div>
                <Link
                  href={`#status-${column.id}`}
                  className="text-xs font-semibold text-gold hover:text-gold-dark transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Projects List */}
              <div className="flex flex-col gap-4 flex-grow">
                {column.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`#project-${project.id}`}
                    className="block group"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 p-3 bg-[#FDFBF7] hover:bg-beige/10 border border-[#E8DCCB]/60 rounded-2xl transition-all duration-300 items-center justify-between"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Compact Thumbnail Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Project Details */}
                        <div className="min-w-0 text-left">
                          <h4 className="text-[13px] sm:text-[14px] font-bold text-ink group-hover:text-gold transition-colors truncate">
                            {project.name}
                          </h4>
                          
                          <div className="flex items-center gap-1 text-muted text-[10.5px] mt-1.5 truncate">
                            <MapPin size={11} className="text-gold flex-shrink-0" />
                            <span className="truncate">{project.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Badges / Price / Empty based on column type */}
                      {colIdx === 0 && (
                        <span className="text-[9px] font-bold text-[#17823B] bg-[#17823B]/10 border border-[#17823B]/20 px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                          Sắp mở bán
                        </span>
                      )}
                      {colIdx === 1 && project.price && (
                        <span className="text-xs font-bold text-[#B88746] flex-shrink-0">
                          {project.price}
                        </span>
                      )}
                      {/* Column 2 (Đã bàn giao) is empty on the right side */}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
