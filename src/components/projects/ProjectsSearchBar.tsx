"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { projectService } from "@/services/projectService";
import { isProjectPriceRange, PROJECT_PRICE_RANGE_OPTIONS } from "@/lib/projectPrice";

const priceOptions = [
  { value: "", label: "Tất cả mức giá" },
  ...PROJECT_PRICE_RANGE_OPTIONS,
];

export default function ProjectsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");
  const {
    data: regionOptions = [],
    isLoading: isRegionsLoading,
    isError: isRegionsError,
  } = useQuery({
    queryKey: ["public-project-regions"],
    queryFn: projectService.getRegions,
    staleTime: 5 * 60 * 1000,
  });
  const {
    data: projectStatusOptions = [],
    isLoading: isStatusesLoading,
    isError: isStatusesError,
  } = useQuery({
    queryKey: ["public-project-statuses"],
    queryFn: projectService.getProjectStatuses,
    staleTime: 5 * 60 * 1000,
  });
  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["public-project-categories"],
    queryFn: projectService.getProjectCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Keep a ref to track if component is mounting to avoid double triggering on first load
  const isMounted = useRef(false);

  // Sync state from search params when they change
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setRegion(searchParams.get("region") || "");
    setCategory(searchParams.get("category") || "");
    
    setStatus(searchParams.get("project_status") || "");

    const priceRange = searchParams.get("price_range") || "";
    setPrice(isProjectPriceRange(priceRange) ? priceRange : "");
    
    isMounted.current = true;
  }, [searchParams]);

  const applyFilters = (updates: {
    q?: string;
    region?: string;
    category?: string;
    status?: string;
    price?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Apply text search
    if (updates.hasOwnProperty("q")) {
      if (updates.q) params.set("q", updates.q);
      else params.delete("q");
    }

    // Apply region
    if (updates.hasOwnProperty("region")) {
      if (updates.region) params.set("region", updates.region);
      else params.delete("region");
    }

    // Apply category
    if (updates.hasOwnProperty("category")) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }

    // Apply the canonical project status and reset pagination.
    if (updates.hasOwnProperty("status")) {
      if (updates.status) {
        params.set("project_status", updates.status);
      } else {
        params.delete("project_status");
      }
    }

    // Apply price
    if (updates.hasOwnProperty("price")) {
      const p = updates.price;
      params.delete("price_min");
      params.delete("price_max");
      if (p && isProjectPriceRange(p)) params.set("price_range", p);
      else params.delete("price_range");
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  // Debounce text search query
  useEffect(() => {
    if (!isMounted.current) return;

    const urlQ = searchParams.get("q") || "";
    if (searchQuery === urlQ) return;

    const delayDebounceFn = setTimeout(() => {
      applyFilters({ q: searchQuery });
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchParams]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: searchQuery });
  };

  const handleRegionChange = (val: string) => {
    setRegion(val);
    applyFilters({ region: val });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    applyFilters({ category: val });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    applyFilters({ status: val });
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    applyFilters({ price: val });
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  return (
    <section className="py-6">
      <Container>
        <MotionWrapper>
          <div className="bg-white rounded-[18px] border border-line/60 p-4 lg:p-5 shadow-[0_8px_30px_rgba(87,61,28,0.05)]">
            <form onSubmit={handleTextSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm dự án, khu vực..."
                  className="w-full bg-ivory border border-line/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
                />
              </div>

              {/* Region Select */}
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full appearance-none bg-ivory border border-line/50 rounded-xl px-4 py-2.5 text-sm text-muted cursor-pointer focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors pr-9 font-medium"
                >
                  <option value="">
                    {isRegionsLoading ? "Đang tải vùng miền..." : isRegionsError ? "Không tải được vùng miền" : "Tất cả vùng miền"}
                  </option>
                  {regionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-ink font-medium">
                      {opt.label} ({opt.projects_count})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none"
                />
              </div>

              {/* Category Select */}
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none bg-ivory border border-line/50 rounded-xl px-4 py-2.5 text-sm text-muted cursor-pointer focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors pr-9 font-medium"
                >
                  <option value="">Tất cả loại hình</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.slug} className="text-ink font-medium">
                      {opt.name} ({opt.projects_count})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none"
                />
              </div>

              {/* Status Select */}
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full appearance-none bg-ivory border border-line/50 rounded-xl px-4 py-2.5 text-sm text-muted cursor-pointer focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors pr-9 font-medium"
                >
                  <option value="">
                    {isStatusesLoading ? "Đang tải trạng thái..." : isStatusesError ? "Không tải được trạng thái" : "Tất cả trạng thái"}
                  </option>
                  {projectStatusOptions.map((opt) => (
                    <option key={opt.id} value={opt.slug} className="text-ink font-medium">
                      {opt.name} ({opt.projects_count})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none"
                />
              </div>

              {/* Price Select */}
              <div className="relative">
                <select
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full appearance-none bg-ivory border border-line/50 rounded-xl px-4 py-2.5 text-sm text-muted cursor-pointer focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors pr-9 font-medium"
                >
                  {priceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-ink font-medium">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-line/60 px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-gold/50 hover:text-gold"
                >
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className="gold-gradient flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Search size={14} />
                  Tìm
                </button>
              </div>
            </form>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
