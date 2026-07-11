import Link from "next/link";
import type { Post } from "@/types/api";

export default function InlineRelatedArticleLinks({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <aside
      aria-label="Bài viết liên quan"
      className="not-prose my-7 rounded-r-2xl border-l-4 border-[#B88746] bg-[#FBF8F2] px-5 py-4"
    >
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8F632F]">Bài viết liên quan</p>
      <ul className="mt-3 space-y-2.5">
        {posts.map((post) => (
          <li key={post.id} className="flex gap-2 text-sm leading-6 text-[#4B4238]">
            <span aria-hidden className="text-[#B88746]">•</span>
            <Link
              href={`/tin-tuc/${post.slug}`}
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
