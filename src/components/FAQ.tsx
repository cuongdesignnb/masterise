"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "@/data/seed";
import MotionWrapper from "./MotionWrapper";

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full text-left">
      <MotionWrapper>
        {/* Gold Serif Title with Leaf Icon */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gold text-lg">🌿</span>
          <h2 className="heading-font text-[20px] sm:text-[22px] font-bold text-[#B88746] uppercase tracking-[0.03em]">
            CÂU HỎI THƯỜNG GẶP
          </h2>
        </div>
      </MotionWrapper>

      {/* Accordion List */}
      <div className="flex flex-col gap-3.5 flex-grow">
        {faqs.map((faq, idx) => {
          const isOpen = openId === faq.id;

          return (
            <MotionWrapper key={faq.id} delay={idx * 0.05}>
              <div className="bg-white border border-[#E8DCCB]/60 rounded-2xl overflow-hidden shadow-soft transition-all duration-300 hover:border-[#B88746]">
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer focus:outline-none select-none group"
                  aria-expanded={isOpen}
                >
                  <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#8F632F] group-hover:text-gold transition-colors duration-200 heading-font pr-4 leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#B88746] group-hover:text-gold transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-gold" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-[11px] sm:text-xs text-muted leading-relaxed text-left border-t border-[#E8DCCB]/20 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </MotionWrapper>
          );
        })}
      </div>
    </div>
  );
}
