"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import MotionWrapper from "@/components/MotionWrapper";
import { postService } from "@/services/postService";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import type { Post } from "@/types/api";

export default function ArticleGrid() {
  const [articles, setArticles] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    postService
      .getPosts({ per_page: 9, post_type: "news" })
      .then((response) => setArticles(unwrapData<Post[]>(response) || []))
      .catch(() => setArticles([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <MotionWrapper className="mb-6">
        <h2 className="heading-font text-lg sm:text-xl font-bold text-ink">
          Khám phá bài viết mới nhất
        </h2>
      </MotionWrapper>

      {isLoading ? (
        <div className="rounded-lg border border-line/60 bg-white p-8 text-center text-sm text-muted">
          Đang tải tin tức...
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-line/60 bg-white p-8 text-center text-sm text-muted">
          Tin tức đang được cập nhật.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, index) => (
            <MotionWrapper key={article.id} delay={index * 0.08}>
              <Link
                href={`/tin-tuc/${article.slug}`}
                className="group bg-white rounded-lg border border-line/50 overflow-hidden hover:-translate-y-1 hover:shadow-soft transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.thumbnail || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="uppercase text-[10px] font-bold text-gold tracking-wider">
                    {article.category?.name || "Tin tức"}
                  </span>
                  <h3 className="heading-font text-sm font-bold text-ink line-clamp-2 mt-1.5">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {article.published_at ? new Date(article.published_at).toLocaleDateString("vi-VN") : "Đang cập nhật"}
                    </span>
                  </div>
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
      )}
    </section>
  );
}
