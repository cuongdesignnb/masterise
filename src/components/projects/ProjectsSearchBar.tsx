"use client";

import React, { useState } from "react";
import { projectFilters } from "@/data/projectsSeed";
import { Search, ChevronDown } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

export default function ProjectsSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="py-6">
      <Container>
        <MotionWrapper>
          <div className="bg-white rounded-[18px] border border-line/60 p-4 lg:p-5 shadow-[0_8px_30px_rgba(87,61,28,0.05)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
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

              {/* Filter dropdowns */}
              {projectFilters.map((filter, idx) => (
                <div key={idx} className="relative">
                  <select
                    className="w-full appearance-none bg-ivory border border-line/50 rounded-xl px-4 py-2.5 text-sm text-muted cursor-pointer focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors pr-9"
                    defaultValue=""
                  >
                    <option value="">{filter.placeholder}</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none"
                  />
                </div>
              ))}

              {/* Search button */}
              <button className="gold-gradient text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
                <Search size={14} />
                Tìm kiếm
              </button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
