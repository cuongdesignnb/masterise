import type { MetadataRoute } from "next";
import { fetchApi } from "@/lib/serverApi";
import type { Post, Project } from "@/types/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/du-an",
    "/tin-tuc",
    "/dau-tu",
    "/lien-he",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const projectsData = await fetchApi<Project[]>("/projects?per_page=100&sort_by=open_sale_at&sort_order=asc");
  const postsData = await fetchApi<Post[]>("/posts?per_page=100");

  const projectRoutes = (projectsData || [])
    .filter((project) => project.is_published)
    .map((project) => ({
      url: `${siteUrl}/du-an/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
    }));

  const postRoutes = (postsData || [])
    .filter((post) => post.status === "published")
    .map((post) => ({
      url: `${siteUrl}/${post.post_type === "news" ? "tin-tuc" : "dau-tu"}/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
