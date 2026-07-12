import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import type { Post } from "@/types/api";
import { formatArticleDate, readingMinutes } from "@/lib/articleContent";
import { CalendarDays, Clock3 } from "lucide-react";
import { getPostDetailHref } from "@/lib/postRoutes";

export default function NewsRelatedSection({ related, postType = "news" }: { related: Post[]; postType?: "news" | "investment" | "event" }) {
  if (!related.length) return null;

  const isNews = postType === "news";
  const path = isNews ? "/tin-tuc" : "/dau-tu";
  const categoryLabel = isNews ? "Góc nhìn liên quan" : "Tìm hiểu thêm";
  const sectionTitle = isNews ? "Bài viết liên quan" : (postType === "event" ? "Sự kiện liên quan" : "Bài viết đầu tư liên quan");

  return (
    <section className="border-t border-[#E8DCCB]/70 bg-[#FBF8F2] py-10 sm:py-14">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B88746]">{categoryLabel}</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F1B16] sm:text-3xl">{sectionTitle}</h2>
          </div>
          <Link href={path} className="rounded-full border border-[#E8DCCB] bg-white px-4 py-2 text-xs font-bold text-[#1F1B16] transition hover:border-[#B88746] hover:text-[#B88746]">
            Xem tất cả
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {related.slice(0, 3).map((item) => (
            <Link key={item.id} href={getPostDetailHref(item)} className="group overflow-hidden rounded-[22px] border border-[#E8DCCB]/80 bg-white shadow-[0_18px_50px_rgba(31,27,22,0.06)] transition hover:-translate-y-1 hover:border-[#B88746]">
              <div className="relative aspect-[16/10] bg-[#FBF8F2]">
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black text-[#B88746]">MASTERISE HOMES</div>
                )}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#B88746]">{item.category?.name || "Tin tức"}</p>
                <h3 className="mt-3 line-clamp-2 text-lg font-black leading-6 text-[#1F1B16] group-hover:text-[#B88746]">{item.title}</h3>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#8C7A6B]">
                  {item.published_at && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-[#B88746]" />
                      {formatArticleDate(item.published_at)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5 text-[#B88746]" />
                    {readingMinutes(item.content || item.summary)} phút đọc
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
