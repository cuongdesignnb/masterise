import { Suspense } from "react";
import type { Metadata } from "next";
import { SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, Post, PostCategory } from "@/types/api";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "Tin tức & Góc nhìn thị trường | Masterise Homes",
  description: "Cập nhật tin tức mới nhất về dự án, xu hướng thị trường bất động sản, pháp lý, kiến trúc và phong cách sống từ Masterise Homes.",
  keywords: ["tin tức Masterise Homes", "tin tức bất động sản", "thị trường bất động sản", "dự án Masterise Homes"],
  openGraph: {
    title: "Tin tức & Góc nhìn thị trường | Masterise Homes",
    description: "Cập nhật thông tin mới nhất về dự án, thị trường, pháp lý, kiến trúc và phong cách sống từ Masterise Homes.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: { canonical: "/tin-tuc" },
};

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function NewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const postParams: Record<string, string> = {
    per_page: "9",
    page: first(query.page) || "1",
    post_type: "news",
    sort: first(query.sort) || "latest",
    status: "published",
  };
  for (const key of ["category", "q", "tag"] as const) {
    const value = first(query[key]);
    if (value) postParams[key] = value;
  }

  const postQuery = new URLSearchParams(postParams).toString();
  const [initialPosts, featuredResponse, categoriesResponse] = await Promise.all([
    fetchApiResponse<ApiResponse<Post[]>>(`/posts?${postQuery}`, { revalidate: 180, tags: ["posts"] }),
    fetchApiResponse<ApiResponse<Post[]>>("/posts/featured?limit=5&post_type=news,investment", { revalidate: 300, tags: ["posts-featured"] }),
    fetchApiResponse<ApiResponse<PostCategory[]>>("/post-categories?post_type=news,investment&exclude_post_type=event", { revalidate: 600, tags: ["post-taxonomy"] }),
  ]);
  const featuredPosts = featuredResponse?.data || [];
  const featuredHero = featuredPosts.find((post) => post.post_type === "news") || null;
  const heroPost = featuredHero || initialPosts?.data?.[0] || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Masterise Homes", url: SITE_URL, logo: `${SITE_URL}/logo.png` },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tin tức", item: `${SITE_URL}/tin-tuc` },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Tin tức & Góc nhìn thị trường",
        description: "Danh sách bài viết cập nhật thông tin dự án, thị trường, pháp lý, kiến trúc và phong cách sống.",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<div className="bg-cream py-20 text-center text-sm text-muted">Đang tải trang tin tức...</div>}>
        <NewsClient
          heroPost={heroPost}
          heroPostLabel={featuredHero ? "Bài viết nổi bật" : "Bài viết mới nhất"}
          initialPosts={initialPosts}
          initialPostQuery={postQuery}
          initialFeatured={featuredPosts}
          initialCategories={categoriesResponse?.data || []}
        />
      </Suspense>
    </>
  );
}
