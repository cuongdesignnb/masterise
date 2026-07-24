"use client";

import React from "react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import MotionWrapper from "./MotionWrapper";
import type { PublicFaq } from "@/types/faq";

interface FaqDisplayItem {
  id: number | string;
  question: string;
  answer: string;
}

interface FAQProps {
  faqs?: PublicFaq[];
}

export default function FAQ({ faqs = [] }: FAQProps) {
  const { homePageContent } = useSiteSettings();
  const displayFaqs: FaqDisplayItem[] = faqs
    .map((item, index) => ({
      id: item.id ?? `${item.question}-${index}`,
      question: item.question,
      answer: item.answer,
    }))
    .filter((item) => item.question.trim() && item.answer.trim());

  if (displayFaqs.length === 0) return null;

  return (
    <div className="flex h-full flex-col text-left">
      <MotionWrapper>
        <div className="mb-6 flex items-center gap-2">
          <span className="text-lg text-gold">•</span>
          <h2 className="heading-font text-[20px] font-bold tracking-[0.03em] text-[#B88746] normal-case sm:text-[22px]">
            {homePageContent.faqTitle}
          </h2>
        </div>
      </MotionWrapper>

      <dl className="flex flex-grow flex-col gap-3.5">
        {displayFaqs.map((faq, idx) => (
            <MotionWrapper key={faq.id} delay={idx * 0.05}>
              <div className="rounded-2xl border border-[#E8DCCB]/60 bg-white p-4 shadow-soft transition-colors duration-300 hover:border-[#B88746] sm:p-5">
                  <dt className="heading-font text-[12.5px] font-bold leading-snug text-[#8F632F] sm:text-[13.5px]">
                    {faq.question}
                  </dt>
                  <dd className="mt-3 border-t border-[#E8DCCB]/20 pt-3 text-left text-[11px] leading-relaxed text-muted sm:text-xs">
                        {faq.answer}
                  </dd>
              </div>
            </MotionWrapper>
        ))}
      </dl>
    </div>
  );
}
