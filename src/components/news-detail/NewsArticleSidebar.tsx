import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MessageSquareText } from "lucide-react";
import type { Post } from "@/types/api";
import type { ArticleTocItem } from "@/lib/articleContent";
import { formatArticleDate } from "@/lib/articleContent";

type Props = {
  toc: ArticleTocItem[];
  related: Post[];
  postType?: "news" | "investment" | "event";
};

export default function NewsArticleSidebar({ toc, related, postType = "news" }: Props) {
  const isNews = postType === "news";
  const basePath = isNews ? "/tin-tuc" : "/dau-tu";
  const sectionTitle = isNews ? "Tin tức liên quan" : (postType === "event" ? "Sự kiện liên quan" : "Đầu tư liên quan");
  const allBtnLabel = isNews ? "Xem tất cả tin tức" : "Xem tất cả";

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      {toc.length > 0 && (
        <section className="hidden rounded-[22px] border border-[#E8DCCB]/80 bg-white p-5 shadow-[0_18px_50px_rgba(31,27,22,0.06)] lg:block">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#B88746]">Mục lục</h2>
          <div className="mt-4 space-y-1 border-l border-[#E8DCCB] pl-4">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block rounded-lg py-2 text-sm font-semibold leading-5 text-[#6E5F51] transition hover:text-[#B88746] ${item.level === 3 ? "pl-3 text-xs" : ""}`}
              >
                {item.title}
              </a>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="rounded-[22px] border border-[#E8DCCB]/80 bg-white p-5 shadow-[0_18px_50px_rgba(31,27,22,0.06)]">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#B88746]">{sectionTitle}</h2>
          <div className="mt-4 space-y-4">
            {related.slice(0, 4).map((item) => (
              <Link key={item.id} href={`${basePath}/${item.slug}`} className="group grid grid-cols-[88px_1fr] gap-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E8DCCB] bg-[#FBF8F2]">
                  {item.thumbnail ? (
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="88px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[#B88746]">MH</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold leading-5 text-[#1F1B16] group-hover:text-[#B88746]">{item.title}</p>
                  {item.published_at && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C7A6B]">
                      <CalendarDays className="h-3.5 w-3.5 text-[#B88746]" />
                      {formatArticleDate(item.published_at)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link href={basePath} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#1F1B16] transition hover:border-[#B88746] hover:text-[#B88746]">
            {allBtnLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}

      <section className="overflow-hidden rounded-[22px] border border-[#E8DCCB]/80 bg-white shadow-[0_18px_50px_rgba(31,27,22,0.06)]">
        <div className="bg-[#1F1B16] p-5 text-white">
          <MessageSquareText className="h-7 w-7 text-[#D1A15F]" />
          <h2 className="mt-4 text-xl font-black leading-tight">Tư vấn nhanh</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Nhận thông tin dự án, bảng giá và chính sách mới nhất từ Masterise Homes.
          </p>
        </div>
        <div className="bg-[#FBF8F2] p-5">
          <a href="#global-contact-form" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#B88746] text-xs font-black uppercase text-white transition hover:bg-[#1F1B16]">
            Đăng ký tư vấn ngay
          </a>
        </div>
      </section>
    </aside>
  );
}
