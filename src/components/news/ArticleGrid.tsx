import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, X } from "lucide-react";
import { getPostDetailHref } from "@/lib/postRoutes";
import type { ApiResponse, Post } from "@/types/api";

type ArticleQuery = {
  category?: string;
  q?: string;
  tag?: string;
  sort?: string;
  page?: string;
};

const emptyMeta = { current_page: 1, last_page: 1, per_page: 9, total: 0 };

function queryHref(query: ArticleQuery, changes: Partial<Record<keyof ArticleQuery, string | null>>) {
  const params = new URLSearchParams();
  Object.entries({ ...query, ...changes }).forEach(([key, value]) => {
    if (value && !(key === "sort" && value === "latest") && !(key === "page" && value === "1")) params.set(key, value);
  });
  const value = params.toString();
  return `/tin-tuc${value ? `?${value}` : ""}#bai-viet-moi-nhat`;
}

export default function ArticleGrid({ response, query }: { response: ApiResponse<Post[]> | null; query: ArticleQuery }) {
  const articles = response?.data || [];
  const meta = response?.meta || emptyMeta;
  const tagName = articles.flatMap((article) => article.tags || []).find((tag) => tag.slug === query.tag)?.name || query.tag || "";
  const start = Math.max(1, Math.min(meta.current_page - 2, Math.max(1, meta.last_page - 4)));
  const pages = Array.from({ length: Math.min(5, meta.last_page) }, (_, index) => start + index);
  const filtered = Boolean(query.tag || query.q || query.category);

  return (
    <section id="bai-viet-moi-nhat" className="scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-font text-lg font-bold text-ink sm:text-xl">
            {query.tag ? `Chủ đề: ${tagName}` : filtered ? "Kết quả tìm kiếm" : "Khám phá bài viết mới nhất"}
          </h2>
          <p className="mt-1 text-xs text-muted">{meta.total} bài viết · Trang {meta.current_page}/{meta.last_page}</p>
        </div>
        {query.tag ? (
          <Link href={queryHref(query, { tag: null, page: null })} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-gold">
            <X size={13} /> Xóa lọc chủ đề
          </Link>
        ) : null}
      </div>

      {articles.length === 0 ? (
        <div className="rounded-[18px] border border-line/60 bg-white p-12 text-center text-sm text-muted">Không tìm thấy bài viết nào phù hợp.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={getPostDetailHref(article)} className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-line/50 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F3EEE6]">
                  <Image src={article.thumbnail || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop"} alt={article.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">{article.category?.name || "Tin tức"}</span>
                  <h3 className="heading-font mt-1.5 line-clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-gold">{article.title}</h3>
                  {article.summary ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{article.summary}</p> : null}
                  {article.tags?.length ? <div className="mt-3 flex flex-wrap gap-1">{article.tags.slice(0, 3).map((tag) => <span key={tag.id} className="rounded-full bg-beige px-2 py-1 text-[10px] font-semibold text-gold-dark">#{tag.name}</span>)}</div> : null}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted"><span className="inline-flex items-center gap-1"><Calendar size={12} />{article.published_at ? new Date(article.published_at).toLocaleDateString("vi-VN") : "Đang cập nhật"}</span></div>
                  <div className="mt-auto border-t border-line/20 pt-4"><span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">Đọc thêm <ArrowRight size={13} /></span></div>
                </div>
              </Link>
            ))}
          </div>

          {meta.last_page > 1 ? (
            <nav aria-label="Phân trang bài viết" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {meta.current_page > 1 ? <Link href={queryHref(query, { page: String(meta.current_page - 1) })} className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-bold"><ArrowLeft size={13} />Trang trước</Link> : <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-bold opacity-40"><ArrowLeft size={13} />Trang trước</span>}
              {pages.map((item) => <Link key={item} href={queryHref(query, { page: String(item) })} aria-current={item === meta.current_page ? "page" : undefined} className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-bold ${item === meta.current_page ? "border-gold bg-gold text-white" : "border-line bg-white text-ink"}`}>{item}</Link>)}
              {meta.current_page < meta.last_page ? <Link href={queryHref(query, { page: String(meta.current_page + 1) })} className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-bold">Trang sau<ArrowRight size={13} /></Link> : <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-bold opacity-40">Trang sau<ArrowRight size={13} /></span>}
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
