import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, UserRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import NewsMediaBlocks from "@/components/news-detail/NewsMediaBlocks";
import { getServerApiUrl } from "@/lib/serverApi";
import type { Post } from "@/types/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  const res = await fetch(`${getServerApiUrl()}/posts/${slug}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  const data = payload?.data as { post: Post; related: Post[] } | undefined;
  if (!data?.post || data.post.post_type !== "news") return null;
  return data;
}

function stripHtml(value?: string | null) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function readingMinutes(value?: string | null) {
  const words = stripHtml(value).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
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

  const { post, related = [] } = data;
  const videos = (post.media_items || []).filter((item) => (item.type === "youtube" || item.type === "video_upload") && item.url);
  const publishedLabel = post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : null;
  const minutes = readingMinutes(post.content);
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
    embedUrl: video.type === "youtube" ? video.url : undefined,
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
        <section className="border-b border-line/60 bg-white pt-24 sm:pt-28">
          <Container className="py-8 sm:py-10">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
              <Link href="/" className="hover:text-gold">Trang chủ</Link>
              <span>/</span>
              <Link href="/tin-tuc" className="hover:text-gold">Tin tức</Link>
              <span>/</span>
              <span className="text-ink">{post.category?.name || "Bài viết"}</span>
            </nav>

            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
                {post.category?.name || "Tin tức"}
              </div>
              <h1 className="mt-4 max-w-4xl text-2xl font-black leading-tight text-ink sm:text-4xl lg:text-[42px]">
                {post.title}
              </h1>
              {post.summary && (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
                  {post.summary}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-4 w-4 text-gold" />
                  {post.author?.name || "Masterise Homes"}
                </span>
                {publishedLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-gold" />
                    {publishedLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-gold" />
                  {minutes} phút đọc
                </span>
              </div>
            </div>
          </Container>
        </section>
        {post.thumbnail && (
          <Container className="py-6 sm:py-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line/60 bg-white shadow-sm">
              <Image src={post.thumbnail} alt={post.title} fill priority className="object-cover" />
            </div>
          </Container>
        )}
        <Container>
          <NewsMediaBlocks mediaItems={post.media_items} />
        </Container>
        <Container className="pb-10">
          <article
            className="prose prose-neutral mx-auto max-w-3xl rounded-lg bg-white px-5 py-7 text-left text-[15px] leading-8 shadow-sm prose-headings:font-black prose-headings:text-ink prose-p:text-[#4B4238] prose-a:text-gold prose-img:rounded-lg sm:px-8 sm:py-9 sm:text-base"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
          {related.length > 0 && (
            <section className="mx-auto mt-8 max-w-5xl border-t border-line py-8 text-left">
              <h2 className="text-lg font-black text-ink sm:text-xl">Bài viết liên quan</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="rounded-lg border border-line bg-white p-4 transition hover:border-gold hover:shadow-sm">
                    <p className="line-clamp-2 text-sm font-bold leading-6 text-ink">{item.title}</p>
                    {item.published_at && (
                      <p className="mt-3 text-[11px] font-semibold text-muted">
                        {new Date(item.published_at).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Container>
        <GlobalContactForm leadSourcePosition="news_detail_footer_form" />
      </main>
      <Footer />
    </>
  );
}
