"use client";

import Image from "next/image";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { ecosystem, aboutPartners } from "@/data/aboutSeed";

export default function AboutEcosystem() {
  return (
    <section className="py-16 md:py-24 soft-section-bg">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* ── Left: Ecosystem ──────────────────────── */}
          <div className="lg:col-span-7">
            <MotionWrapper>
              <h2 className="heading-font text-xl md:text-2xl font-bold text-gold mb-8">
                🌿 HỆ SINH THÁI BẤT ĐỘNG SẢN
              </h2>
            </MotionWrapper>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ecosystem.map((item, idx) => (
                <MotionWrapper key={idx} delay={idx * 0.08}>
                  <div className="rounded-[18px] overflow-hidden bg-white border border-line/40 group transition-shadow duration-300 hover:shadow-soft">
                    {/* Image */}
                    <div className="relative h-28 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Text */}
                    <div className="p-3">
                      <h3 className="font-bold text-sm text-ink leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>

          {/* ── Right: Partners ──────────────────────── */}
          <div className="lg:col-span-5">
            <MotionWrapper delay={0.1}>
              <h2 className="heading-font text-xl md:text-2xl font-bold text-gold mb-8">
                🌿 ĐỐI TÁC CHIẾN LƯỢC
              </h2>
            </MotionWrapper>

            <div className="grid grid-cols-2 gap-4">
              {aboutPartners.map((partner, idx) => (
                <MotionWrapper key={idx} delay={0.12 + idx * 0.06}>
                  <div className="bg-white rounded-[16px] border border-line/50 p-6 flex items-center justify-center transition-colors duration-300 hover:border-gold">
                    <span className="heading-font text-sm text-ink tracking-wide text-center font-medium">
                      {partner}
                    </span>
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
