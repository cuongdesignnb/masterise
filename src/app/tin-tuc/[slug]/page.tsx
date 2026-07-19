import type { Metadata } from "next";
import { cache } from "react";
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
import { extractTocFromHtml, formatArticleDate, readingMinutes, stripHtml } from "@/lib/articleContent";
import ArticleToc from "@/components/news-detail/ArticleToc";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, PostDetailData } from "@/types/api";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/config/seo";

const siteUrl = SITE_URL;

type Props = {
  params: Promise<{ slug: string }>;
};

type PostDetailResponse = PostDetailData;

const getPost = cache(async (slug: string): Promise<PostDetailResponse | null> => {
  const payload = await fetchApiResponse<ApiResponse<PostDetailResponse>>(`/posts/${slug}`, {
    revalidate: 60,
    tags: ["posts", `post-${slug}`],
  });
  return payload?.data?.post ? payload.data : null;
});

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    let id = "";
    if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (!id && parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (!id && parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (!id) id = parsed.searchParams.get("v") || "";
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function getPostMetaDescription(post: PostDetailResponse["post"]) {
  const explicitDescription = post.seo_meta?.description?.trim();
  if (explicitDescription) return explicitDescription;

  const fallback = stripHtml(post.summary || post.intro_content || post.content || post.title);
  if (fallback.length <= 180) return fallback;

  const shortened = fallback.slice(0, 180);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 120 ? lastSpace : 180).trim()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  const post = data?.post;

  if (!post) {
    return { title: "Không tìm thấy bài viết | Masterise Homes" };
  }

  const description = getPostMetaDescription(post);

  if (post.post_type !== "news") {
    return {
      title: post.seo_meta?.title || `${post.title} | Masterise Homes`,
      description,
      alternates: { canonical: absoluteUrl(`/${post.slug}`) },
    };
  }

  return {
    title: post.seo_meta?.title || `${post.title} | Masterise Homes`,
    description,
    keywords: post.seo_meta?.keywords || undefined,
    alternates: { canonical: absoluteUrl(`/${post.slug}`) },
    openGraph: {
      title: post.seo_meta?.og_title || post.title,
      description: post.seo_meta?.og_description?.trim() || description,
      url: absoluteUrl(`/${post.slug}`),
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
      description,
      images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
    },
  };
}

export default async function NewsArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data?.post) notFound();
  if (data.post.post_type !== "news") permanentRedirect(`/${data.post.slug}`);

  const { post, inline_related = [], related = [], previous = null, next = null } = data;
  const postUrl = `${siteUrl}/${post.slug}`;
  const metaDescription = getPostMetaDescription(post);
  const completeContent = [post.intro_content, post.content].filter(Boolean).join("");
  const toc = extractTocFromHtml(completeContent);
  const videos = (post.media_items || []).filter((item) => (item.type === "youtube" || item.type === "video_upload") && item.url);
  const publishedLabel = formatArticleDate(post.published_at);
  const minutes = readingMinutes(completeContent || post.summary);

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: metaDescription,
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
      { "@type": "ListItem", position: 2, name: "Tin tức", item: `${siteUrl}/tin-tuc` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  const jsonLdVideos = videos.map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title || post.title,
    description: metaDescription,
    thumbnailUrl: video.thumbnail_url || post.thumbnail || undefined,
    uploadDate: post.published_at || post.created_at,
    contentUrl: video.type === "video_upload" ? video.url : undefined,
    embedUrl: video.type === "youtube" ? getYouTubeEmbedUrl(video.url) : undefined,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb).replace(/</g, "\\u003c") }} />
      {jsonLdVideos.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      ))}
      <Header />
      <MobileTabBar />
      <main className="relative z-10 bg-[#FBF8F2] pb-16 lg:pb-0">
        <NewsArticleHero post={post} publishedLabel={publishedLabel} minutes={minutes} />

        <Container>
          <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <ArticleToc toc={toc} className="lg:hidden" />
              <NewsArticleMainContent post={post} related={inline_related} />
              <NewsMediaBlocks mediaItems={post.media_items} />
              <NewsArticleMetaFooter post={post} previous={previous} next={next} />
            </div>
            <NewsArticleSidebar toc={toc} related={related} />
          </div>
        </Container>

        <NewsRelatedSection related={related} />
        <GlobalContactForm leadSourcePosition="news_detail_footer_form" />
      </main>
      <Footer />
    </>
  );
}
