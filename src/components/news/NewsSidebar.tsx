"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import { postService } from "@/services/postService";
import { api } from "@/lib/api";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import type { Post } from "@/types/api";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

export default function NewsSidebar() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    // Fetch featured posts
    postService
      .getFeaturedPosts({ limit: 5, post_type: "news" })
      .then((res) => setFeaturedPosts(unwrapData<Post[]>(res) || []))
      .catch((err) => console.error("Failed to load featured posts:", err))
      .finally(() => setIsLoadingFeatured(false));

    // Fetch categories
    api
      .get<CategoryItem[]>("/post-categories")
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.error("Failed to load sidebar categories:", err));
  }, []);

  return (
    <aside className="flex flex-col gap-5">
      {/* ── Card 1: Bài viết nổi bật ───────────────────────────── */}
      <MotionWrapper>
        <div className="bg-white rounded-[18px] border border-line/50 p-5 shadow-soft">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Bài viết nổi bật
          </h3>

          {isLoadingFeatured ? (
            <div className="text-center py-6 text-xs text-muted">
              Đang tải tin nổi bật...
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              Chưa có bài viết nổi bật.
            </div>
          ) : (
            <ul className="space-y-3.5">
              {featuredPosts.map((post, index) => (
                <li
                  key={post.id}
                  className={`flex items-start gap-3 pb-3.5 ${
                    index < featuredPosts.length - 1
                      ? "border-b border-line/30"
                      : ""
                  }`}
                >
                  {/* Number */}
                  <span className="heading-font text-lg font-bold text-gold/30 flex-shrink-0 w-6 text-center leading-tight">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0 relative bg-cream">
                    <Image
                      src={
                        post.thumbnail ||
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop"
                      }
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/tin-tuc/${post.slug}`}
                      className="text-xs font-semibold text-ink line-clamp-2 hover:text-gold transition-colors duration-200"
                    >
                      {post.title}
                    </Link>
                    <p className="text-[10px] text-muted mt-1">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Đang cập nhật"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </MotionWrapper>

      {/* ── Card 2: Chủ đề quan tâm ────────────────────────────── */}
      <MotionWrapper delay={0.1}>
        <div className="bg-white rounded-[18px] border border-line/50 p-5">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Chủ đề quan tâm
          </h3>

          {categories.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              Đang tải danh mục...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/tin-tuc?category=${topic.slug}`}
                  className="bg-beige/60 text-muted text-[11px] font-semibold rounded-full px-3.5 py-1.5 hover:bg-gold hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {topic.name} ({topic.posts_count || 0})
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/tin-tuc"
            className="inline-block text-gold text-xs font-semibold mt-4 hover:underline"
          >
            Xem tất cả chủ đề →
          </Link>
        </div>
      </MotionWrapper>

      {/* ── Card 3: Đăng ký nhận bản tin ────────────────────────── */}
      <MotionWrapper delay={0.2}>
        <div className="bg-ivory rounded-[18px] border border-line/50 p-5 relative overflow-hidden">
          {/* Mail icon decoration */}
          <Mail
            size={72}
            className="absolute -top-2 -right-2 text-gold/[0.06] pointer-events-none"
            strokeWidth={1}
          />

          <h3 className="heading-font font-bold text-ink text-base mb-2">
            Đăng ký nhận bản tin
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Nhận ngay thông tin dự án mới, phân tích thị trường và ưu đãi độc
            quyền từ Masterise Homes.
          </p>

          <input
            type="email"
            placeholder="Email của bạn"
            className="bg-ivory border border-line/60 rounded-lg px-4 py-2.5 text-sm w-full mt-3 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors placeholder:text-muted/60"
          />

          <Button
            variant="gold-gradient"
            className="w-full mt-3"
            icon={<ArrowRight size={15} />}
          >
            Nhận bản tin ngay
          </Button>
        </div>
      </MotionWrapper>
    </aside>
  );
}
