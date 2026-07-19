import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { ProjectRelatedPost } from "@/types/api";

function postHref(post: ProjectRelatedPost) {
  return `/${post.slug}`;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : null;
}

export default function ProjectRelatedPostsSection({ posts }: { posts: ProjectRelatedPost[] }) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="project-related-posts-title" className="rounded-[22px] border border-line/80 bg-white p-5 shadow-soft sm:p-7">
      <div className="mb-5">
        <p className="text-[11px] font-bold tracking-[0.16em] text-gold">Góc nhìn chuyên sâu</p>
        <h2 id="project-related-posts-title" className="heading-font mt-2 text-2xl font-semibold text-ink sm:text-[30px]">Bài viết liên quan</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <Link key={post.id} href={postHref(post)} className="group flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-line/70 bg-[#fcfaf6] transition hover:-translate-y-1 hover:border-gold hover:shadow-soft">
            <div className="relative aspect-[16/10] overflow-hidden bg-beige">
              {post.thumbnail ? (
                <Image src={post.thumbnail} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-black text-gold">MASTERISE HOMES</div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[10px] font-bold tracking-[0.12em] text-gold">{post.category?.name || "Tin tức"}</p>
              <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-6 text-ink transition group-hover:text-gold">{post.title}</h3>
              {post.excerpt ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{post.excerpt}</p> : null}
              <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[11px] font-semibold text-muted">
                {formatDate(post.published_at) ? <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-gold" />{formatDate(post.published_at)}</span> : <span />}
                <span className="inline-flex items-center gap-1 text-gold">Đọc bài <ArrowRight className="h-3.5 w-3.5" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
