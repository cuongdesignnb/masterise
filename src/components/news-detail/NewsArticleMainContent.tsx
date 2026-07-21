import type { Post, PostCard } from "@/types/api";
import { enhanceArticleHtml, splitArticleIntroAndMain, stripHtml } from "@/lib/articleContent";
import InlineRelatedArticleLinks from "@/components/news-detail/InlineRelatedArticleLinks";
import RichHtmlContent from "@/components/content/RichHtmlContent";

type Props = {
  post: Post;
  related?: PostCard[];
};

export default function NewsArticleMainContent({ post, related = [] }: Props) {
  const hasOfficialIntro = post.intro_content !== null && post.intro_content !== undefined;
  const imageAltFallback = post.title.trim();
  const legacyHtml = hasOfficialIntro ? "" : enhanceArticleHtml(post.content || "", imageAltFallback);
  const legacySplit = splitArticleIntroAndMain(legacyHtml);
  const introHtml = hasOfficialIntro
    ? enhanceArticleHtml(post.intro_content || "", imageAltFallback)
    : legacySplit.introHtml;
  const mainHtml = hasOfficialIntro
    ? enhanceArticleHtml(post.content || "", imageAltFallback)
    : legacySplit.mainHtml;
  const summaryText = stripHtml(post.summary);
  const introText = stripHtml(introHtml);
  const showSummary = Boolean(summaryText) && !introText.includes(summaryText.slice(0, 100));
  const inlineRelated = related
    .filter((item, index, items) =>
      item.status === "published" &&
      Boolean(item.slug) &&
      item.id !== post.id &&
      items.findIndex((candidate) => candidate.id === item.id) === index,
    )
    .slice(0, 3);

  if (!showSummary && !introHtml && !mainHtml) {
    return (
      <section className="rounded-[24px] border border-[#E8DCCB]/80 bg-white px-5 py-7 text-sm leading-7 text-[#8C7A6B] shadow-[0_18px_50px_rgba(31,27,22,0.06)] sm:px-8">
        Nội dung bài viết đang được cập nhật.
      </section>
    );
  }

  return (
    <section className="min-w-0 max-w-full rounded-[24px] border border-[#E8DCCB]/80 bg-white px-5 py-7 shadow-[0_18px_50px_rgba(31,27,22,0.06)] sm:px-8 sm:py-9">
      <article
        className="prose prose-stone min-w-0 max-w-none text-[15px] leading-8 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:tracking-normal prose-headings:text-[#1F1B16] prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-p:text-[#4B4238] prose-a:font-bold prose-a:text-[#B88746] prose-a:underline-offset-4 hover:prose-a:underline focus-visible:prose-a:rounded-sm focus-visible:prose-a:outline-none focus-visible:prose-a:ring-2 focus-visible:prose-a:ring-[#B88746]/50 prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-[#B88746] prose-blockquote:bg-[#FBF8F2] prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:text-[#6E5F51] prose-img:rounded-2xl prose-img:border prose-img:border-[#E8DCCB] sm:text-base"
      >
        {showSummary ? <p className="!mb-7 !text-[17px] !font-medium !leading-8 text-[#2F2A24] sm:!text-lg">{summaryText}</p> : null}
        <RichHtmlContent html={introHtml} />
        {inlineRelated.length ? <InlineRelatedArticleLinks posts={inlineRelated} /> : null}
        <RichHtmlContent html={mainHtml} />
      </article>
      <style>{`
        .article-table-scroll { width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; margin: 1.5rem 0; border: 1px solid #e8dccb; border-radius: 16px; background: #fff; box-shadow: 0 12px 30px rgba(87, 61, 28, .06); overscroll-behavior-inline: contain; -webkit-overflow-scrolling: touch; }
        .article-table-scroll table { width: 100%; min-width: max(100%, var(--article-table-min-width, 680px)); table-layout: fixed; border-collapse: separate; border-spacing: 0; background: #fff; }
        .article-table-scroll th, .article-table-scroll td { min-width: 0; border-right: 1px solid #e8dccb; border-bottom: 1px solid #e8dccb; padding: 11px 12px; vertical-align: top; white-space: normal; overflow-wrap: anywhere; word-break: normal; }
        .article-table-scroll th:last-child, .article-table-scroll td:last-child { border-right: 0; }
        .article-table-scroll tr:last-child > th, .article-table-scroll tr:last-child > td { border-bottom: 0; }
        .article-table-scroll thead th, .article-table-scroll tr:first-child > th { background: #fbf8f2; color: #1f1b16; font-weight: 800; }
        .article-table-scroll[data-column-count="1"] table,
        .article-table-scroll[data-column-count="2"] table { min-width: 100%; table-layout: fixed; }
        .article-table-scroll[data-column-count="2"] th:first-child,
        .article-table-scroll[data-column-count="2"] td:first-child { width: 42%; }
        .article-table-scroll[data-column-count="2"] th,
        .article-table-scroll[data-column-count="2"] td { font-size: 13px; line-height: 1.55; }
        .article-table-scroll:focus-visible { outline: 2px solid #b88746; outline-offset: 2px; }
        @media (min-width: 640px) {
          .article-table-scroll table { table-layout: auto; }
          .article-table-scroll[data-column-count="1"] table,
          .article-table-scroll[data-column-count="2"] table { table-layout: fixed; }
          .article-table-scroll th, .article-table-scroll td { padding: 12px 14px; }
        }
      `}</style>
    </section>
  );
}
