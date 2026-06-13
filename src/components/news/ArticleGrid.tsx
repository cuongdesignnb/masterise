"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import MotionWrapper from "@/components/MotionWrapper";
import { articles } from "@/data/newsSeed";

export default function ArticleGrid() {
  const displayArticles = articles.slice(0, 5);

  return (
    <section>
      {/* Section header */}
      <MotionWrapper className="mb-6">
        <h2 className="heading-font text-lg sm:text-xl font-bold text-ink">
          Khám phá bài viết mới nhất
        </h2>
      </MotionWrapper>

      {/* Article grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayArticles.map((article, index) => (
          <MotionWrapper key={index} delay={index * 0.08}>
            <Link
              href="#"
              className="group bg-white rounded-[16px] border border-line/50 overflow-hidden hover:-translate-y-1 hover:shadow-soft transition-all duration-300 flex flex-col h-full"
            >
              {/* Image */}
              <div className="aspect-[16/10] rounded-t-[14px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={640}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                {/* Category */}
                <span className="uppercase text-[10px] font-bold text-gold tracking-wider">
                  {article.category}
                </span>

                {/* Title */}
                <h3 className="heading-font text-sm font-bold text-ink line-clamp-2 mt-1.5">
                  {article.title}
                </h3>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {article.date}
                  </span>
                </div>

                {/* Read more */}
                <div className="mt-auto pt-3">
                  <span className="inline-flex items-center gap-1 text-gold text-xs font-semibold group-hover:gap-2 transition-all duration-300">
                    Đọc thêm
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          </MotionWrapper>
        ))}
      </div>
    </section>
  );
}
