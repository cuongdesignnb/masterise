"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
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

  const scrollToProject = useCallback((index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const slides = Array.from(slider.children) as HTMLElement[];
    const target = slides[index];
    if (!target) return;

    const left = target.offsetLeft - (slider.clientWidth - target.clientWidth) / 2;
    slider.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    setActiveProjectIndex(index);
  }, []);

  const scrollProjects = (direction: -1 | 1) => {
    const nextIndex = Math.min(
      projects.length - 1,
      Math.max(0, activeProjectIndex + direction),
    );
    scrollToProject(nextIndex);
  };

  const syncActiveProject = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const slides = Array.from(slider.children) as HTMLElement[];
    if (!slides.length) return;

    const viewportCenter = slider.scrollLeft + slider.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveProjectIndex(closestIndex);
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
                disabled={activeProjectIndex === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Xem dự án phía trước"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollProjects(1)}
                disabled={activeProjectIndex === projects.length - 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
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
            onScroll={syncActiveProject}
            className="hide-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5 lg:pb-4"
            aria-label="Danh mục dự án tiêu biểu"
            aria-roledescription="carousel"
          >
            {projects.map((project, idx) => (
              <MotionWrapper
                key={project.id || project.slug || idx}
                delay={0.06 * idx}
                className="w-full shrink-0 snap-center sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-5rem)/5)]"
              >
                <article
                  aria-label={`${project.name}, dự án ${idx + 1} trên ${projects.length}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line/60 bg-white shadow-[0_12px_34px_rgba(87,61,28,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft sm:rounded-[18px] sm:shadow-none"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
                    <Link href={project.slug ? `/${project.slug}` : `#`} className="relative block h-full w-full">
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
                  <div className="flex flex-grow flex-col p-5 sm:p-4">
                    <Link href={project.slug ? `/${project.slug}` : `#`} className="hover:text-gold transition-colors">
                      <h3 className="heading-font text-base font-bold leading-snug text-ink sm:text-sm">
                        {project.name}
                      </h3>
                    </Link>

                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted sm:text-[11px]">
                      <MapPin size={12} className="shrink-0 text-muted/70" />
                      <span>{project.location}</span>
                    </div>

                    <p className="mt-1 text-[11px] font-semibold text-gold/90 sm:text-[10px]">{project.type}</p>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:mt-1.5 sm:text-[11px]">
                      {project.description}
                    </p>

                    <div className="mt-auto pt-3">
                      <Button
                        href={project.slug ? `/${project.slug}` : `#`}
                        variant="outline"
                        size="sm"
                        icon={<ArrowRight size={12} />}
                        iconPosition="right"
                        className="h-11 w-full rounded-xl sm:h-auto sm:rounded-[4px]"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </article>
              </MotionWrapper>
            ))}
          </div>
        )}

        {!isLoading && !error && projects.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4 sm:hidden" aria-label="Điều khiển slide dự án">
            <button
              type="button"
              onClick={() => scrollProjects(-1)}
              disabled={activeProjectIndex === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Dự án trước"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Chọn dự án">
              {projects.map((project, index) => (
                <button
                  key={project.id || project.slug || index}
                  type="button"
                  role="tab"
                  aria-selected={activeProjectIndex === index}
                  aria-label={`Xem dự án ${index + 1}: ${project.name}`}
                  onClick={() => scrollToProject(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeProjectIndex === index ? "w-6 bg-gold" : "w-2 bg-line hover:bg-gold/55"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollProjects(1)}
              disabled={activeProjectIndex === projects.length - 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Dự án tiếp theo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Mobile "see all" link */}
        <div className="mt-6 text-center sm:hidden">
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
