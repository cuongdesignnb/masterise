import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import type { HomepageHero } from "@/components/home/HomePageClient";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, Post, Project } from "@/types/api";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import { buildOperatorNode, buildWebSiteNode, buildWebPageNode } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  path: "/",
});

export default async function Home() {
  const [heroes, projects, posts, siteEntity] = await Promise.all([
    fetchApiResponse<ApiResponse<HomepageHero[]>>("/hero-banners", { cache: "no-store" }),
    fetchApiResponse<ApiResponse<Project[]>>("/projects/featured?limit=6", { revalidate: 300, tags: ["projects-featured"] }),
    fetchApiResponse<ApiResponse<Post[]>>("/posts?per_page=6&post_type=news", { revalidate: 180, tags: ["posts"] }),
    getSiteEntityConfig(),
  ]);

  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode();
  const webpageNode = buildWebPageNode(SITE_URL, `${SITE_NAME} - Bất động sản cao cấp và hạng sang`, SITE_DESCRIPTION);

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <HomePageClient
        initialHeroSlides={heroes?.data || []}
        initialProjects={projects?.data || []}
        initialPosts={posts?.data || []}
      />
    </>
  );
}
