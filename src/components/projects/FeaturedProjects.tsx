"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Heart, Star } from "lucide-react";
import { featuredProjects } from "@/data/projectsSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";

export default function FeaturedProjects() {
  return (
    <section className="py-10">
      <Container>
        {/* Header row */}
        <MotionWrapper delay={0}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-gold fill-gold" />
                <span className="text-[11px] font-bold tracking-wider text-gold uppercase">
                  DỰ ÁN NỔI BẬT
                </span>
              </div>
              <h2 className="heading-font text-2xl sm:text-3xl font-bold text-ink">
                Danh Mục Dự Án Tiêu Biểu
              </h2>
            </div>
            <Link
              href="/du-an"
              className="hidden sm:inline-flex items-center gap-1 text-gold text-xs font-semibold hover:text-gold-dark transition-colors"
            >
              Xem tất cả dự án
              <ArrowRight size={13} />
            </Link>
          </div>
        </MotionWrapper>

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {featuredProjects.map((project, idx) => (
            <MotionWrapper key={idx} delay={0.06 * idx}>
              <div className="bg-white rounded-[18px] border border-line/50 overflow-hidden hover:-translate-y-1.5 hover:shadow-soft transition-all duration-300 group h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 gold-gradient text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide">
                    {project.badge}
                  </span>

                  {/* Heart icon */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    aria-label="Lưu dự án yêu thích"
                  >
                    <Heart
                      size={13}
                      className="text-muted/60 hover:text-gold transition-colors"
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="heading-font text-sm font-bold text-ink leading-snug">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
                    <MapPin size={12} className="shrink-0 text-muted/70" />
                    <span>{project.location}</span>
                  </div>

                  <p className="text-[11px] text-muted mt-1.5 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  <div className="mt-auto pt-3">
                    <Button
                      href="#"
                      variant="outline"
                      size="sm"
                      icon={<ArrowRight size={12} />}
                      iconPosition="right"
                      className="w-full"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          ))}
        </div>

        {/* Mobile "see all" link */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/du-an"
            className="inline-flex items-center gap-1 text-gold text-xs font-semibold hover:text-gold-dark transition-colors"
          >
            Xem tất cả dự án
            <ArrowRight size={13} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
