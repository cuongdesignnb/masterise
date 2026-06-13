"use client";

import { supportDepartments } from "@/data/contactSeed";
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

const deptIconMap: Record<string, LucideIcon> = {
  Building2,
  Headphones,
  Megaphone,
};

export default function SupportDepartments() {
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
          {supportDepartments.map((dept, idx) => {
            const IconComponent = deptIconMap[dept.icon] ?? Building2;

            return (
              <MotionWrapper key={idx} delay={0.08 * idx}>
                <div className="bg-white rounded-[18px] border border-line/50 p-6 hover:-translate-y-1 hover:shadow-soft transition-all">
                  {/* Icon */}
                  <IconComponent className="w-9 h-9 text-gold mb-3" />

                  {/* Title */}
                  <h3 className="text-sm font-bold text-ink">{dept.title}</h3>

                  {/* Description */}
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-line/30 my-3" />

                  {/* Phone */}
                  <div className="flex items-center gap-2 mt-2">
                    <PhoneCall className="w-3.5 h-3.5 text-gold" />
                    <span className="text-xs text-ink">{dept.phone}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    <span className="text-xs text-muted">{dept.email}</span>
                  </div>

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
