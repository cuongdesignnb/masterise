"use client";

import React from "react";
import Image from "next/image";
import { aboutIntro } from "@/data/aboutSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import { ArrowRight } from "lucide-react";

export default function AboutIntro() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-cream">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left column – text */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <MotionWrapper>
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] text-gold uppercase">
                <span>🌿</span>
                {aboutIntro.label}
              </span>
            </MotionWrapper>

            <MotionWrapper delay={0.1}>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-[38px] heading-font font-bold text-ink leading-snug tracking-tight">
                {aboutIntro.title}
              </h2>
            </MotionWrapper>

            {aboutIntro.paragraphs.map((p, idx) => (
              <MotionWrapper key={idx} delay={0.15 + idx * 0.08}>
                <p className="mt-4 text-sm text-muted leading-relaxed font-light">
                  {p}
                </p>
              </MotionWrapper>
            ))}

            <MotionWrapper delay={0.35}>
              <div className="mt-7">
                <Button
                  href="/gioi-thieu"
                  variant="outline"
                  size="md"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                >
                  {aboutIntro.button}
                </Button>
              </div>
            </MotionWrapper>
          </div>

          {/* Right column – image collage */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <MotionWrapper delay={0.2}>
              <div className="grid grid-cols-2 gap-3">
                {/* Large image spanning 2 cols */}
                <div className="col-span-2 relative aspect-[16/10] rounded-[22px] overflow-hidden shadow-soft">
                  <Image
                    src={aboutIntro.images[0]}
                    alt="Dự án tiêu biểu Masterise Homes"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>

                {/* Two smaller images */}
                {aboutIntro.images.slice(1).map((src, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-[22px] overflow-hidden shadow-soft"
                  >
                    <Image
                      src={src}
                      alt={`Không gian sống Masterise Homes ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            </MotionWrapper>
          </div>
        </div>
      </Container>
    </section>
  );
}
