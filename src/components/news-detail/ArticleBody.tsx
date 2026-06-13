"use client";

import { articleDetail } from "@/data/newsDetailSeed";
import Image from "next/image";
import MotionWrapper from "@/components/MotionWrapper";
import {
  CheckCircle2,
  Waves,
  Ruler,
  Trees,
  Sparkles,
  TrendingUp,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const statsIconMap: Record<string, LucideIcon> = {
  Waves,
  Ruler,
  Trees,
  Sparkles,
};

export default function ArticleBody() {
  const d = articleDetail;

  return (
    <div>
      {/* Intro paragraph */}
      <MotionWrapper>
        <p className="text-[15px] text-[#4E453B] leading-[1.75] mt-0">
          {d.intro}
        </p>
      </MotionWrapper>

      {/* Sections */}
      {d.sections.map((section, sIdx) => (
        <div key={sIdx}>
          <MotionWrapper delay={0.05}>
            <h2 className="heading-font text-xl md:text-2xl font-bold text-ink mt-8 mb-3">
              {section.title}
            </h2>
          </MotionWrapper>

          {/* Paragraphs */}
          {section.paragraphs.map((para, pIdx) => (
            <MotionWrapper key={pIdx} delay={0.08 + pIdx * 0.04}>
              <p className="text-[15px] text-[#4E453B] leading-[1.75] mt-3">
                {para}
              </p>
            </MotionWrapper>
          ))}

          {/* Bullet list (if exists) */}
          {section.bullets && section.bullets.length > 0 && (
            <MotionWrapper delay={0.12}>
              <ul className="space-y-2 mt-3">
                {section.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-2.5 text-sm text-[#4E453B]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </MotionWrapper>
          )}

          {/* Image pair (if exists) */}
          {section.images && section.images.length > 0 && (
            <MotionWrapper delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {section.images.map((img, iIdx) => (
                  <div
                    key={iIdx}
                    className="relative rounded-[16px] h-[190px] overflow-hidden group"
                  >
                    <Image
                      src={typeof img === "string" ? img : img}
                      alt={`Hình minh họa ${section.title} - ${iIdx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </MotionWrapper>
          )}

          {/* Quote block — rendered after the first section */}
          {sIdx === 0 && d.quote && (
            <MotionWrapper delay={0.1}>
              <blockquote className="bg-[#FFF8EC] rounded-[18px] border border-line/60 px-6 py-5 my-8 relative">
                {/* Decorative quote mark */}
                <span
                  className="heading-font text-6xl text-gold/30 absolute top-2 left-4 leading-none select-none pointer-events-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="italic text-[15px] heading-font text-ink leading-relaxed pl-6 pt-3">
                  {d.quote.content}
                </p>
                <p className="text-xs text-muted mt-2 pl-6">
                  — {d.quote.source}
                </p>
              </blockquote>
            </MotionWrapper>
          )}
        </div>
      ))}

      {/* Stats strip */}
      <MotionWrapper delay={0.08}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          {d.stats.map((stat, i) => {
            const IconComp = statsIconMap[stat.icon];
            return (
              <div
                key={i}
                className="bg-white rounded-[16px] border border-line/50 p-4 text-center"
              >
                {IconComp && (
                  <IconComp className="w-5 h-5 text-gold mx-auto mb-2" />
                )}
                <div className="heading-font text-lg font-bold text-gold">
                  {stat.value}
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </MotionWrapper>

      {/* Investment section */}
      {d.investment && (
        <div>
          <MotionWrapper delay={0.05}>
            <h2 className="heading-font text-xl md:text-2xl font-bold text-ink mt-8 mb-3">
              {d.investment.title}
            </h2>
          </MotionWrapper>

          {/* Bullet list with TrendingUp icons */}
          <MotionWrapper delay={0.1}>
            <ul className="space-y-2.5 mt-3">
              {d.investment.bullets.map((bullet, bIdx) => (
                <li
                  key={bIdx}
                  className="flex items-start gap-2.5 text-sm text-[#4E453B]"
                >
                  <TrendingUp className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </MotionWrapper>

          {/* Callout box */}
          <MotionWrapper delay={0.15}>
            <div className="bg-beige/60 rounded-[16px] border border-line/40 p-5 mt-5">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-ink">
                    {d.investment.calloutTitle}
                  </p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {d.investment.callout}
                  </p>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      )}
    </div>
  );
}
