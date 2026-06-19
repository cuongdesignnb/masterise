"use client";

import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import {
  Building2,
  Headphones,
  Megaphone,
  PhoneCall,
  Mail,
  Clock3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import type { ContactDepartment } from "@/providers/SiteSettingsProvider";

const deptIconMap: Record<string, LucideIcon> = {
  Building2,
  Headphones,
  Megaphone,
};

// Fallback data khi admin chưa nhập phòng ban
const fallbackDepartments: (ContactDepartment & { description: string; time: string; icon: string })[] = [
  {
    name: "Phòng Kinh doanh",
    description: "Tư vấn thông tin dự án, bảng giá, chính sách bán hàng và hỗ trợ đặt chỗ ưu tiên cho khách hàng.",
    phone: "",
    email: "",
    time: "T2 – T7 | 08:00 – 20:00",
    icon: "Building2",
  },
  {
    name: "Chăm sóc khách hàng",
    description: "Hỗ trợ thông tin, giải đáp thắc mắc và chăm sóc sau mua.",
    phone: "",
    email: "",
    time: "08:30 – 18:00 (Thứ 2 – Chủ nhật)",
    icon: "Headphones",
  },
  {
    name: "Hợp tác & Truyền thông",
    description: "Hợp tác chiến lược, truyền thông và các đề xuất hợp tác.",
    phone: "",
    email: "",
    time: "08:30 – 18:00 (Thứ 2 – Thứ 6)",
    icon: "Megaphone",
  },
];

const defaultDescriptions: Record<string, string> = {
  "Phòng Kinh doanh": "Tư vấn thông tin dự án, bảng giá, chính sách bán hàng và hỗ trợ đặt chỗ ưu tiên cho khách hàng.",
  "Chăm sóc khách hàng": "Hỗ trợ thông tin, giải đáp thắc mắc và chăm sóc sau mua.",
  "Hợp tác & Truyền thông": "Hợp tác chiến lược, truyền thông và các đề xuất hợp tác.",
};

const defaultTimes: Record<string, string> = {
  "Phòng Kinh doanh": "T2 – T7 | 08:00 – 20:00",
  "Chăm sóc khách hàng": "08:30 – 18:00 (Thứ 2 – Chủ nhật)",
  "Hợp tác & Truyền thông": "08:30 – 18:00 (Thứ 2 – Thứ 6)",
};

const defaultIcons: Record<string, string> = {
  "Phòng Kinh doanh": "Building2",
  "Chăm sóc khách hàng": "Headphones",
  "Hợp tác & Truyền thông": "Megaphone",
};

export default function SupportDepartments() {
  const { contactDepartments } = useSiteSettings();

  // Use API data if available, fallback to defaults
  const departments = contactDepartments.length > 0
    ? contactDepartments.map((dept, idx) => ({
        ...dept,
        description: dept.description || defaultDescriptions[dept.name] || "Hỗ trợ khách hàng",
        time: dept.time || defaultTimes[dept.name] || "08:30 – 18:00",
        icon: dept.icon || defaultIcons[dept.name] || Object.keys(deptIconMap)[idx % 3] || "Building2",
      }))
    : fallbackDepartments;

  if (departments.every(d => !d.phone && !d.email)) {
    return null; // Don't render if no contact info available
  }

  return (
    <section className="py-10">
      <Container>
        {/* ── Section header ────────────────────────── */}
        <MotionWrapper>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-5 h-[2px] bg-gold" />
            <h2 className="heading-font font-bold text-ink text-lg">
              Phòng ban hỗ trợ
            </h2>
          </div>
        </MotionWrapper>

        {/* ── Department cards grid ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, idx) => {
            const IconComponent = deptIconMap[dept.icon] ?? Building2;

            return (
              <MotionWrapper key={idx} delay={0.08 * idx}>
                <div className="bg-white rounded-[18px] border border-line/50 p-6 hover:-translate-y-1 hover:shadow-soft transition-all">
                  {/* Icon */}
                  <IconComponent className="w-9 h-9 text-gold mb-3" />

                  {/* Title */}
                  <h3 className="text-sm font-bold text-ink">{dept.name}</h3>

                  {/* Description */}
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-line/30 my-3" />

                  {/* Phone */}
                  {dept.phone && (
                    <div className="flex items-center gap-2 mt-2">
                      <PhoneCall className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs text-ink">{dept.phone}</span>
                    </div>
                  )}

                  {/* Email */}
                  {dept.email && (
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs text-muted">{dept.email}</span>
                    </div>
                  )}

                  {/* Working hours */}
                  <div className="flex items-center gap-2 mt-2">
                    <Clock3 className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[10px] text-muted">{dept.time}</span>
                  </div>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
