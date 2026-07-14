"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { mapApiProjectToProjectCard } from "@/adapters/projectAdapter";
import { ArrowRight, MapPin, Heart, ChevronDown } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { getProjectStatusLabel, getProjectStatusColor } from "@/lib/projectStatus";

const sortOptions = [
  { value: "latest", label: "Mới nhất", sortBy: "created_at", sortOrder: "desc" },
  { value: "manual", label: "Thứ tự admin", sortBy: "sort_order", sortOrder: "asc" },
  { value: "opening", label: "Mở bán gần nhất", sortBy: "open_sale_at", sortOrder: "asc" },
  { value: "price_asc", label: "Giá thấp đến cao", sortBy: "price_min", sortOrder: "asc" },
  { value: "price_desc", label: "Giá cao đến thấp", sortBy: "price_min", sortOrder: "desc" },
  { value: "name_asc", label: "Tên A-Z", sortBy: "name", sortOrder: "asc" },
] as const;

export default function AllProjectsGrid() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [sortValue, setSortValue] = useState<(typeof sortOptions)[number]["value"]>("latest");
  const activeSort = sortOptions.find((option) => option.value === sortValue) || sortOptions[0];

  // Read search query parameters
  const q = searchParams.get("q") || "";
  const region = searchParams.get("region") || "";
  const category = searchParams.get("category") || "";
  const projectStatus = searchParams.get("project_status") || "";
  const priceMin = searchParams.get("price_min") || "";
  const priceMax = searchParams.get("price_max") || "";

  const queryParams: Record<string, string> = {};
  if (q) queryParams.q = q;
  if (region) queryParams.region = region;
  if (category) queryParams.category = category;
  if (projectStatus) queryParams.project_status = projectStatus;
  if (priceMin) queryParams.price_min = priceMin;
  if (priceMax) queryParams.price_max = priceMax;
  queryParams.sort_by = activeSort.sortBy;
  queryParams.sort_order = activeSort.sortOrder;
  queryParams.per_page = "100";

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["all-projects-grid", queryParams],
    queryFn: async () => {
      return await projectService.getProjects(queryParams);
    },
  });

  const labelTabs = useMemo(() => {
    const labels = Array.from(new Set(
      projects
        .map((project) => project.project_label?.trim())
        .filter((label): label is string => Boolean(label))
    ));

    return ["Tất cả", ...labels];
  }, [projects]);

  useEffect(() => {
    if (!labelTabs.includes(activeTab)) {
      setActiveTab("Tất cả");
    }
  }, [activeTab, labelTabs]);

  const filteredProjects = projects
    .filter(project => activeTab === "Tất cả" || project.project_label?.trim() === activeTab)
    .map(mapApiProjectToProjectCard);

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

        {/* Tabs + Sort */}
        <MotionWrapper delay={0.05}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {labelTabs.map((tab) => (
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

        {!isLoading && !error && filteredProjects.length === 0 && (
          <EmptyState
            title="Không tìm thấy dự án nào"
            description={`Chưa có dự án nào thuộc danh mục "${activeTab}" hiển thị.`}
          />
        )}

        {/* Grid */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, idx) => (
              <MotionWrapper key={idx} delay={0.06 * idx}>
                <div className="bg-white rounded-[16px] border border-line/50 overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(87,61,28,0.08)] transition-all duration-300 group">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Link href={project.slug ? `/du-an/${project.slug}` : `#`}>
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Link>
                    {/* Badge */}
                    {project.badge && (
                      <span className="absolute top-3 left-3 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full gold-gradient">
                        {project.badge}
                      </span>
                    )}
                    {/* Sales Status Badge */}
                    {project.project_status && (
                      <span className={`absolute top-3 ${project.badge ? 'left-16' : 'left-3'} text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${getProjectStatusColor(project.project_status).bg} ${getProjectStatusColor(project.project_status).text}`}>
                        {getProjectStatusLabel(project.project_status)}
                      </span>
                    )}
                    {/* Heart */}
                    <button className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition cursor-pointer">
                      <Heart className="w-3.5 h-3.5 text-muted" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={project.slug ? `/du-an/${project.slug}` : `#`} className="hover:text-gold transition-colors">
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
                      href={project.slug ? `/du-an/${project.slug}` : `#`}
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
        )}
      </Container>
    </section>
  );
}
