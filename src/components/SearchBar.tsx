"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Building2, Home, Sliders, ShieldCheck, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Button from "./Button";
import { PROJECT_STATUS_OPTIONS } from "@/lib/projectStatus";
import { projectService } from "@/services/projectService";

const filterOptions = {
  location: {
    icon: MapPin,
    label: "Vị trí",
    placeholder: "Chọn khu vực",
    options: ["Tất cả khu vực", "TP. Thủ Đức", "Quận 1", "Quận 2", "Bình Thạnh", "Nhà Bè", "Tây Hồ, Hà Nội", "Ocean Park, Hà Nội"],
  },
  price: {
    icon: Building2,
    label: "Khoảng giá",
    placeholder: "Chọn khoảng giá",
    options: ["Tất cả khoảng giá", "Dưới 5 tỷ", "Từ 5 - 10 tỷ", "Từ 10 - 20 tỷ", "Từ 20 - 50 tỷ", "Trên 50 tỷ"],
  },
  type: {
    icon: Home,
    label: "Loại hình",
    placeholder: "Chọn loại hình",
    options: ["Tất cả loại hình"],
  },
  status: {
    icon: Sliders,
    label: "Trạng thái",
    placeholder: "Tất cả dự án",
    options: ["Tất cả trạng thái", ...PROJECT_STATUS_OPTIONS.map((option) => option.label)],
  },
  area: {
    icon: ShieldCheck,
    label: "Diện tích",
    placeholder: "Chọn diện tích",
    options: ["Tất cả diện tích", "Dưới 50 m²", "Từ 50 - 100 m²", "Từ 100 - 150 m²", "Trên 150 m²"],
  },
};

export default function SearchBar() {
  const router = useRouter();
  const { data: projectTypeOptions = [] } = useQuery({
    queryKey: ["public-project-categories"],
    queryFn: projectService.getProjectCategories,
    staleTime: 5 * 60 * 1000,
  });
  const resolvedFilterOptions = {
    ...filterOptions,
    type: {
      ...filterOptions.type,
      options: ["Tất cả loại hình", ...projectTypeOptions.map((option) => option.name)],
    },
  };
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({
    location: "",
    price: "",
    type: "",
    status: "",
    area: "",
  });

  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key: string) => {
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(key);
    }
  };

  const handleSelect = (key: string, option: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [key]: option === `Tất cả ${filterOptions[key as keyof typeof filterOptions].label.toLowerCase()}` || option.includes("Tất cả") ? "" : option,
    }));
    setActiveDropdown(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 -mt-16 sm:-mt-20 md:-mt-24 px-4 max-w-7xl mx-auto w-full"
      ref={barRef}
    >
      <div className="bg-white border border-line rounded-xl shadow-luxury p-5 md:p-6 lg:py-6 lg:px-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-5 lg:gap-4 items-center">
          
          {/* Filters List */}
          {Object.entries(resolvedFilterOptions).map(([key, filter]) => {
            const Icon = filter.icon;
            const isSelected = !!selectedValues[key];
            const displayValue = selectedValues[key] || filter.placeholder;

            return (
              <div key={key} className="relative w-full border-b sm:border-b-0 sm:border-r border-line/60 last:border-0 pr-0 sm:pr-4 last:pr-0">
                <button
                  type="button"
                  onClick={() => toggleDropdown(key)}
                  className="w-full text-left group flex items-center justify-between cursor-pointer focus:outline-none py-1 sm:py-0"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center text-muted group-hover:text-gold transition-colors duration-300">
                      <Icon size={16} className="transition-colors group-hover:text-gold text-muted" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider block">
                        {filter.label}
                      </span>
                      <span className={`text-xs sm:text-sm mt-0.5 block truncate font-medium ${isSelected ? "text-ink font-semibold" : "text-muted"}`}>
                        {displayValue}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-muted/65 group-hover:text-gold transition-transform duration-300 mr-1 ${
                      activeDropdown === key ? "rotate-180 text-gold" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 top-[105%] mt-2 bg-white border border-line rounded-xl shadow-luxury max-h-56 overflow-y-auto z-30 py-2 hide-scrollbar"
                    >
                      {filter.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelect(key, option)}
                          className={`w-full text-left px-4 py-2 text-xs sm:text-sm text-ink hover:bg-beige/40 transition-colors ${
                            selectedValues[key] === option || (!selectedValues[key] && option.includes("Tất cả"))
                              ? "text-gold font-semibold bg-beige/25"
                              : ""
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Search Button */}
          <div className="sm:col-span-2 lg:col-span-5 xl:col-span-1 flex items-center justify-end w-full">
            <Button
              onClick={() => {
                const queryParams: string[] = [];
                
                if (selectedValues.location) {
                  queryParams.push(`q=${encodeURIComponent(selectedValues.location)}`);
                }
                
                if (selectedValues.price) {
                  const pr = selectedValues.price;
                  if (pr === "Dưới 5 tỷ") {
                    queryParams.push("price_max=75000000");
                  } else if (pr === "Từ 5 - 10 tỷ") {
                    queryParams.push("price_min=60000000");
                    queryParams.push("price_max=120000000");
                  } else if (pr === "Từ 10 - 20 tỷ") {
                    queryParams.push("price_min=100000000");
                    queryParams.push("price_max=200000000");
                  } else if (pr === "Từ 20 - 50 tỷ") {
                    queryParams.push("price_min=200000000");
                    queryParams.push("price_max=400000000");
                  } else if (pr === "Trên 50 tỷ") {
                    queryParams.push("price_min=300000000");
                  }
                }
                
                if (selectedValues.type) {
                  const selectedType = projectTypeOptions.find((option) => option.name === selectedValues.type);
                  if (selectedType) queryParams.push(`category=${encodeURIComponent(selectedType.slug)}`);
                }
                
                if (selectedValues.status) {
                  const st = selectedValues.status;
                  const projectStatus = PROJECT_STATUS_OPTIONS.find((option) => option.label === st)?.value;
                  if (projectStatus) queryParams.push(`project_status=${projectStatus}`);
                }
                
                const searchString = queryParams.join("&");
                router.push(`/du-an?${searchString}`);
              }}
              variant="solid"
              size="md"
              className="w-full xl:w-auto h-11 font-semibold tracking-wider bg-gold text-white rounded-[4px]"
              icon={<Search size={14} />}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
