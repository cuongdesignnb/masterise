"use client";

import React, { useState } from "react";
import Image from "next/image";
import { projectTabs, allProjects } from "@/data/projectsSeed";
import { ArrowRight, MapPin, Heart, ChevronDown } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";

export default function AllProjectsGrid() {
  const [activeTab, setActiveTab] = useState("Tất cả");

  return (
    <section className="py-10">
      <Container>
        {/* Header */}
        <MotionWrapper>
          <div className="mb-6">
            <span className="uppercase text-[11px] font-bold tracking-wider text-gold">
              TẤT CẢ DỰ ÁN
            </span>
          </div>
        </MotionWrapper>

        {/* Tabs + Sort */}
        <MotionWrapper delay={0.05}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {projectTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    activeTab === tab
                      ? "gold-gradient text-white shadow-sm"
                      : "bg-white border border-line/60 text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-xs text-muted bg-white border border-line/50 rounded-xl px-3 py-2 hover:border-gold transition cursor-pointer">
              Sắp xếp: Mới nhất
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </MotionWrapper>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allProjects.map((project, idx) => (
            <MotionWrapper key={idx} delay={0.06 * idx}>
              <div className="bg-white rounded-[16px] border border-line/50 overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(87,61,28,0.08)] transition-all duration-300 group">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Badge */}
                  <span
                    className={`absolute top-3 left-3 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      project.badge === "HOT"
                        ? "gold-gradient"
                        : "bg-emerald-500"
                    }`}
                  >
                    {project.badge}
                  </span>
                  {/* Heart */}
                  <button className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition cursor-pointer">
                    <Heart className="w-3.5 h-3.5 text-muted" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="heading-font text-sm font-bold text-ink">
                    {project.title}
                  </h3>
                  <p className="flex items-center gap-1 text-[11px] text-muted mt-1">
                    <MapPin className="w-3 h-3 text-gold" />
                    {project.location}
                  </p>
                  <p className="text-[10px] text-muted mt-1">{project.type}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    icon={<ArrowRight size={12} />}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </MotionWrapper>
          ))}
        </div>

        {/* Load more */}
        <MotionWrapper delay={0.2} className="text-center mt-8">
          <Button variant="outline" icon={<ArrowRight size={14} />}>
            Xem thêm dự án
          </Button>
        </MotionWrapper>
      </Container>
    </section>
  );
}
