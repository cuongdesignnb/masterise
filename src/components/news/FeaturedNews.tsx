"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { featuredArticle, secondaryArticles } from "@/data/newsSeed";
import MotionWrapper from "@/components/MotionWrapper";

export default function FeaturedNews() {
  return (
    <section className="pb-6">
      <MotionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left: main featured card ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[18px] border border-line/60 overflow-hidden shadow-soft group cursor-pointer">
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                {/* Badge */}
                <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">
                  {featuredArticle.badge}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Category */}
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.14em]">
                  {featuredArticle.category}
                </span>

                {/* Title */}
                <h3 className="heading-font text-lg font-bold text-ink mt-2 leading-snug line-clamp-2">
                  {featuredArticle.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-2">
                  {featuredArticle.excerpt}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-[11px] text-muted">
                  <span className="font-medium text-ink">
                    {featuredArticle.author}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} />
                    {featuredArticle.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} />
                    {featuredArticle.date}
                  </span>
                </div>

                {/* Read more link */}
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold mt-4 hover:text-gold-dark transition-colors group/link cursor-pointer">
                  Xem chi tiết
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover/link:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: secondary article stack ── */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {secondaryArticles.map((article, idx) => (
              <MotionWrapper key={idx} delay={0.1 * (idx + 1)}>
                <div className="flex gap-4 bg-white rounded-[14px] border border-line/40 p-3 hover:shadow-soft transition group cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-20 rounded-[12px] overflow-hidden shrink-0">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="112px"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.14em]">
                      {article.category}
                    </span>
                    <h4 className="text-sm font-semibold text-ink mt-1 leading-snug line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {article.readTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={10} />
                        {article.date}
                      </span>
                    </div>
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </MotionWrapper>
    </section>
  );
}
