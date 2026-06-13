"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import { popularPosts, topics } from "@/data/newsSeed";

export default function NewsSidebar() {
  return (
    <aside className="flex flex-col gap-5">
      {/* ── Card 1: Bài viết nổi bật ───────────────────────────── */}
      <MotionWrapper>
        <div className="bg-white rounded-[18px] border border-line/50 p-5 shadow-soft">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Bài viết nổi bật
          </h3>

          <ul>
            {popularPosts.map((post, index) => (
              <li
                key={index}
                className={`flex items-start gap-3 py-3 ${
                  index < popularPosts.length - 1
                    ? "border-b border-line/30"
                    : ""
                }`}
              >
                {/* Number */}
                <span className="heading-font text-lg font-bold text-gold/30 flex-shrink-0 w-6 text-center leading-tight">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <Link
                    href="#"
                    className="text-xs font-semibold text-ink line-clamp-2 hover:text-gold transition-colors duration-200"
                  >
                    {post.title}
                  </Link>
                  <p className="text-[10px] text-muted mt-0.5">{post.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </MotionWrapper>

      {/* ── Card 2: Chủ đề quan tâm ────────────────────────────── */}
      <MotionWrapper delay={0.1}>
        <div className="bg-white rounded-[18px] border border-line/50 p-5">
          <h3 className="heading-font font-bold text-ink text-base mb-4">
            Chủ đề quan tâm
          </h3>

          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link
                key={topic}
                href="#"
                className="bg-beige/60 text-muted text-[11px] rounded-full px-3 py-1.5 hover:bg-gold hover:text-white transition-all duration-200 cursor-pointer"
              >
                {topic}
              </Link>
            ))}
          </div>

          <Link
            href="#"
            className="inline-block text-gold text-xs font-semibold mt-3 hover:underline"
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
