import type { Post } from "@/types/api";
import { enhanceArticleHtmlWithHeadingIds } from "@/lib/articleContent";

type Props = {
  post: Post;
};

export default function NewsArticleMainContent({ post }: Props) {
  const html = enhanceArticleHtmlWithHeadingIds(post.content || "");

  if (!html) {
    return (
      <section className="rounded-[24px] border border-[#E8DCCB]/80 bg-white px-5 py-7 text-sm leading-7 text-[#8C7A6B] shadow-[0_18px_50px_rgba(31,27,22,0.06)] sm:px-8">
        Nội dung bài viết đang được cập nhật.
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-[#E8DCCB]/80 bg-white px-5 py-7 shadow-[0_18px_50px_rgba(31,27,22,0.06)] sm:px-8 sm:py-9">
      <article
        className="prose prose-stone max-w-none text-[15px] leading-8 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:tracking-normal prose-headings:text-[#1F1B16] prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-p:text-[#4B4238] prose-a:font-bold prose-a:text-[#B88746] prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-[#B88746] prose-blockquote:bg-[#FBF8F2] prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:text-[#6E5F51] prose-img:rounded-2xl prose-img:border prose-img:border-[#E8DCCB] sm:text-base"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
