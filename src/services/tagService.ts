import { api } from "@/lib/api";
import type { Tag } from "@/types/api";

export const tagService = {
  getTags(params?: { q?: string; post_type?: string; with_count?: boolean }) {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.post_type) search.set("post_type", params.post_type);
    if (params?.with_count) search.set("with_count", "1");
    return api.get<Tag[]>(`/tags${search.size ? `?${search}` : ""}`);
  },
  createTag(name: string) {
    return api.post<Tag>("/tags", { name });
  },
  updateTag(id: number, name: string) {
    return api.put<Tag>(`/tags/${id}`, { name });
  },
  deleteTag(id: number) {
    return api.delete(`/tags/${id}`);
  },
};
