import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import type { HomepageHero } from "@/components/home/HomePageClient";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, Post, Project } from "@/types/api";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "vi_VN",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function Home() {
  const [heroes, projects, posts] = await Promise.all([
    fetchApiResponse<ApiResponse<HomepageHero[]>>("/hero-banners", { cache: "no-store" }),
    fetchApiResponse<ApiResponse<Project[]>>("/projects/featured?limit=6", { revalidate: 300, tags: ["projects-featured"] }),
    fetchApiResponse<ApiResponse<Post[]>>("/posts?per_page=6&post_type=news", { revalidate: 180, tags: ["posts"] }),
  ]);

  return <HomePageClient initialHeroSlides={heroes?.data || []} initialProjects={projects?.data || []} initialPosts={posts?.data || []} />;
}
