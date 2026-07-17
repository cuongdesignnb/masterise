import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, UserRound } from "lucide-react";
import Container from "@/components/Container";
import NewsShareActions from "@/components/news-detail/NewsShareActions";
import type { Post } from "@/types/api";
import { getPostDetailHref } from "@/lib/postRoutes";

const fallbackImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1800&auto=format&fit=crop";

type NewsArticleHeroProps = {
  post: Post;
  publishedLabel?: string | null;
  minutes: number;
};

export default function NewsArticleHero({ post, publishedLabel, minutes }: NewsArticleHeroProps) {
  const listingHref = post.post_type === "news" ? "/tin-tuc" : "/dau-tu";
  const listingLabel = post.post_type === "news" ? "Tin tức" : "Đầu tư";
  const categoryLabel = post.category?.name || (post.post_type === "event" ? "Sự kiện" : listingLabel);

  return (
    <section className="border-b border-[#E8DCCB]/70 bg-[#FBF8F2] pt-20 sm:pt-24">
      <Container className="py-4 sm:py-6 lg:py-8">
        <div className="relative min-h-[520px] overflow-hidden rounded-[20px] border border-white/20 bg-[#2B2927] shadow-[0_24px_70px_rgba(31,27,22,0.18)] sm:min-h-[500px] lg:min-h-[520px]">
          <Image
            src={post.thumbnail || fallbackImage}
            alt={post.title}
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 94vw, 1240px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

          <div className="relative z-10 flex min-h-[520px] flex-col justify-between p-5 text-white sm:min-h-[500px] sm:p-8 lg:min-h-[520px] lg:p-10">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80" aria-label="Đường dẫn bài viết">
              <Link href="/" className="transition hover:text-white">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <Link href={listingHref} className="transition hover:text-white">{listingLabel}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{categoryLabel}</span>
            </nav>

            <div className="max-w-5xl">
              <span className="inline-flex rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                {categoryLabel}
              </span>
              <h1 className="mt-4 max-w-[1000px] text-balance text-[30px] font-black leading-[1.12] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] sm:text-[42px] lg:text-[52px]">
                {post.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/85 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-4 w-4 text-[#E6B86B]" />
                  {post.author?.name || "Masterise Homes"}
                </span>
                {publishedLabel ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-[#E6B86B]" />
                    {publishedLabel}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-[#E6B86B]" />
                  {minutes} phút đọc
                </span>
              </div>

              <NewsShareActions title={post.title} path={getPostDetailHref(post)} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
