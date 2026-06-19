"use client";

import React from "react";
import { PhoneCall, Mail, MapPin, Clock3, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";

const infoIconMap: Record<string, LucideIcon> = {
  PhoneCall,
  Mail,
  MapPin,
  Clock3,
};

export default function ContactInfoCards() {
  const { hotline, email, companyAddress } = useSiteSettings();

  const cards = [
    {
      title: "Hotline",
      value: hotline || "Đang cập nhật",
      description: "Hỗ trợ 24/7",
      icon: "PhoneCall",
    },
    {
      title: "Email",
      value: email || "Đang cập nhật",
      description: "Phản hồi trong 24h",
      icon: "Mail",
    },
    {
      title: "Văn phòng",
      value: companyAddress || "Đang cập nhật",
      description: "Xem bản đồ",
      icon: "MapPin",
    },
    {
      title: "Giờ làm việc",
      value: "Thứ 2 – Chủ nhật",
      description: "08:30 – 18:00",
      icon: "Clock3",
    },
  ];
  return (
    <section className="py-8">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = infoIconMap[card.icon] ?? PhoneCall;
            const isAddress = card.icon === "MapPin";
            const isMap = card.description === "Xem bản đồ";

            return (
              <MotionWrapper key={card.title} delay={i * 0.08}>
                <div className="bg-white rounded-[18px] border border-line/50 p-5 hover:-translate-y-1 hover:shadow-soft transition-all duration-300 h-full">
                  {/* Icon */}
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-beige/50">
                    <Icon className="w-5 h-5 text-gold" />
                  </span>

                  {/* Title */}
                  <p className="text-[10px] uppercase tracking-wider text-muted mt-3">
                    {card.title}
                  </p>

                  {/* Value */}
                  <p
                    className={`font-bold text-ink mt-1 ${
                      isAddress ? "text-xs" : "text-sm"
                    }`}
                  >
                    {card.value}
                  </p>

                  {/* Description / Link */}
                  <p className="text-[11px] text-gold mt-1 flex items-center gap-1">
                    {card.description}
                    {isMap && <ArrowRight className="w-3 h-3" />}
                  </p>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
