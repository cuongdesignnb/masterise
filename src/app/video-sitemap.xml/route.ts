import { SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import { getProjectVideo } from "@/lib/video/projectVideo";
import { buildVideoSitemapXml, type VideoSitemapEntry } from "@/lib/video/videoSitemap";
import type { ApiResponse, Project } from "@/types/api";

export const revalidate = 300;

async function fetchAllProjects(): Promise<Project[]> {
  try {
    const firstPage = await fetchApiResponse<ApiResponse<Project[]>>("/projects?per_page=100&page=1", {
      revalidate: 300,
      tags: ["sitemap-content", "projects"],
    });
    const lastPage = Math.max(1, firstPage?.meta?.last_page || 1);
    const remaining = lastPage > 1
      ? await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) =>
          fetchApiResponse<ApiResponse<Project[]>>(`/projects?per_page=100&page=${index + 2}`, {
            revalidate: 300,
            tags: ["sitemap-content", "projects"],
          })))
      : [];

    return [firstPage, ...remaining.filter(Boolean)].flatMap((page) => page?.data || []);
  } catch {
    return [];
  }
}

export async function GET() {
  const projects = await fetchAllProjects();
  const entries: VideoSitemapEntry[] = projects
    .map(getProjectVideo)
    .filter((video): video is NonNullable<typeof video> => Boolean(video))
    .map((video) => ({
      loc: `${SITE_URL}${video.canonicalPath}`,
      thumbnailUrl: video.thumbnailUrl,
      title: video.title,
      description: video.description,
      playerUrl: video.parsed.embedUrl,
      publicationDate: video.uploadDate,
    }));

  return new Response(buildVideoSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
