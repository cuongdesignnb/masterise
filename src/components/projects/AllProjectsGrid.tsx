"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { mapApiProjectToProjectCard } from "@/adapters/projectAdapter";
import { ArrowLeft, ArrowRight, MapPin, Heart, ChevronDown } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { getProjectMarketingLabel, getProjectStatusLabel, getProjectStatusColor } from "@/lib/projectStatus";
import type { ApiResponse, Project, ProjectCategoryOption } from "@/types/api";

const sortOptions = [
  { value: "latest", label: "Mới nhất", sortBy: "created_at", sortOrder: "desc" },
  { value: "manual", label: "Thứ tự admin", sortBy: "sort_order", sortOrder: "asc" },
  { value: "opening", label: "Mở bán gần nhất", sortBy: "open_sale_at", sortOrder: "asc" },
  { value: "price_asc", label: "Giá thấp đến cao", sortBy: "price_min", sortOrder: "asc" },
  { value: "price_desc", label: "Giá cao đến thấp", sortBy: "price_min", sortOrder: "desc" },
  { value: "name_asc", label: "Tên A-Z", sortBy: "name", sortOrder: "asc" },
] as const;

interface AllProjectsGridProps {
  initialResponse?: ApiResponse<Project[]> | null;
  initialQuery?: string;
  initialCategories?: ProjectCategoryOption[];
}

export default function AllProjectsGrid({ initialResponse = null, initialQuery = "", initialCategories = [] }: AllProjectsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sortValue, setSortValue] = useState<(typeof sortOptions)[number]["value"]>("latest");
  const activeSort = sortOptions.find((option) => option.value === sortValue) || sortOptions[0];

  // Read search query parameters
  const q = searchParams.get("q") || "";
  const region = searchParams.get("region") || "";
  const category = searchParams.get("category") || "";
  const projectStatus = searchParams.get("project_status") || "";
  const priceRange = searchParams.get("price_range") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);

  const queryParams: Record<string, string> = {};
  if (q) queryParams.q = q;
  if (region) queryParams.region = region;
  if (category) queryParams.category = category;
  if (projectStatus) queryParams.project_status = projectStatus;
  if (priceRange) queryParams.price_range = priceRange;
  queryParams.sort_by = activeSort.sortBy;
  queryParams.sort_order = activeSort.sortOrder;
  queryParams.per_page = "12";
  queryParams.page = String(page);
  const querySignature = new URLSearchParams(queryParams).toString();

  const { data: response, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["all-projects-grid", queryParams],
    queryFn: () => projectService.getProjectPage(queryParams),
    initialData: initialResponse && querySignature === initialQuery ? initialResponse : undefined,
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
  const { data: categoryOptions = initialCategories } = useQuery({
    queryKey: ["public-project-categories"],
    queryFn: projectService.getProjectCategories,
    staleTime: 5 * 60 * 1000,
    initialData: initialCategories,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const selectedCategoryName = categoryOptions.find((option) => option.slug === category)?.name;
  const projects = response?.data || [];
  const meta = response?.meta || { current_page: page, last_page: 1, per_page: 12, total: projects.length };
  const projectCards = projects.map(mapApiProjectToProjectCard);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    router.push(`${pathname}${params.size ? `?${params}` : ""}#tat-ca-du-an`);
  };

  return (
    <section id="tat-ca-du-an" className="scroll-mt-24 py-10">
      <Container>
        {/* Header */}
        <MotionWrapper>
          <div className="mb-6">
            <span className="uppercase text-[11px] font-bold tracking-wider text-gold">
              TẤT CẢ DỰ ÁN
            </span>
          </div>
        </MotionWrapper>

        {/* Sort */}
        <MotionWrapper delay={0.05}>
          <div className="flex justify-end mb-6">
            <label className="relative inline-flex items-center text-xs text-muted bg-white border border-line/50 rounded-xl hover:border-gold transition">
              <span className="sr-only">Sắp xếp dự án</span>
              <select
                value={sortValue}
                onChange={(event) => setSortValue(event.target.value as typeof sortValue)}
                className="appearance-none bg-transparent py-2 pl-3 pr-8 text-xs font-semibold text-muted focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sắp xếp: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5" />
            </label>
          </div>
        </MotionWrapper>

        {/* Loading / Error / Empty States */}
        {isLoading && <LoadingState message="Đang tải danh sách toàn bộ dự án..." />}
        
        {error && (
          <ErrorState
            message="Không thể kết nối máy chủ để tải toàn bộ dự án."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && projectCards.length === 0 && (
          <EmptyState
            title="Không tìm thấy dự án nào"
            description={selectedCategoryName
              ? `Không tìm thấy dự án thuộc loại hình “${selectedCategoryName}”.`
              : "Không tìm thấy dự án phù hợp với bộ lọc hiện tại."}
          />
        )}

        {/* Grid */}
        {!isLoading && !error && projectCards.length > 0 && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
            {projectCards.map((project, idx) => {
              const marketingLabel = getProjectMarketingLabel(project.project_label, project.project_status, project.project_status_detail);
              const statusColor = getProjectStatusColor(project.project_status_detail);
              return (
              <MotionWrapper key={project.id} delay={0.06 * idx}>
                <div className="bg-white rounded-[16px] border border-line/50 overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(87,61,28,0.08)] transition-all duration-300 group">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Link href={project.slug ? `/${project.slug}` : `#`}>
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Link>
                    <div className="absolute left-3 top-3 flex max-w-[70%] flex-col items-start gap-1.5">
                      {marketingLabel && (
                        <span className="max-w-full truncate rounded-full bg-[#6F5436]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                          {marketingLabel}
                        </span>
                      )}
                      {project.badge && project.badge !== marketingLabel && (
                        <span className="rounded-full gold-gradient px-2.5 py-1 text-[9px] font-bold uppercase text-white">
                          {project.badge}
                        </span>
                      )}
                    </div>
                    {project.project_status && (
                      <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${statusColor.bg} ${statusColor.text}`}>
                        {getProjectStatusLabel(project.project_status, project.project_status_detail)}
                      </span>
                    )}
                    {/* Heart */}
                    <button className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition cursor-pointer">
                      <Heart className="w-3.5 h-3.5 text-muted" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={project.slug ? `/${project.slug}` : `#`} className="hover:text-gold transition-colors">
                      <h3 className="heading-font text-sm font-bold text-ink">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="flex items-center gap-1 text-[11px] text-muted mt-1">
                      <MapPin className="w-3 h-3 text-gold" />
                      {project.location}
                    </p>
                    <p className="text-[10px] text-muted mt-1">{project.type}</p>
                    <Button
                      href={project.slug ? `/${project.slug}` : `#`}
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
              );
            })}
          </div>
        )}

        {!isLoading && !error && meta.last_page > 1 && (
          <nav aria-label="Project pagination" className="mt-8 flex items-center justify-center gap-2">
            <button type="button" disabled={meta.current_page <= 1 || isFetching} onClick={() => goToPage(meta.current_page - 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-bold disabled:opacity-40">
              <ArrowLeft size={13} />Trang trước
            </button>
            <span className="px-3 text-xs font-semibold text-muted">{meta.current_page}/{meta.last_page}</span>
            <button type="button" disabled={meta.current_page >= meta.last_page || isFetching} onClick={() => goToPage(meta.current_page + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-bold disabled:opacity-40">
              Trang sau<ArrowRight size={13} />
            </button>
          </nav>
        )}
      </Container>
    </section>
  );
}
