import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { getServerApiUrl } from "@/lib/serverApi";
import type { Post } from "@/types/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

type Props = {
  params: Promise<{ slug: string }>;
};

type PostDetailResponse = {
  post: Post;
  related: Post[];
  previous?: Post | null;
  next?: Post | null;
};

async function getPost(slug: string): Promise<PostDetailResponse | null> {
  const res = await fetch(`${getServerApiUrl()}/posts/${slug}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  const data = payload?.data as PostDetailResponse | undefined;
  if (!data?.post || data.post.post_type !== "news") return null;
  return data;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  const post = data?.post;

  if (!post) {
    return { title: "Không tìm thấy bài viết | Masterise Homes" };
  }

  return {
    title: post.seo_meta?.title || `${post.title} | Masterise Homes`,
    description: post.seo_meta?.description || post.summary || undefined,
    keywords: post.seo_meta?.keywords || undefined,
    alternates: { canonical: `/tin-tuc/${post.slug}` },
    openGraph: {
      title: post.seo_meta?.og_title || post.title,
      description: post.seo_meta?.og_description || post.summary || undefined,
      images: post.thumbnail ? [post.thumbnail] : undefined,
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
      images: post.thumbnail ? [post.thumbnail] : undefined,
    },
  };
}

export default async function NewsArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data?.post) notFound();

  const { post, related = [], previous = null, next = null } = data;
  const toc = extractTocFromHtml(post.content);
  const videos = (post.media_items || []).filter((item) => (item.type === "youtube" || item.type === "video_upload") && item.url);
  const publishedLabel = formatArticleDate(post.published_at);
  const minutes = readingMinutes(post.content || post.summary);

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    image: post.thumbnail,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author?.name || "Masterise Homes" },
    publisher: {
      "@type": "Organization",
      name: "Masterise Homes",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: `${siteUrl}/tin-tuc/${post.slug}`,
  };

  const jsonLdVideos = videos.map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title || post.title,
    description: post.summary || post.title,
    thumbnailUrl: video.thumbnail_url || post.thumbnail || undefined,
    uploadDate: post.published_at || post.created_at,
    contentUrl: video.type === "video_upload" ? video.url : undefined,
    embedUrl: video.type === "youtube" ? getYouTubeEmbedUrl(video.url) : undefined,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      {jsonLdVideos.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Header />
      <MobileTabBar />
      <main className="relative z-10 bg-[#FBF8F2] pb-16 lg:pb-0">
        <NewsArticleHero post={post} publishedLabel={publishedLabel} minutes={minutes} />

        <Container>
          <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <NewsArticleMainContent post={post} />
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
