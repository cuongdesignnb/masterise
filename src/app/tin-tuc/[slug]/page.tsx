import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import { fetchApi } from "@/lib/serverApi";
import type { Post } from "@/types/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  const data = await fetchApi<{ post: Post; related: Post[] }>(`/posts/${slug}`);
  if (!data?.post || data.post.post_type !== "news") return null;
  return data;
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
    alternates: { canonical: `/tin-tuc/${post.slug}` },
    openGraph: {
      title: post.seo_meta?.og_title || post.title,
      description: post.seo_meta?.og_description || post.summary || undefined,
      images: post.thumbnail ? [post.thumbnail] : undefined,
      type: "article",
      locale: "vi_VN",
    },
  };
}

export default async function NewsArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data?.post) notFound();

  const { post, related = [] } = data;
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    image: post.thumbnail,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author?.name || "Masterise Homes" },
    publisher: { "@type": "Organization", name: "Masterise Homes" },
    mainEntityOfPage: `${siteUrl}/tin-tuc/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <section className="bg-ink pt-28 text-white">
          <Container className="py-12 text-left">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {post.category?.name || "Tin tức"}
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{post.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">{post.summary}</p>
            {post.published_at && (
              <p className="mt-4 text-xs text-white/60">{new Date(post.published_at).toLocaleDateString("vi-VN")}</p>
            )}
          </Container>
        </section>
        {post.thumbnail && (
          <Container className="py-8">
            <div className="relative aspect-[16/8] overflow-hidden rounded-lg">
              <Image src={post.thumbnail} alt={post.title} fill priority className="object-cover" />
            </div>
          </Container>
        )}
        <Container>
          <article
            className="prose prose-neutral max-w-none py-8 text-left prose-headings:font-black prose-a:text-gold"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
          {related.length > 0 && (
            <section className="border-t border-line py-10 text-left">
              <h2 className="text-xl font-black text-ink">Bài liên quan</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <a key={item.id} href={`/tin-tuc/${item.slug}`} className="rounded-lg border border-line bg-white p-4 hover:border-gold">
                    <p className="line-clamp-2 text-sm font-bold text-ink">{item.title}</p>
                  </a>
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
