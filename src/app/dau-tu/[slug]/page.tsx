import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import NewsArticleHero from "@/components/news-detail/NewsArticleHero";
import NewsArticleMainContent from "@/components/news-detail/NewsArticleMainContent";
import NewsArticleSidebar from "@/components/news-detail/NewsArticleSidebar";
import NewsArticleMetaFooter from "@/components/news-detail/NewsArticleMetaFooter";
import NewsMediaBlocks from "@/components/news-detail/NewsMediaBlocks";
import NewsRelatedSection from "@/components/news-detail/NewsRelatedSection";
import { extractTocFromHtml, formatArticleDate, readingMinutes } from "@/lib/articleContent";
import ArticleToc from "@/components/news-detail/ArticleToc";
import { fetchApi } from "@/lib/serverApi";
import type { PostDetailData } from "@/types/api";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/config/seo";

const siteUrl = SITE_URL;

type Props = {
  params: Promise<{ slug: string }>;
};

type PostDetailResponse = PostDetailData;

async function getInvestmentPost(slug: string): Promise<PostDetailResponse | null> {
  const data = await fetchApi<PostDetailResponse>(`/posts/${slug}`);
  if (!data?.post) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getInvestmentPost(slug);
  const post = data?.post;

  if (!post) {
    return { title: "Không tìm thấy nội dung đầu tư | Masterise Homes" };
  }

  if (post.post_type === "news") {
    return {
      title: post.seo_meta?.title || `${post.title} | Masterise Homes`,
      description: post.seo_meta?.description || post.summary || undefined,
      alternates: { canonical: absoluteUrl(`/tin-tuc/${post.slug}`) },
    };
  }

  const basePath = `/dau-tu/${post.slug}`;

  return {
    title: post.seo_meta?.title || `${post.title} | Masterise Homes`,
    description: post.seo_meta?.description || post.summary || undefined,
    keywords: post.seo_meta?.keywords || undefined,
    alternates: { canonical: absoluteUrl(basePath) },
    openGraph: {
      title: post.seo_meta?.og_title || post.title,
      description: post.seo_meta?.og_description || post.summary || undefined,
      url: absoluteUrl(basePath),
      siteName: SITE_NAME,
      images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
      type: "article",
      locale: "vi_VN",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: [post.author?.name || "Masterise Homes"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_meta?.title || post.title,
      description: post.seo_meta?.description || post.summary || undefined,
      images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
    },
  };
}

export default async function InvestmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getInvestmentPost(slug);
  if (!data?.post) notFound();
  if (data.post.post_type === "news") permanentRedirect(`/tin-tuc/${data.post.slug}`);

  const { post, inline_related = [], related = [], previous = null, next = null } = data;
  const postUrl = `${siteUrl}/dau-tu/${post.slug}`;
  const completeContent = [post.intro_content, post.content].filter(Boolean).join("");
  const toc = extractTocFromHtml(completeContent);
  const publishedLabel = formatArticleDate(post.published_at);
  const minutes = readingMinutes(completeContent || post.summary);

  const isEvent = post.post_type === "event" && post.event_start_at;
  const jsonLd = isEvent
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: post.title,
        description: post.summary,
        image: post.thumbnail ? absoluteUrl(post.thumbnail) : undefined,
        startDate: post.event_start_at,
        endDate: post.event_end_at,
        location: post.event_location ? { "@type": "Place", name: post.event_location } : undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: post.summary,
        image: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: { "@type": "Person", name: post.author?.name || "Masterise Homes" },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": postUrl,
        },
      };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Đầu tư", item: `${siteUrl}/dau-tu` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb).replace(/</g, "\\u003c") }} />
      <Header />
      <MobileTabBar />
      <main className="relative z-10 bg-[#FBF8F2] pb-16 lg:pb-0">
        <NewsArticleHero post={post} publishedLabel={publishedLabel} minutes={minutes} />

        <Container>
          <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              {post.post_type === "event" && (
                <div className="rounded-[24px] border border-[#B88746]/30 bg-[#B88746]/5 p-6 text-left shadow-[0_18px_50px_rgba(184,135,70,0.04)]">
                  <h2 className="text-lg font-black text-[#1F1B16]">Thông tin sự kiện</h2>
                  <div className="mt-3 space-y-2 text-sm text-[#4B4238]">
                    <p>
                      <span className="font-bold text-[#1F1B16]">Thời gian:</span>{" "}
                      {post.event_start_at ? new Date(post.event_start_at).toLocaleString("vi-VN") : "Đang cập nhật"}
                      {post.event_end_at && ` - ${new Date(post.event_end_at).toLocaleString("vi-VN")}`}
                    </p>
                    {post.event_location && (
                      <p>
                        <span className="font-bold text-[#1F1B16]">Địa điểm:</span> {post.event_location}
                      </p>
                    )}
                  </div>
                  {post.event_register_url && (
                    <a
                      href={post.event_register_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#B88746] px-5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#1F1B16]"
                    >
                      Đăng ký tham dự
                    </a>
                  )}
                </div>
              )}
              <ArticleToc toc={toc} className="lg:hidden" />
              <NewsArticleMainContent post={post} related={inline_related} />
              <NewsMediaBlocks mediaItems={post.media_items} />
              <NewsArticleMetaFooter post={post} previous={previous} next={next} />
            </div>
            <NewsArticleSidebar toc={toc} related={related} postType={post.post_type} />
          </div>
        </Container>

        <NewsRelatedSection related={related} postType={post.post_type} />
        <GlobalContactForm defaultDemandType="Tìm cơ hội đầu tư" leadSourcePosition="investment_detail_footer_form" />
      </main>
      <Footer />
    </>
  );
}
