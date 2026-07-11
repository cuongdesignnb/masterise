"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { ArrowRight, Check } from "lucide-react";

export default function AboutEcosystem() {
  const { aboutPageCollections, aboutPageEcosystem } = useSiteSettings();

  // Use the collections from site settings, fallback to empty array if not defined
  const collections = aboutPageCollections || [];
  const partners = aboutPageEcosystem?.partners || [];

  return (
    <section className="py-20 md:py-28 bg-[#FAF6F0] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#E8DCCB]/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B88746]/10 rounded-full blur-3xl -z-10" />

      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <MotionWrapper>
            <span className="text-xs font-bold text-[#B88746] tracking-[0.2em] uppercase block mb-3">
              BỘ SƯU TẬP DỰ ÁN
            </span>
          </MotionWrapper>
          <MotionWrapper delay={0.05}>
            <h2 className="heading-font text-3xl md:text-4xl font-bold text-[#1F1B16] leading-tight mb-4">
              Các dòng sản phẩm cốt lõi
            </h2>
          </MotionWrapper>
          <MotionWrapper delay={0.1}>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#B88746] to-transparent mx-auto mb-6" />
          </MotionWrapper>
          <MotionWrapper delay={0.15}>
            <p className="text-sm text-[#8C7A6B] leading-relaxed">
              Masterise Homes không ngừng kiến tạo những không gian sống hàng hiệu xa xỉ, những cộng đồng tinh hoa và biểu tượng kiến trúc duy mỹ qua ba dòng sản phẩm tiêu biểu.
            </p>
          </MotionWrapper>
        </div>

        {/* ── 3 Collections Grid ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-20 md:mb-28">
          {collections.map((item, idx) => (
            <MotionWrapper key={item.id || idx} delay={idx * 0.1}>
              <div className="group h-full flex flex-col rounded-[24px] overflow-hidden bg-white border border-[#E8DCCB]/50 transition-all duration-500 hover:shadow-2xl hover:border-[#B88746]/40 hover:-translate-y-1">
                
                {/* Image Showcase */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Subtle Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full border border-[#E8DCCB]/30 shadow-sm">
                    <span className="text-[10px] font-bold text-[#B88746] tracking-wider uppercase">
                      {item.subtitle || "Masterise"}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="heading-font text-xl font-bold text-[#1F1B16] mb-3 group-hover:text-[#B88746] transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-[#8C7A6B] leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>

                  {/* Highlight Features list */}
                  {item.features && item.features.length > 0 && (
                    <div className="space-y-2.5 border-t border-[#E8DCCB]/30 pt-5 mb-6">
                      {item.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#B88746]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-[#B88746]" />
                          </div>
                          <span className="text-[11px] text-[#1F1B16] font-medium leading-tight">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explore Button link */}
                  <Link
                    href={item.link || "/du-an"}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#B88746] text-[#B88746] hover:bg-[#B88746] hover:text-white text-xs font-bold transition-all duration-300 group/btn"
                  >
                    Khám phá dự án
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                </div>

              </div>
            </MotionWrapper>
          ))}
        </div>

        {/* ── Strategic Partners Section ──────────────────────── */}
        <div className="border-t border-[#E8DCCB]/40 pt-16">
          <div className="text-center mb-10">
            <MotionWrapper>
              <span className="text-[10px] font-bold text-[#8C7A6B] tracking-[0.25em] uppercase block mb-2">
                MẠNG LƯỚI ĐỐI TÁC
              </span>
            </MotionWrapper>
            <MotionWrapper delay={0.05}>
              <h3 className="heading-font text-xl font-bold text-[#1F1B16]">
                Đối Tác Chiến Lược Toàn Cầu
              </h3>
            </MotionWrapper>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {partners.map((partner, idx) => (
              <MotionWrapper key={idx} delay={0.1 + idx * 0.05}>
                <div className="bg-white rounded-[16px] border border-[#E8DCCB]/40 p-5 flex items-center justify-center transition-all duration-300 hover:border-[#B88746] hover:shadow-soft group min-h-[64px]">
                  <span className="heading-font text-xs text-[#8C7A6B] tracking-wide text-center font-bold uppercase transition-colors duration-300 group-hover:text-[#B88746]">
                    {partner}
                  </span>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>

      </Container>
    </section>
  );
}
