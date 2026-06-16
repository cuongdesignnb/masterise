"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, ArrowLeft, ArrowRight, Phone, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { heroSlides } from "@/data/seed";
import Container from "./Container";
import Button from "./Button";

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handleNext = () => {
    setIsAutoplay(false);
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrev = () => {
    setIsAutoplay(false);
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentSlide = heroSlides[current];

  return (
    <section className="relative h-[680px] sm:h-[700px] lg:h-[730px] w-full overflow-hidden bg-cream pt-[72px]">
      {/* Background Decorative Gold Blurs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gold/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Image Carousel Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.titleLines.join(' ')}
              fill
              sizes="100vw"
              className="object-cover"
              priority={current === 0}
              quality={80}
            />
            {/* White/Cream Left Gradient Overlay & Luxury Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent lg:from-cream lg:via-cream/60 lg:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-black/5" />
          </motion.div>
        </AnimatePresence>
      </div>

      <Container className="relative z-10 h-full flex flex-col justify-center pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full pt-10 sm:pt-6">
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.12 },
                  },
                }}
              >
                {/* Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-[52px] heading-font font-bold text-ink tracking-tight leading-[1.15]">
                  {currentSlide.titleLines.map((line, idx) => (
                    <motion.span
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, y: 25 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                      }}
                      className="block"
                    >
                      {line}
                    </motion.span>
                  ))}
                  <motion.span
                    variants={{
                      hidden: { opacity: 0, y: 25 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                    }}
                    className="block text-gold Shimmer-effect mt-2 text-2xl sm:text-3xl lg:text-[38px] tracking-wide font-semibold"
                  >
                    {currentSlide.highlight}
                  </motion.span>
                </h1>

                {/* Description */}
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                  }}
                  className="mt-5 text-sm text-muted max-w-xl leading-relaxed font-light"
                >
                  {currentSlide.description}
                </motion.p>

                {/* Buttons CTA */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                  }}
                  className="mt-8 flex flex-wrap gap-4 items-center"
                >
                  <Button
                    href="#du-an"
                    variant="solid"
                    size="md"
                    className="sm:px-8 sm:py-3 sm:text-sm"
                    icon={<ChevronDown size={14} />}
                    iconPosition="right"
                  >
                    Khám phá dự án
                  </Button>
                  <Button
                    href="#lien-he"
                    variant="outline"
                    size="md"
                    className="bg-white/90 border-white text-ink hover:bg-gold hover:text-white sm:px-8 sm:py-3 sm:text-sm"
                    icon={<Phone size={14} className="text-gold" />}
                    iconPosition="left"
                  >
                    Tư vấn ngay
                  </Button>
                </motion.div>

                {/* Slider Controls Directly Below Buttons */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                  }}
                  className="flex items-center gap-3 mt-6"
                >
                  <button
                    onClick={handlePrev}
                    className="w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all duration-300 cursor-pointer focus:outline-none"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft size={12} />
                  </button>

                  <div className="flex items-center gap-2">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => {
                          setIsAutoplay(false);
                          setCurrent(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 border border-gold ${
                          idx === current ? "bg-gold" : "bg-transparent"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all duration-300 cursor-pointer focus:outline-none"
                    aria-label="Next slide"
                  >
                    <ArrowRight size={12} />
                  </button>
                </motion.div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Play teaser button */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end lg:pr-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center gap-4 cursor-pointer group mt-4 lg:mt-0 mb-8 lg:mb-0"
            >
              <div className="relative">
                {/* Pulse Glow Effect */}
                <div className="absolute inset-0 bg-gold/15 rounded-full scale-125 animate-ping opacity-60 group-hover:scale-150" />
                <button
                  className="relative flex items-center justify-center w-12 h-12 rounded-full border border-[#E8DCCB] bg-white/90 text-[#B88746] hover:text-white hover:bg-[#B88746] hover:border-[#B88746] shadow-soft transition-all duration-300 transform group-hover:scale-105 backdrop-blur-md"
                  aria-label="Play video"
                >
                  <Play size={16} className="ml-0.5 fill-current" />
                </button>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#6F665C] group-hover:text-gold transition-colors">
                  Xem video giới thiệu
                </span>
                <span className="text-sm font-bold text-[#1F1B16] heading-font group-hover:text-gold transition-colors mt-0.5">
                  Masterise Homes
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
