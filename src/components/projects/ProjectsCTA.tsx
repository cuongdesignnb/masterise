"use client";

import React from "react";
import Image from "next/image";
import { projectsCta } from "@/data/projectsSeed";
import { ArrowRight, Download, Building2 } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";

export default function ProjectsCTA() {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <MotionWrapper>
          <div className="rounded-[20px] bg-beige/80 border border-line/40 overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Image */}
              <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[280px] overflow-hidden">
                <Image
                  src={projectsCta.image}
                  alt="Tư vấn dự án Masterise Homes"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Right: Content */}
              <div className="p-8 lg:p-10 flex flex-col justify-center relative z-10">
                <span className="uppercase text-[10px] font-bold tracking-wider text-gold">
                  {projectsCta.label}
                </span>
                <h2 className="heading-font text-xl lg:text-2xl font-bold text-ink mt-2 leading-snug">
                  {projectsCta.title}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <Button
                    variant="solid"
                    icon={<ArrowRight size={14} />}
                  >
                    {projectsCta.primaryButton}
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Download size={14} />}
                  >
                    {projectsCta.secondaryButton}
                  </Button>
                </div>
              </div>
            </div>

            {/* Watermark */}
            <Building2 className="absolute bottom-6 right-8 w-32 h-32 text-gold opacity-[0.04] pointer-events-none" />
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
