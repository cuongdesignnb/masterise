"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { projectService } from "@/services/projectService";
import type { RegionOption } from "@/types/api";
import { PROJECT_STATUS_OPTIONS } from "@/lib/projectStatus";

const categoryOptions = [
  { value: "", label: "Tất cả loại hình" },
  { value: "can-ho-cao-cap", label: "Căn Hộ Cao Cấp" },
  { value: "biet-thu-dinh-thu", label: "Biệt Thự & Dinh Thự" },
  { value: "shophouse-commercial", label: "Shophouse Thương Mại" },
  { value: "masterise-colletion", label: "Masterise Collection" },
  { value: "lumiere-series", label: "Lumiere Series" },
];

const statusOptions = [{ value: "", label: "Tất cả trạng thái" }, ...PROJECT_STATUS_OPTIONS];

const priceOptions = [
  { value: "", label: "Tất cả mức giá" },
  { value: "under-5", label: "Dưới 5 tỷ" },
  { value: "5-10", label: "Từ 5 - 10 tỷ" },
  { value: "10-20", label: "Từ 10 - 20 tỷ" },
  { value: "20-50", label: "Từ 20 - 50 tỷ" },
  { value: "above-50", label: "Trên 50 tỷ" },
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
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);

  useEffect(() => {
    projectService.getRegions().then(setRegionOptions).catch(() => setRegionOptions([]));
  }, []);

  // Keep a ref to track if component is mounting to avoid double triggering on first load
  const isMounted = useRef(false);

  // Sync state from search params when they change
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setRegion(searchParams.get("region") || "");
    setCategory(searchParams.get("category") || "");
    
    setStatus(searchParams.get("project_status") || "");

    const priceMin = searchParams.get("price_min") || "";
    const priceMax = searchParams.get("price_max") || "";
    let priceVal = "";
    
    if (priceMax === "75000000" || priceMax === "5000000000") {
      priceVal = "under-5";
    } else if ((priceMin === "60000000" && priceMax === "120000000") || (priceMin === "5000000000" && priceMax === "10000000000")) {
      priceVal = "5-10";
    } else if ((priceMin === "100000000" && priceMax === "200000000") || (priceMin === "10000000000" && priceMax === "20000000000")) {
      priceVal = "10-20";
    } else if ((priceMin === "200000000" && priceMax === "400000000") || (priceMin === "20000000000" && priceMax === "50000000000")) {
      priceVal = "20-50";
    } else if (priceMin === "300000000" || priceMin === "50000000000") {
      priceVal = "above-50";
    }
    setPrice(priceVal);
    
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

      if (p === "under-5") {
        params.set("price_max", "75000000");
      } else if (p === "5-10") {
        params.set("price_min", "60000000");
        params.set("price_max", "120000000");
      } else if (p === "10-20") {
        params.set("price_min", "100000000");
        params.set("price_max", "200000000");
      } else if (p === "20-50") {
        params.set("price_min", "200000000");
        params.set("price_max", "400000000");
      } else if (p === "above-50") {
        params.set("price_min", "300000000");
      }
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
                  <option value="">Tất cả vùng miền</option>
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
                  {categoryOptions.map((opt) => (
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

              {/* Status Select */}
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full appearance-none bg-ivory border border-line/50 rounded-xl px-4 py-2.5 text-sm text-muted cursor-pointer focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors pr-9 font-medium"
                >
                  {statusOptions.map((opt) => (
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

              {/* Reset / Search button */}
              <button
                type="submit"
                className="gold-gradient text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Search size={14} />
                Tìm kiếm
              </button>
            </form>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
