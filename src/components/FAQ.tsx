"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { homepageService } from "@/services/homepageService";
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
  const [openId, setOpenId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FaqDisplayItem[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await homepageService.getFaqs();
        const data = unwrapData<any[]>(response) || [];
        const mapped: FaqDisplayItem[] = data.map((item: any) => ({
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

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

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

      <div className="flex flex-grow flex-col gap-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openId === faq.id;

          return (
            <MotionWrapper key={faq.id} delay={idx * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-[#E8DCCB]/60 bg-white shadow-soft transition-all duration-300 hover:border-[#B88746]">
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="group flex w-full cursor-pointer select-none items-center justify-between p-4 text-left focus:outline-none sm:p-5"
                  aria-expanded={isOpen}
                >
                  <span className="heading-font pr-4 text-[12.5px] font-bold leading-snug text-[#8F632F] transition-colors duration-200 group-hover:text-gold sm:text-[13.5px]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 text-[#B88746] transition-transform duration-300 group-hover:text-gold ${
                      isOpen ? "rotate-180 text-gold" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="border-t border-[#E8DCCB]/20 px-4 pb-4 pt-3 text-left text-[11px] leading-relaxed text-muted sm:px-5 sm:pb-5 sm:text-xs">
                        {faq.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </MotionWrapper>
          );
        })}
      </div>
    </div>
  );
}
