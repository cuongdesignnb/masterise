"use client";

import { contactCta } from "@/data/contactSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";
import Button from "@/components/Button";

export default function ContactCTA() {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <MotionWrapper>
          <div className="rounded-[20px] overflow-hidden relative min-h-[260px]">
            {/* ── Background image ──────────────────── */}
            <Image
              src={contactCta.image}
              alt="Masterise Homes tư vấn dự án"
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
              priority={false}
            />

            {/* ── Dark gradient overlay ─────────────── */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            {/* ── Content ──────────────────────────── */}
            <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-center items-start max-w-xl min-h-[260px]">
              {/* Label */}
              <span className="uppercase text-[10px] font-bold tracking-wider text-gold-light">
                {contactCta.label}
              </span>

              {/* Title */}
              <h2 className="heading-font text-xl lg:text-2xl font-bold text-white mt-2 leading-snug">
                {contactCta.title}
              </h2>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <Button
                  href="#global-contact-form"
                  variant="solid"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {contactCta.primaryButton}
                </Button>

                <Button
                  href="#global-contact-form"
                  variant="outline"
                  size="sm"
                  className="border-white/40 text-white hover:bg-white hover:text-ink"
                >
                  <span>{contactCta.secondaryButton}</span>
                  <Download className="ml-2 w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
