import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, Post, PostCategory } from "@/types/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import NewsHero from "@/components/news/NewsHero";
import NewsFilterBar from "@/components/news/NewsFilterBar";
import NewsSidebar from "@/components/news/NewsSidebar";
import ArticleGrid from "@/components/news/ArticleGrid";
import NewsCTA from "@/components/news/NewsCTA";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildOperatorContext,
} from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const query = await searchParams;
  const hasFilters = !!(
    first(query.category) ||
    first(query.q) ||
    first(query.tag) ||
    (first(query.page) && first(query.page) !== "1")
  );

  return buildMetadata({
    title: "Tin tức & Góc nhìn thị trường",
    description: "Cập nhật tin tức mới nhất về dự án, xu hướng thị trường bất động sản, pháp lý, kiến trúc và phong cách sống từ Masterise Homes.",
    keywords: ["tin tức Masterise Homes", "tin tức bất động sản", "thị trường bất động sản", "dự án Masterise Homes"],
    path: "/tin-tuc",
    noindex: hasFilters,
  });
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const postParams: Record<string, string> = {
    per_page: "9",
    page: first(query.page) || "1",
    post_type: "news,investment",
    sort: first(query.sort) || "latest",
    status: "published",
  };
  for (const key of ["category", "q", "tag"] as const) {
    const value = first(query[key]);
    if (value) postParams[key] = value;
  }

  const postQuery = new URLSearchParams(postParams).toString();
  const [initialPosts, featuredResponse, categoriesResponse, siteEntity] = await Promise.all([
    fetchApiResponse<ApiResponse<Post[]>>(`/posts?${postQuery}`, { revalidate: 180, tags: ["posts"] }),
    fetchApiResponse<ApiResponse<Post[]>>("/posts/featured?limit=5&post_type=news,investment", { revalidate: 300, tags: ["posts-featured"] }),
    fetchApiResponse<ApiResponse<PostCategory[]>>("/post-categories?post_type=news,investment&exclude_post_type=event", { revalidate: 600, tags: ["post-taxonomy"] }),
    getSiteEntityConfig(),
  ]);
  const featuredPosts = featuredResponse?.data || [];
  const featuredHero = featuredPosts.find((post) => post.post_type === "news") || null;
  const heroPost = featuredHero || initialPosts?.data?.[0] || null;

  const pageUrl = `${SITE_URL}/tin-tuc`;
  const newsList = initialPosts?.data || [];

  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode(buildOperatorContext(siteEntity));
  const webpageNode = {
    ...buildWebPageNode(pageUrl, "Tin tức & Góc nhìn thị trường", "Cập nhật tin tức mới nhất về bất động sản", { breadcrumbId: `${pageUrl}#breadcrumb` }),
    '@type': 'CollectionPage',
  };
  const breadcrumbNode = buildBreadcrumbSchema(pageUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Tin tức", item: "/tin-tuc" },
  ]);

  const itemListNode = newsList.length > 0 ? buildItemListSchema(
    pageUrl,
    "Tin tức Masterise Homes",
    newsList.map((p) => ({ name: p.title, url: `/${p.slug}` }))
  ) : null;

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    itemListNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <Header />
      <MobileTabBar />
      <main className="relative z-10 bg-[#FBF8F2] pb-16 lg:pb-0">
        <NewsHero post={heroPost} postLabel="Tin mới nhất" />
        <NewsFilterBar categories={categoriesResponse?.data || []} />
        <Container className="py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <ArticleGrid response={initialPosts} query={postParams as any} />
            <NewsSidebar initialFeatured={featuredPosts} initialCategories={categoriesResponse?.data || []} />
          </div>
        </Container>
        <NewsCTA />
        <GlobalContactForm leadSourcePosition="news_footer_form" />
      </main>
      <Footer />
    </>
  );
}
