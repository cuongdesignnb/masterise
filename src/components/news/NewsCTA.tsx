"use client";

import { Building2, ArrowRight } from "lucide-react";
import MotionWrapper from "@/components/MotionWrapper";
import Container from "@/components/Container";
import Button from "@/components/Button";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";

export default function NewsCTA() {
  const { newsPageCta: cta } = useSiteSettings();

  return (
    <section className="py-8 lg:py-12">
      <Container>
        <MotionWrapper>
          <div className="rounded-[18px] bg-beige/80 border border-line/40 p-6 lg:p-10 relative overflow-hidden">
            {/* Watermark / building silhouette overlay */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none select-none flex items-center justify-end pr-8 opacity-[0.04]">
              <Building2 size={260} strokeWidth={0.5} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Left */}
              <div>
                <Building2 size={28} className="text-gold mb-3" />
                <h2 className="heading-font font-bold text-ink text-lg lg:text-xl">
                  {cta.title}
                </h2>
                <p className="text-sm text-muted max-w-lg mt-2 leading-relaxed">
                  {cta.description}
                </p>
              </div>

              {/* Right */}
              <div className="flex-shrink-0">
                <Button
                  variant="solid"
                  href="/du-an"
                  icon={<ArrowRight size={16} />}
                  className="w-full lg:w-auto"
                >
                  {cta.button}
                </Button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
