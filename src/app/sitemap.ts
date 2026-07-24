import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import { getPublicPages } from "@/services/pageServerService";
import type { ApiResponse, Post, Project } from "@/types/api";
import type { CareerJob } from "@/types/career";
import { getProjectVideo } from "@/lib/video/projectVideo";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function sitemapEntry(path: string, priority: number, changeFrequency: ChangeFrequency): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    priority,
    changeFrequency,
  };
}

function cleanImages(images: Array<string | null | undefined>) {
  return Array.from(new Set(images.filter(Boolean).map((image) => absoluteUrl(image as string))));
}

async function fetchAllPages<T>(endpoint: string, perPage: number): Promise<T[]> {
  try {
    const separator = endpoint.includes("?") ? "&" : "?";
    const firstPage = await fetchApiResponse<ApiResponse<T[]>>(`${endpoint}${separator}per_page=${perPage}&page=1`, {
      revalidate: 300,
      tags: ["sitemap-content"],
    });
    if (!firstPage) throw new Error(`Empty sitemap response for ${endpoint}`);

    const lastPage = Math.max(1, firstPage.meta?.last_page || 1);
    const remaining = lastPage > 1
      ? await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) =>
          fetchApiResponse<ApiResponse<T[]>>(`${endpoint}${separator}per_page=${perPage}&page=${index + 2}`, {
            revalidate: 300,
            tags: ["sitemap-content"],
          })))
      : [];

    return [firstPage, ...remaining.filter(Boolean)].flatMap((page) => page?.data || []);
  } catch (error) {
    console.error(JSON.stringify({ event: 'sitemap_fetch_failed', endpoint, error: error instanceof Error ? error.message : String(error) }));
    if (process.env.SEO_SITEMAP_STRICT === 'true') throw error;
    return [];
  }
}

function stableLastModified(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function fetchSitemapPages() {
  try {
    return await getPublicPages();
  } catch (error) {
    console.error(JSON.stringify({
      event: 'sitemap_fetch_failed',
      endpoint: '/pages',
      error: error instanceof Error ? error.message : String(error),
    }));
    if (process.env.SEO_SITEMAP_STRICT === 'true') throw error;
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    sitemapEntry("", 1, "daily"),
    sitemapEntry("/du-an", 0.9, "daily"),
    sitemapEntry("/tin-tuc", 0.8, "daily"),
    sitemapEntry("/dau-tu", 0.8, "daily"),
    sitemapEntry("/chuyen-trang", 0.65, "weekly"),
    sitemapEntry("/gioi-thieu", 0.7, "monthly"),
    sitemapEntry("/lien-he", 0.7, "monthly"),
    sitemapEntry("/tuyen-dung", 0.75, "daily"),
  ];

  const [projectsData, postsData, pagesData, careersData] = await Promise.all([
    fetchAllPages<Project>("/projects?sort_by=open_sale_at&sort_order=asc", 50),
    fetchAllPages<Post>("/posts", 50),
    fetchSitemapPages(),
    fetchAllPages<CareerJob>("/career/jobs", 24),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = projectsData
    .filter((project) => project.is_published)
    .map((project) => {
      const images = cleanImages([
        project.banner_image,
        project.thumbnail,
      ]);

      return {
        url: `${SITE_URL}/${project.slug}`,
        lastModified: stableLastModified(project.updated_at),
        changeFrequency: "weekly",
        priority: project.is_hot || project.is_featured ? 0.9 : 0.82,
        images: images.length ? images : undefined,
      };
    });

  const videoRoutes: MetadataRoute.Sitemap = projectsData
    .map(getProjectVideo)
    .filter((video): video is NonNullable<typeof video> => Boolean(video))
    .map((video) => ({
      url: `${SITE_URL}${video.canonicalPath}`,
      lastModified: stableLastModified(video.updatedAt),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.72,
    }));

  const postRoutes: MetadataRoute.Sitemap = postsData
    .filter((post) => post.status === "published")
    .map((post) => {
      return {
        url: `${SITE_URL}/${post.slug}`,
        lastModified: stableLastModified(post.updated_at),
        changeFrequency: "weekly",
        priority: post.is_featured ? 0.78 : 0.68,
        images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : undefined,
      };
    });

  const pageRoutes: MetadataRoute.Sitemap = (pagesData || [])
    .filter((page) => page.status === "published")
    .map((page) => ({
      url: `${SITE_URL}/chuyen-trang/${page.slug}`,
      lastModified: stableLastModified(page.updated_at),
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.6,
    }));

  const careerRoutes: MetadataRoute.Sitemap = careersData.map((job) => ({
    url: `${SITE_URL}/tuyen-dung/${job.slug}`,
    lastModified: stableLastModified(job.updated_at),
    changeFrequency: "weekly" as ChangeFrequency,
    priority: job.is_featured ? 0.78 : 0.68,
    images: job.banner_image || job.thumbnail ? [absoluteUrl(job.banner_image || job.thumbnail || "")] : undefined,
  }));

  const dynamicCount = projectRoutes.length + videoRoutes.length + postRoutes.length + pageRoutes.length + careerRoutes.length;
  const minimum = Number(process.env.SEO_SITEMAP_MIN_DYNAMIC_URLS || 0);
  const expected = Number(process.env.SEO_SITEMAP_EXPECTED_DYNAMIC_URLS || 0);
  const droppedMoreThanTwentyPercent = expected > 0 && dynamicCount < Math.floor(expected * 0.8);
  if ((minimum > 0 && dynamicCount < minimum) || droppedMoreThanTwentyPercent) {
    const detail = { event: 'sitemap_url_count_below_threshold', dynamicCount, minimum, expected };
    console.error(JSON.stringify(detail));
    if (process.env.SEO_SITEMAP_STRICT === 'true') throw new Error(JSON.stringify(detail));
  }

  return [...staticRoutes, ...projectRoutes, ...videoRoutes, ...postRoutes, ...pageRoutes, ...careerRoutes];
}
