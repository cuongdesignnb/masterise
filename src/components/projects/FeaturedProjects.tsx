"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Heart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { mapApiProjectToProjectCard } from "@/adapters/projectAdapter";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { getProjectMarketingLabel, getProjectStatusLabel, getProjectStatusColor } from "@/lib/projectStatus";
import type { Project } from "@/types/api";

export default function FeaturedProjects({ initialProjects = [] }: { initialProjects?: Project[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["projects-page-featured"],
    queryFn: async () => {
      const data = await projectService.getFeaturedProjects();
      return data.map(mapApiProjectToProjectCard);
    },
    initialData: initialProjects.map(mapApiProjectToProjectCard),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (window.location.hash !== "#du-an-noi-bat") return;
    const timeout = window.setTimeout(() => {
      document.getElementById("du-an-noi-bat")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, []);

  const scrollProjects = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollBy({ left: direction * Math.max(280, slider.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section id="du-an-noi-bat" className="scroll-mt-28 py-10">
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
                Danh mục dự án tiêu biểu
              </h2>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollProjects(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-gold hover:text-gold"
                aria-label="Xem dự án phía trước"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollProjects(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-gold hover:text-gold"
                aria-label="Xem dự án tiếp theo"
              >
                <ChevronRight size={17} />
              </button>
              <Link
                href="#tat-ca-du-an"
                className="hidden sm:inline-flex items-center gap-1 text-gold text-xs font-semibold hover:text-gold-dark transition-colors"
              >
                Xem tất cả dự án
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </MotionWrapper>

        {/* Loading / Error / Empty States */}
        {isLoading && <LoadingState message="Đang tải dự án nổi bật..." />}
        
        {error && (
          <ErrorState
            message="Không thể kết nối máy chủ để tải dự án nổi bật."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && projects.length === 0 && (
          <EmptyState
            title="Chưa có dự án nào"
            description="Thông tin các dự án nổi bật sẽ sớm được cập nhật."
          />
        )}

        {/* Projects slider */}
        {!isLoading && !error && projects.length > 0 && (
          <div
            ref={sliderRef}
            className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
            aria-label="Danh mục dự án tiêu biểu"
          >
            {projects.map((project, idx) => (
              <MotionWrapper
                key={project.id || project.slug || idx}
                delay={0.06 * idx}
                className="w-[82vw] max-w-[340px] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] sm:max-w-none lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-5rem)/5)]"
              >
                <div className="bg-white rounded-[18px] border border-line/50 overflow-hidden hover:-translate-y-1.5 hover:shadow-soft transition-all duration-300 group h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Link href={project.slug ? `/${project.slug}` : `#`}>
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      />
                    </Link>

                    <div className="absolute left-3 top-3 flex max-w-[70%] flex-col items-start gap-1.5">
                      {getProjectMarketingLabel(project.project_label, project.project_status, project.project_status_detail) && (
                        <span className="max-w-full truncate rounded-full bg-[#6F5436]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                          {getProjectMarketingLabel(project.project_label, project.project_status, project.project_status_detail)}
                        </span>
                      )}
                      {project.badge && project.badge !== getProjectMarketingLabel(project.project_label, project.project_status, project.project_status_detail) && (
                        <span className="rounded-full gold-gradient px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                          {project.badge}
                        </span>
                      )}
                    </div>
                    {project.project_status && (
                      <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${getProjectStatusColor(project.project_status_detail).bg} ${getProjectStatusColor(project.project_status_detail).text}`}>
                        {getProjectStatusLabel(project.project_status, project.project_status_detail)}
                      </span>
                    )}

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
                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={project.slug ? `/${project.slug}` : `#`} className="hover:text-gold transition-colors">
                      <h3 className="heading-font text-sm font-bold text-ink leading-snug">
                        {project.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
                      <MapPin size={12} className="shrink-0 text-muted/70" />
                      <span>{project.location}</span>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-muted">{project.type}</p>

                    <p className="text-[11px] text-muted mt-1.5 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mt-auto pt-3">
                      <Button
                        href={project.slug ? `/${project.slug}` : `#`}
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
        )}

        {/* Mobile "see all" link */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="#tat-ca-du-an"
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
