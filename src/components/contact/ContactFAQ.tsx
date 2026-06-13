"use client";

import { useState } from "react";
import { contactFaqs } from "@/data/contactSeed";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-8">
      <Container>
        {/* ── Section header ────────────────────────── */}
        <MotionWrapper>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gold text-sm">✦</span>
            <h2 className="heading-font font-bold text-ink text-base">
              Câu hỏi thường gặp
            </h2>
          </div>
        </MotionWrapper>

        {/* ── FAQ grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <MotionWrapper key={idx} delay={0.06 * idx}>
                <div className="bg-white rounded-[16px] border border-line/50 overflow-hidden transition-all">
                  {/* Question header */}
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full flex justify-between items-start p-4 cursor-pointer text-left"
                  >
                    <span className="text-xs font-semibold text-ink pr-4 leading-relaxed">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <ChevronDown className="w-4 h-4 text-gold" />
                    </motion.span>
                  </button>

                  {/* Answer panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.3, ease: "easeInOut" },
                          opacity: { duration: 0.2, ease: "easeInOut" },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-[11px] text-muted leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </MotionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
