"use client";

import { useState } from "react";
import Image from "next/image";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AboutBrandFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { aboutPageBrandStory, aboutPageFaqs } = useSiteSettings();

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* ── Left: Brand Story ────────────────────── */}
          <div className="lg:col-span-5 relative">
            <MotionWrapper>
              <h2 className="heading-font text-xl md:text-2xl font-bold text-gold mb-4">
                🌿 {aboutPageBrandStory.title.toUpperCase()}
              </h2>

              <p className="text-sm text-muted leading-relaxed mb-6 font-sans">
                {aboutPageBrandStory.description}
              </p>

              <Button variant="outline" href="/lien-he#global-contact-form">
                {aboutPageBrandStory.button}
              </Button>
            </MotionWrapper>

            {/* Decorative faded building image */}
            <MotionWrapper delay={0.2} className="mt-8">
              <div className="relative w-full h-48 md:h-64 rounded-[18px] overflow-hidden opacity-30">
                <Image
                  src={aboutPageBrandStory.image}
                  alt="Masterise Homes brand story"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </MotionWrapper>
          </div>

          {/* ── Right: FAQs ─────────────────────────── */}
          <div className="lg:col-span-7">
            <MotionWrapper delay={0.1}>
              <h2 className="heading-font text-xl md:text-2xl font-bold text-gold mb-6">
                FAQS – CÂU HỎI THƯỜNG GẶP
              </h2>
            </MotionWrapper>

            <div className="space-y-0">
              {aboutPageFaqs.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <MotionWrapper key={idx} delay={0.12 + idx * 0.06}>
                    <div className="border-b border-line/30">
                      {/* Question button */}
                      <button
                        type="button"
                        onClick={() => toggle(idx)}
                        className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                      >
                        <span className="text-sm font-semibold text-gold-dark pr-4 group-hover:text-gold transition-colors">
                          {faq.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown
                            className="w-5 h-5 text-gold-dark"
                            strokeWidth={2}
                          />
                        </motion.span>
                      </button>

                      {/* Answer */}
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
                            <p className="text-xs text-muted leading-relaxed pb-4 font-sans">
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
          </div>
        </div>
      </Container>
    </section>
  );
}
