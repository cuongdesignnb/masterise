"use client";

import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { bottomRelatedPosts } from "@/data/newsDetailSeed";

export default function ArticleRelatedPosts() {
  return (
    <section className="py-10 lg:py-14">
      <Container>
        <MotionWrapper>
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-font font-bold text-ink text-lg">
              Bài viết liên quan
            </h2>
            <a
              href="/tin-tuc"
              className="text-gold text-xs font-semibold hover:text-gold-dark transition-colors"
            >
              Xem tất cả bài viết →
            </a>
          </div>
        </MotionWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bottomRelatedPosts.map((post, idx) => (
            <MotionWrapper key={idx} delay={idx * 0.1}>
              <article className="bg-white rounded-[16px] border border-line/50 overflow-hidden hover:-translate-y-1 hover:shadow-soft transition-all duration-300 group cursor-pointer">
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="uppercase text-[10px] font-bold text-gold tracking-wider">
                    {post.category}
                  </span>
                  <h3 className="heading-font text-sm font-bold text-ink mt-1.5 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted">
                      <Calendar size={11} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted">
                      <Clock size={11} />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
