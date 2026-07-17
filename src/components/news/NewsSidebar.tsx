import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import Button from "@/components/Button";
import type { Post, PostCategory } from "@/types/api";
import { getPostDetailHref } from "@/lib/postRoutes";

export default function NewsSidebar({ initialFeatured = [], initialCategories = [] }: { initialFeatured?: Post[]; initialCategories?: PostCategory[] }) {
  return (
    <aside className="flex flex-col gap-5">
      <div className="rounded-[18px] border border-line/50 bg-white p-5 shadow-soft">
        <h3 className="heading-font mb-4 text-base font-bold text-ink">Bài viết nổi bật</h3>
        {initialFeatured.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted">Chưa có bài viết nổi bật.</div>
        ) : (
          <ul className="space-y-3.5">
            {initialFeatured.map((post, index) => (
              <li key={post.id} className={`flex items-start gap-3 pb-3.5 ${index < initialFeatured.length - 1 ? "border-b border-line/30" : ""}`}>
                <span className="heading-font w-6 shrink-0 text-center text-lg font-bold leading-tight text-gold/30">{String(index + 1).padStart(2, "0")}</span>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-cream">
                  <Image src={post.thumbnail || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop"} alt={post.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={getPostDetailHref(post)} className="line-clamp-2 text-xs font-semibold text-ink transition-colors hover:text-gold">{post.title}</Link>
                  <p className="mt-1 text-[10px] text-muted">{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Đang cập nhật"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[18px] border border-line/50 bg-white p-5">
        <h3 className="heading-font mb-4 text-base font-bold text-ink">Chủ đề quan tâm</h3>
        {initialCategories.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted">Chưa có danh mục tin tức.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {initialCategories.map((topic) => (
              <Link key={topic.id} href={`/tin-tuc?category=${topic.slug}`} className="rounded-full bg-beige/60 px-3.5 py-1.5 text-[11px] font-semibold text-muted transition hover:bg-gold hover:text-white">
                {topic.name} ({topic.posts_count || 0})
              </Link>
            ))}
          </div>
        )}
        <Link href="/tin-tuc" className="mt-4 inline-block text-xs font-semibold text-gold hover:underline">Xem tất cả chủ đề →</Link>
      </div>

      <div className="relative overflow-hidden rounded-[18px] border border-line/50 bg-ivory p-5">
        <Mail size={72} className="pointer-events-none absolute -right-2 -top-2 text-gold/[0.06]" strokeWidth={1} />
        <h3 className="heading-font mb-2 text-base font-bold text-ink">Đăng ký nhận bản tin</h3>
        <p className="text-xs leading-relaxed text-muted">Nhận thông tin dự án mới, phân tích thị trường và ưu đãi độc quyền từ Masterise Homes.</p>
        <Button href="/lien-he#global-contact-form" variant="gold-gradient" className="mt-4 w-full" icon={<ArrowRight size={15} />}>Nhận bản tin ngay</Button>
      </div>
    </aside>
  );
}
