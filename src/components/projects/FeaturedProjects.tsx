"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Heart, Star } from "lucide-react";
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

export default function FeaturedProjects() {
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["projects-page-featured"],
    queryFn: async () => {
      const data = await projectService.getFeaturedProjects();
      return data.map(mapApiProjectToProjectCard);
    },
  });

  useEffect(() => {
    if (window.location.hash !== "#du-an-noi-bat") return;
    const timeout = window.setTimeout(() => {
      document.getElementById("du-an-noi-bat")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, []);

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
            <Link
              href="#tat-ca-du-an"
              className="hidden sm:inline-flex items-center gap-1 text-gold text-xs font-semibold hover:text-gold-dark transition-colors"
            >
              Xem tất cả dự án
              <ArrowRight size={13} />
            </Link>
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

        {/* Projects grid */}
        {!isLoading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {projects.map((project, idx) => (
              <MotionWrapper key={idx} delay={0.06 * idx}>
                <div className="bg-white rounded-[18px] border border-line/50 overflow-hidden hover:-translate-y-1.5 hover:shadow-soft transition-all duration-300 group h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Link href={project.slug ? `/du-an/${project.slug}` : `#`}>
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
                    <Link href={project.slug ? `/du-an/${project.slug}` : `#`} className="hover:text-gold transition-colors">
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
                        href={project.slug ? `/du-an/${project.slug}` : `#`}
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
