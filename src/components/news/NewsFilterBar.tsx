"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Building2,
  TrendingUp,
  Heart,
  Scale,
  Compass,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Container from "@/components/Container";
import type { PostCategory } from "@/types/api";

/* Map category labels to lucide icon components */
const categoryIconMap: Record<string, LucideIcon> = {
  "Tin dự án": Building2,
  "Thị trường": TrendingUp,
  "Phong cách sống": Heart,
  "Pháp lý": Scale,
  "Kiến trúc": Compass,
};

export default function NewsFilterBar({ categories }: { categories: PostCategory[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const categoryQuery = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("q") || "";
  const sortQuery = searchParams.get("sort") || "latest";

  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Sync state with URL parameter if it changes externally
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Debounced search query update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm === searchQuery) return;
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, searchQuery, searchParams, pathname, router]);

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "latest") params.delete("sort");
    else params.set("sort", sort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="py-6 bg-cream">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* ── Search input ── */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bài viết, chủ đề, dự án..."
                className="w-full bg-white border border-line/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition"
              />
            </div>

            {/* ── Category chips ── */}
            <div className="flex-1 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-2 min-w-max">
                {/* Chip: All */}
                <button
                  onClick={() => handleCategoryClick("all")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    categoryQuery === "all"
                      ? "gold-gradient text-white shadow-sm"
                      : "bg-white border border-line/60 text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  Tất cả
                </button>

                {/* Dynamic Category Chips */}
                {categories.map((cat) => {
                  const isActive = categoryQuery === cat.slug;
                  const IconComponent = categoryIconMap[cat.name];
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "gold-gradient text-white shadow-sm"
                          : "bg-white border border-line/60 text-muted hover:border-gold hover:text-gold"
                      }`}
                    >
                      {IconComponent && <IconComponent size={13} />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Sort dropdown ── */}
            <div className="relative shrink-0">
              <select value={sortQuery} onChange={(event) => handleSortChange(event.target.value)} aria-label="Sắp xếp bài viết" className="appearance-none rounded-xl border border-line/60 bg-white px-4 py-2.5 pr-9 text-xs font-semibold text-muted outline-none transition hover:border-gold hover:text-gold">
                <option value="latest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Tên A–Z</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
        </div>
      </Container>
    </section>
  );
}
