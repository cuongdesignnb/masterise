import type { Post } from "@/types/api";
import { enhanceArticleHtml, splitArticleIntroAndMain } from "@/lib/articleContent";
import InlineRelatedArticleLinks from "@/components/news-detail/InlineRelatedArticleLinks";

type Props = {
  post: Post;
  related?: Post[];
};

export default function NewsArticleMainContent({ post, related = [] }: Props) {
  const html = enhanceArticleHtml(post.content || "");
  const inlineRelated = related
    .filter((item, index, items) =>
      item.status === "published" &&
      Boolean(item.slug) &&
      item.id !== post.id &&
      items.findIndex((candidate) => candidate.id === item.id) === index,
    )
    .slice(0, 3);
  const { introHtml, mainHtml } = splitArticleIntroAndMain(html);

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
        className="prose prose-stone max-w-none text-[15px] leading-8 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:tracking-normal prose-headings:text-[#1F1B16] prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-p:text-[#4B4238] prose-a:font-bold prose-a:text-[#B88746] prose-a:underline-offset-4 hover:prose-a:underline focus-visible:prose-a:rounded-sm focus-visible:prose-a:outline-none focus-visible:prose-a:ring-2 focus-visible:prose-a:ring-[#B88746]/50 prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-[#B88746] prose-blockquote:bg-[#FBF8F2] prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:text-[#6E5F51] prose-img:rounded-2xl prose-img:border prose-img:border-[#E8DCCB] sm:text-base"
      >
        <div dangerouslySetInnerHTML={{ __html: introHtml }} />
        {mainHtml && inlineRelated.length ? <InlineRelatedArticleLinks posts={inlineRelated} /> : null}
        {mainHtml ? <div dangerouslySetInnerHTML={{ __html: mainHtml }} /> : null}
      </article>
      <style>{`
        .article-table-scroll { width: 100%; max-width: 100%; overflow-x: auto; margin: 1.5rem 0; border-radius: 14px; -webkit-overflow-scrolling: touch; }
        .article-table-scroll table { width: 100%; min-width: 680px; border-collapse: collapse; background: #fff; }
        .article-table-scroll th, .article-table-scroll td { border: 1px solid #e8dccb; padding: 10px 12px; text-align: left; vertical-align: top; white-space: normal; }
        .article-table-scroll thead th { background: #fbf8f2; color: #1f1b16; font-weight: 700; }
        .article-table-scroll:focus-visible { outline: 2px solid #b88746; outline-offset: 2px; }
      `}</style>
    </section>
  );
}
