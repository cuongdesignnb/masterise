"use client";

import React, { useEffect, useState } from "react";
import { homepageService, type HomepageFaq } from "@/services/homepageService";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import MotionWrapper from "./MotionWrapper";

interface FaqDisplayItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQ() {
  const { homePageContent } = useSiteSettings();
  const [faqs, setFaqs] = useState<FaqDisplayItem[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await homepageService.getFaqs();
        const data = unwrapData<HomepageFaq[]>(response) || [];
        const mapped: FaqDisplayItem[] = data.map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        }));
        setFaqs(mapped);
      } catch {
        setFaqs([]);
      }
    };

    fetchFaqs();
  }, []);

  if (faqs.length === 0) return null;

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
        {faqs.map((faq, idx) => (
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
