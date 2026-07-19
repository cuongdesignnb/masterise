import Link from "next/link";
import type { PostCard } from "@/types/api";
import { getPostDetailHref } from "@/lib/postRoutes";

type InlineRelatedArticle = Pick<PostCard, "id" | "title" | "slug" | "post_type">;

export default function InlineRelatedArticleLinks({ posts }: { posts: InlineRelatedArticle[] }) {
  if (!posts.length) return null;

  return (
    <aside
      aria-label="Bài viết liên quan"
      className="not-prose my-7 rounded-2xl border border-[#E8DCCB]/80 bg-[#FBF8F2] px-5 py-4"
    >
      <ul className="space-y-2.5">
        {posts.map((post) => (
          <li key={post.id} className="flex gap-2 text-sm leading-6 text-[#4B4238]">
            <span aria-hidden className="text-[#B88746]">•</span>
            <Link
              href={getPostDetailHref(post)}
              className="font-bold text-[#8F632F] underline-offset-4 transition hover:text-[#B88746] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/50"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
