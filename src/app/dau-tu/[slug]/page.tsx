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

type Props = {
  params: Promise<{ slug: string }>;
};

async function getInvestmentPost(slug: string) {
  const data = await fetchApi<{ post: Post; related: Post[] }>(`/posts/${slug}`);
  if (!data?.post || !["investment", "event"].includes(data.post.post_type)) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getInvestmentPost(slug);
  const post = data?.post;

  if (!post) return { title: "Không tìm thấy nội dung đầu tư | Masterise Homes" };

  return {
    title: post.seo_meta?.title || `${post.title} | Masterise Homes`,
    description: post.seo_meta?.description || post.summary || undefined,
    alternates: { canonical: `/dau-tu/${post.slug}` },
    openGraph: {
      title: post.seo_meta?.og_title || post.title,
      description: post.seo_meta?.og_description || post.summary || undefined,
      images: post.thumbnail ? [post.thumbnail] : undefined,
      type: "article",
      locale: "vi_VN",
    },
  };
}

export default async function InvestmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getInvestmentPost(slug);
  if (!data?.post) notFound();

  const { post, related = [] } = data;
  const isEvent = post.post_type === "event" && post.event_start_at;
  const jsonLd = isEvent
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: post.title,
        description: post.summary,
        image: post.thumbnail,
        startDate: post.event_start_at,
        endDate: post.event_end_at,
        location: post.event_location ? { "@type": "Place", name: post.event_location } : undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.summary,
        image: post.thumbnail,
        datePublished: post.published_at,
      };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <section className="bg-ink pt-28 text-white">
          <Container className="py-12 text-left">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {post.post_type === "event" ? "Sự kiện" : "Cơ hội đầu tư"}
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{post.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">{post.summary}</p>
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
          {post.post_type === "event" && (
            <div className="mb-6 rounded-lg border border-gold/30 bg-gold/5 p-5 text-left">
              <h2 className="text-lg font-black text-ink">Thông tin sự kiện</h2>
              <p className="mt-2 text-sm text-muted">Thời gian: {post.event_start_at ? new Date(post.event_start_at).toLocaleString("vi-VN") : "Đang cập nhật"}</p>
              {post.event_location && <p className="mt-1 text-sm text-muted">Địa điểm: {post.event_location}</p>}
              {post.event_register_url && <a href={post.event_register_url} className="mt-4 inline-flex rounded-md bg-gold px-4 py-2 text-sm font-bold text-white">Đăng ký tham dự</a>}
            </div>
          )}
          <article
            className="max-w-none py-8 text-left text-sm leading-7 text-ink"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
          {related.length > 0 && (
            <section className="border-t border-line py-10 text-left">
              <h2 className="text-xl font-black text-ink">Bài đầu tư liên quan</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.filter((item) => ["investment", "event"].includes(item.post_type)).map((item) => (
                  <a key={item.id} href={`/dau-tu/${item.slug}`} className="rounded-lg border border-line bg-white p-4 hover:border-gold">
                    <p className="line-clamp-2 text-sm font-bold text-ink">{item.title}</p>
                  </a>
                ))}
              </div>
            </section>
          )}
        </Container>
        <GlobalContactForm defaultDemandType="Tìm cơ hội đầu tư" leadSourcePosition="investment_detail_footer_form" />
      </main>
      <Footer />
    </>
  );
}
