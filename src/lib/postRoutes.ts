import type { Post } from "@/types/api";

export function getPostDetailHref(post: Pick<Post, "post_type" | "slug">) {
  return post.post_type === "investment" || post.post_type === "event"
    ? `/dau-tu/${post.slug}`
    : `/tin-tuc/${post.slug}`;
}

export function updateListSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | number | null | undefined>,
) {
  const params = new URLSearchParams(current.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "" || value === 1 && key === "page") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });
  return params;
}
