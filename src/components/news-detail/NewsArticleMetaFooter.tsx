import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Post, PostCard } from "@/types/api";
import { getPostDetailHref } from "@/lib/postRoutes";

type Props = {
  post: Post;
  previous?: PostCard | null;
  next?: PostCard | null;
};

function NavCard({ post, direction }: { post: PostCard; direction: "previous" | "next" }) {
  const isNews = post.post_type === "news";
  const path = getPostDetailHref(post);
  const label = direction === "previous"
    ? (isNews ? "Tin trước" : "Bài trước")
    : (isNews ? "Tin tiếp theo" : "Bài tiếp theo");

  return (
    <Link href={path} className="group grid grid-cols-[76px_1fr] gap-3 rounded-2xl border border-[#E8DCCB] bg-white p-3 transition hover:border-[#B88746] hover:shadow-[0_14px_36px_rgba(31,27,22,0.08)] sm:grid-cols-[96px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#FBF8F2]">
        {post.thumbnail ? (
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="96px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-black text-[#B88746]">MH</div>
        )}
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#B88746]">
          {direction === "previous" ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          {label}
        </span>
        <p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#1F1B16] group-hover:text-[#B88746]">{post.title}</p>
      </div>
    </Link>
  );
}

export default function NewsArticleMetaFooter({ post, previous, next }: Props) {
  const tags = post.tags || [];
  const tagBasePath = post.post_type === "investment" ? "/dau-tu" : "/tin-tuc";

  if (!tags.length && !previous && !next) return null;

  return (
    <section className="space-y-5">
      {tags.length > 0 && (
        <nav aria-label="Chủ đề bài viết" className="border-t border-[#E8DCCB] pt-4 text-sm text-[#6E5F51]">
          {tags.map((tag, index) => (
            <span key={tag.id}>
              {index > 0 ? <span aria-hidden="true" className="mx-2 text-[#C8B9A5]">|</span> : null}
              <Link href={`${tagBasePath}?tag=${encodeURIComponent(tag.slug)}`} className="font-medium transition hover:text-[#B88746] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/50">
                {tag.name}
              </Link>
            </span>
          ))}
        </nav>
      )}

      {(previous || next) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {previous ? <NavCard post={previous} direction="previous" /> : <div />}
          {next ? <NavCard post={next} direction="next" /> : <div />}
        </div>
      )}
    </section>
  );
}
