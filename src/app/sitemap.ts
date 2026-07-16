import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/config/seo";
import { fetchApi } from "@/lib/serverApi";
import { getPublicPages } from "@/services/pageServerService";
import type { Post, Project } from "@/types/api";
import type { CareerJob } from "@/types/career";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function sitemapEntry(path: string, priority: number, changeFrequency: ChangeFrequency): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
    priority,
    changeFrequency,
  };
}

function cleanImages(images: Array<string | null | undefined>) {
  return Array.from(new Set(images.filter(Boolean).map((image) => absoluteUrl(image as string))));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    sitemapEntry("", 1, "daily"),
    sitemapEntry("/du-an", 0.9, "daily"),
    sitemapEntry("/tin-tuc", 0.8, "daily"),
    sitemapEntry("/dau-tu", 0.8, "daily"),
    sitemapEntry("/chuyen-trang", 0.65, "weekly"),
    sitemapEntry("/ai-summary", 0.55, "monthly"),
    sitemapEntry("/gioi-thieu", 0.7, "monthly"),
    sitemapEntry("/lien-he", 0.7, "monthly"),
    sitemapEntry("/tuyen-dung", 0.75, "daily"),
  ];

  const [projectsData, postsData, pagesData, careersData] = await Promise.all([
    fetchApi<Project[]>("/projects?per_page=100&sort_by=open_sale_at&sort_order=asc"),
    fetchApi<Post[]>("/posts?per_page=100"),
    getPublicPages(),
    fetchApi<CareerJob[]>("/career/jobs?per_page=100"),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = (projectsData || [])
    .filter((project) => project.is_published)
    .map((project) => {
      const images = cleanImages([
        project.banner_image,
        project.thumbnail,
        ...(project.gallery || []),
        ...(project.detail_gallery || []),
        project.map_image_url,
      ]);

      return {
        url: `${SITE_URL}/du-an/${project.slug}`,
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: project.is_hot || project.is_featured ? 0.9 : 0.82,
        images: images.length ? images : undefined,
      };
    });

  const postRoutes: MetadataRoute.Sitemap = (postsData || [])
    .filter((post) => post.status === "published")
    .map((post) => {
      const isNews = post.post_type === "news";
      return {
        url: `${SITE_URL}/${isNews ? "tin-tuc" : "dau-tu"}/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: post.is_featured ? 0.78 : 0.68,
        images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
      };
    });

  const pageRoutes: MetadataRoute.Sitemap = (pagesData || [])
    .filter((page) => page.status === "published")
    .map((page) => ({
      url: `${SITE_URL}/chuyen-trang/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.6,
    }));

  const careerRoutes: MetadataRoute.Sitemap = (careersData || []).map((job) => ({
    url: `${SITE_URL}/tuyen-dung/${job.slug}`,
    lastModified: job.updated_at ? new Date(job.updated_at) : new Date(),
    changeFrequency: "weekly" as ChangeFrequency,
    priority: job.is_featured ? 0.78 : 0.68,
    images: job.banner_image || job.thumbnail ? [absoluteUrl(job.banner_image || job.thumbnail || "")] : undefined,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...pageRoutes, ...careerRoutes];
}
