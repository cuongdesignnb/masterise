"use client";

import { Building2, ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import MotionWrapper from "@/components/MotionWrapper";

export default function ArticleCTA() {
  return (
    <section className="py-6 lg:py-10">
      <Container>
        <MotionWrapper>
          <div className="rounded-[18px] bg-beige/80 border border-line/40 p-6 lg:p-10 relative overflow-hidden">
            {/* Watermark */}
            <Building2
              size={200}
              className="absolute -right-6 -bottom-6 lg:right-4 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 opacity-[0.04] text-gold pointer-events-none"
            />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
              {/* Left content */}
              <div>
                <Building2 size={28} className="text-gold mb-3" />
                <h2 className="heading-font font-bold text-ink text-lg">
                  Khám phá các dự án nổi bật của Masterise Homes
                </h2>
                <p className="text-sm text-muted max-w-lg mt-2">
                  Trải nghiệm không gian sống đẳng cấp và cơ hội đầu tư bền
                  vững tại những vị trí chiến lược.
                </p>
              </div>

              {/* Right button */}
              <div className="flex-shrink-0">
                <Button
                  variant="solid"
                  icon={<ArrowRight size={14} />}
                  href="/du-an"
                  className="w-full lg:w-auto"
                >
                  Khám phá dự án
                </Button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
