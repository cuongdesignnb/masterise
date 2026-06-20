"use client";

import React from "react";
import { Eye, Target } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Eye,
  Target,
};

export default function AboutVisionMission() {
  const { aboutVision, aboutMission } = useSiteSettings();

  const visionMissionData = [
    {
      label: "TẦM NHÌN",
      title: "Trở thành nhà phát triển bất động sản hàng hiệu hàng đầu Đông Nam Á.",
      description: aboutVision,
      icon: "Eye",
    },
    {
      label: "SỨ MỆNH",
      title: "Nâng tầm giá trị sống, phát triển bền vững và tạo dựng cộng đồng thịnh vượng.",
      description: aboutMission,
      icon: "Target",
    },
  ];

  return (
    <section className="py-16 sm:py-20 soft-section-bg">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {visionMissionData.map((item, idx) => {
            const Icon = iconMap[item.icon];
            return (
              <MotionWrapper key={idx} delay={idx * 0.12}>
                <div className="bg-white rounded-[22px] border border-line/60 shadow-soft p-6 sm:p-8 h-full flex flex-col">
                  {/* Label */}
                  <span className="text-[10px] sm:text-xs font-bold tracking-[0.18em] text-gold uppercase">
                    {item.label}
                  </span>

                  {/* Icon */}
                  {Icon && (
                    <div className="mt-4">
                      <Icon size={32} className="text-gold" />
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="mt-4 text-xl sm:text-2xl heading-font font-bold text-ink leading-snug">
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 text-sm text-muted leading-relaxed font-light flex-grow font-sans">
                    {item.description}
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
