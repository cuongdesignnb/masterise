"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { mapApiProjectToProjectCard } from "@/adapters/projectAdapter";
import { projectTabs } from "@/data/projectsSeed";
import { ArrowRight, MapPin, Heart, ChevronDown } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { getSalesStatusLabel, getSalesStatusColor } from "@/lib/salesStatus";

export default function AllProjectsGrid() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Tất cả");

  // Read search query parameters
  const q = searchParams.get("q") || "";
  const region = searchParams.get("region") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const salesStatus = searchParams.get("sales_status") || "";
  const priceMin = searchParams.get("price_min") || "";
  const priceMax = searchParams.get("price_max") || "";

  const queryParams: Record<string, string> = {};
  if (q) queryParams.q = q;
  if (region) queryParams.region = region;
  if (category) queryParams.category = category;
  if (status) queryParams.status = status;
  if (salesStatus) queryParams.sales_status = salesStatus;
  if (priceMin) queryParams.price_min = priceMin;
  if (priceMax) queryParams.price_max = priceMax;
  queryParams.sort_by = "open_sale_at";
  queryParams.sort_order = "asc";

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["all-projects-grid", queryParams],
    queryFn: async () => {
      return await projectService.getProjects(queryParams);
    },
  });

  const filteredProjects = projects.filter(project => {
    if (activeTab === "Tất cả") return true;
    
    const categories = project.categories || [];
    const catNames = categories.map(c => c.name.toLowerCase());
    
    if (activeTab === "Căn hộ") {
      return catNames.some(name => name.includes("căn hộ"));
    }
    if (activeTab === "Biệt thự") {
      return catNames.some(name => name.includes("biệt thự") || name.includes("dinh thự"));
    }
    if (activeTab === "Shophouse") {
      return catNames.some(name => name.includes("shophouse") || name.includes("thương mại"));
    }
    if (activeTab === "Branded Residences") {
      return catNames.some(name => name.includes("branded") || name.includes("residences") || name.includes("marriott"));
    }
    if (activeTab === "Nghỉ dưỡng") {
      return catNames.some(name => name.includes("nghỉ dưỡng") || name.includes("resort"));
    }
    return true;
  }).map(mapApiProjectToProjectCard);

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
                    {(project as any).sales_status && (
                      <span className={`absolute top-3 ${project.badge ? 'left-16' : 'left-3'} text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${getSalesStatusColor((project as any).sales_status).bg} ${getSalesStatusColor((project as any).sales_status).text}`}>
                        {getSalesStatusLabel((project as any).sales_status)}
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
