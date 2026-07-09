"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, Clock3, Copy, Link2, MessageCircle, Share2, UserRound } from "lucide-react";
import Container from "@/components/Container";
import type { Post } from "@/types/api";

const fallbackImage = "/file.svg";

type NewsArticleHeroProps = {
  post: Post;
  publishedLabel?: string | null;
  minutes: number;
};

export default function NewsArticleHero({ post, publishedLabel, minutes }: NewsArticleHeroProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : (post.post_type === "news" ? `/tin-tuc/${post.slug}` : `/dau-tu/${post.slug}`);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="border-b border-[#E8DCCB]/70 bg-white pt-24 sm:pt-28">
      <Container className="py-7 sm:py-10">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8C7A6B]">
          <Link href="/" className="transition hover:text-[#B88746]">Trang chủ</Link>
          <span>/</span>
          <Link href={post.post_type === "news" ? "/tin-tuc" : "/dau-tu"} className="transition hover:text-[#B88746]">
            {post.post_type === "news" ? "Tin tức" : "Đầu tư"}
          </Link>
          <span>/</span>
          <span className="text-[#1F1B16]">{post.category?.name || (post.post_type === "event" ? "Sự kiện" : post.post_type === "investment" ? "Cơ hội đầu tư" : "Chi tiết tin tức")}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-[#B88746]/25 bg-[#B88746]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B88746]">
              {post.category?.name || (post.post_type === "event" ? "Sự kiện" : post.post_type === "investment" ? "Cơ hội đầu tư" : "Tin tức")}
            </div>
            <h1 className="mt-4 text-balance text-3xl font-black leading-[1.08] text-[#1F1B16] sm:text-5xl lg:text-[56px]">
              {post.title}
            </h1>
            {post.summary && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4B4238] sm:text-base">
                {post.summary}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#8C7A6B]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4 text-[#B88746]" />
                {post.author?.name || "Masterise Homes"}
              </span>
              {publishedLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-[#B88746]" />
                  {publishedLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#B88746]" />
                {minutes} phút đọc
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8C7A6B]">
              <span className="mr-1">Chia sẻ:</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:-translate-y-0.5" aria-label="Chia sẻ Facebook">
                <Share2 className="h-4 w-4" />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0A66C2] text-white transition hover:-translate-y-0.5" aria-label="Chia sẻ LinkedIn">
                <Link2 className="h-4 w-4" />
              </a>
              <a href={`https://zalo.me/share?u=${encodedUrl}&t=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0A8FE3] text-[11px] text-white transition hover:-translate-y-0.5" aria-label="Chia sẻ Zalo">
                <MessageCircle className="h-4 w-4" />
              </a>
              <button type="button" onClick={copyLink} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E8DCCB] bg-[#FBF8F2] px-3 text-[#1F1B16] transition hover:border-[#B88746]">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#B88746]" />}
                {copied ? "Đã sao chép" : "Copy link"}
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-[26px] border border-[#E8DCCB] bg-[#FBF8F2] shadow-[0_22px_70px_rgba(31,27,22,0.12)]">
            <Image
              src={post.thumbnail || fallbackImage}
              alt={post.title}
              fill
              priority
              className={post.thumbnail ? "object-cover" : "object-contain p-12"}
              sizes="(max-width: 1024px) 100vw, 680px"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
