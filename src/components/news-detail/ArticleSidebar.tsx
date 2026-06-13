"use client";

import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import Button from "@/components/Button";
import MotionWrapper from "@/components/MotionWrapper";
import {
  articleDetail,
  relatedSidebarPosts,
  topicTags,
} from "@/data/newsDetailSeed";

export default function ArticleSidebar() {
  return (
    <div className="flex flex-col gap-5">
      {/* Card 1: Author */}
      <MotionWrapper delay={0.1}>
        <div className="bg-white rounded-[18px] border border-line/50 p-5 shadow-soft">
          <span className="text-[10px] uppercase tracking-wider text-muted">
            Tác giả
          </span>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold/20 flex-shrink-0 relative">
              <Image
                src={articleDetail.author.avatar}
                alt={articleDetail.author.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">
                {articleDetail.author.name}
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {articleDetail.author.role}
              </p>
            </div>
          </div>
          <a
            href="#"
            className="inline-block text-gold text-xs font-semibold mt-3 hover:text-gold-dark transition-colors"
          >
            Xem tất cả bài viết →
          </a>
        </div>
      </MotionWrapper>

      {/* Card 2: Table of Contents */}
      <MotionWrapper delay={0.15}>
        <div className="bg-white rounded-[18px] border border-line/50 p-5">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Mục lục
          </h3>
          <ul>
            {articleDetail.toc.map((item, idx) => (
              <li
                key={idx}
                className={`flex gap-3 py-2.5 cursor-pointer group ${
                  idx < articleDetail.toc.length - 1
                    ? "border-b border-line/20"
                    : ""
                }`}
              >
                <span className="heading-font text-sm font-bold text-gold/40 flex-shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-muted group-hover:text-gold transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </MotionWrapper>

      {/* Card 3: Related Posts */}
      <MotionWrapper delay={0.2}>
        <div className="bg-white rounded-[18px] border border-line/50 p-5">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Bài viết liên quan
          </h3>
          <ul>
            {relatedSidebarPosts.map((post, idx) => (
              <li
                key={idx}
                className={`flex gap-3 py-3 cursor-pointer ${
                  idx < relatedSidebarPosts.length - 1
                    ? "border-b border-line/20"
                    : ""
                }`}
              >
                <div className="w-[72px] h-14 rounded-[10px] overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-[10px] text-muted mt-1">{post.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </MotionWrapper>

      {/* Card 4: Topics */}
      <MotionWrapper delay={0.25}>
        <div className="bg-white rounded-[18px] border border-line/50 p-5">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Chủ đề quan tâm
          </h3>
          <div className="flex flex-wrap gap-2">
            {topicTags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-beige/60 text-muted text-[11px] rounded-full px-3 py-1.5 hover:bg-gold hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </MotionWrapper>

      {/* Card 5: Newsletter */}
      <MotionWrapper delay={0.3}>
        <div className="bg-ivory rounded-[18px] border border-line/50 p-5 relative overflow-hidden">
          <Mail
            size={64}
            className="absolute top-3 right-3 opacity-[0.08] text-gold pointer-events-none"
          />
          <h3 className="heading-font font-bold text-ink text-base mb-2">
            Đăng ký nhận bản tin
          </h3>
          <p className="text-[11px] text-muted">
            Nhận tin tức mới nhất về dự án, thị trường và phong cách sống từ
            Masterise Homes.
          </p>
          <input
            type="email"
            placeholder="Email của bạn"
            className="bg-white border border-line/60 rounded-lg px-4 py-2.5 text-sm w-full mt-3 outline-none focus:border-gold/50 transition-colors"
          />
          <Button
            variant="gold-gradient"
            className="w-full mt-3"
            icon={<ArrowRight size={14} />}
          >
            Nhận bản tin ngay
          </Button>
        </div>
      </MotionWrapper>
    </div>
  );
}
