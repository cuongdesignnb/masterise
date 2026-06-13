"use client";

import React from "react";
import { regions } from "@/data/projectsSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { MapPin } from "lucide-react";

export default function ProjectsByRegion() {
  return (
    <section className="py-10">
      <Container>
        <MotionWrapper>
          <div className="mb-6">
            <span className="uppercase text-[11px] font-bold tracking-wider text-gold">
              DỰ ÁN THEO KHU VỰC
            </span>
          </div>
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <div className="bg-white rounded-[18px] border border-line/50 overflow-hidden shadow-[0_12px_40px_rgba(87,61,28,0.06)]">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Stylized Map */}
              <div className="bg-ivory p-6 lg:p-8 min-h-[260px] relative flex items-center justify-center">
                <svg
                  viewBox="0 0 200 400"
                  className="w-auto h-[220px] opacity-80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Simplified Vietnam outline */}
                  <path
                    d="M100 10 C85 30, 75 50, 80 70 C85 90, 95 100, 90 120 C85 140, 70 155, 75 175 C80 195, 95 200, 90 220 C85 240, 70 250, 75 270 C80 290, 95 300, 100 320 C105 340, 95 355, 100 370 C105 380, 110 385, 108 390"
                    stroke="#E8DCCB"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M100 10 C115 30, 125 45, 120 70 C115 90, 105 100, 110 120 C115 140, 130 155, 125 175 C120 195, 105 200, 110 220 C115 240, 130 250, 125 270 C120 290, 105 300, 100 320 C95 340, 105 355, 100 370"
                    stroke="#E8DCCB"
                    strokeWidth="2"
                    fill="none"
                  />
                  {/* Fill area */}
                  <path
                    d="M100 10 C85 30, 75 50, 80 70 C85 90, 95 100, 90 120 C85 140, 70 155, 75 175 C80 195, 95 200, 90 220 C85 240, 70 250, 75 270 C80 290, 95 300, 100 320 C105 340, 95 355, 100 370 C105 355, 115 340, 100 320 C95 300, 120 290, 125 270 C130 250, 115 240, 110 220 C105 200, 120 195, 125 175 C130 155, 115 140, 110 120 C105 100, 115 90, 120 70 C125 45, 115 30, 100 10Z"
                    fill="#F6EFE4"
                    opacity="0.6"
                  />

                  {/* Markers */}
                  {/* Hanoi */}
                  <circle cx="95" cy="55" r="5" fill="#B88746" />
                  <circle cx="95" cy="55" r="8" fill="none" stroke="#B88746" strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Da Nang */}
                  <circle cx="110" cy="175" r="4" fill="#B88746" />
                  <circle cx="110" cy="175" r="7" fill="none" stroke="#B88746" strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values="7;12;7" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                  </circle>

                  {/* Khanh Hoa */}
                  <circle cx="115" cy="250" r="4" fill="#B88746" />

                  {/* HCM */}
                  <circle cx="90" cy="320" r="6" fill="#B88746" />
                  <circle cx="90" cy="320" r="10" fill="none" stroke="#B88746" strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Phu Quoc */}
                  <circle cx="55" cy="345" r="4" fill="#B88746" />
                </svg>
              </div>

              {/* Right: Region List */}
              <div className="p-6 lg:p-8">
                <div className="space-y-0">
                  {regions.map((region, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3 border-b border-line/20 last:border-0 hover:bg-beige/30 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-sm text-ink">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        {region.name}
                      </span>
                      <span className="heading-font text-base font-bold text-gold">
                        {region.count}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-gold text-xs font-semibold mt-4 hover:text-gold-dark transition-colors"
                >
                  Xem tất cả khu vực →
                </a>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
