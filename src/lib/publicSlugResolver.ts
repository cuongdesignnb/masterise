import "server-only";

import { cache } from "react";
import { getProjectForSEO } from "@/services/projectServerService";
import { fetchApi } from "@/lib/serverApi";
import type { PostDetailData } from "@/types/api";

export type PublicSlugKind = "project" | "news" | "investment";

export const resolvePublicSlug = cache(async (slug: string): Promise<PublicSlugKind | null> => {
  const project = await getProjectForSEO(slug);
  if (project) return "project";

  const postData = await fetchApi<PostDetailData>(`/posts/${slug}`);
  if (!postData?.post) return null;

  return postData.post.post_type === "news" ? "news" : "investment";
});
