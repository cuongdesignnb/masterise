"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, CalendarDays, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Post } from "@/types/api";

type RelatedPostOption = Pick<Post, "id" | "title" | "thumbnail" | "published_at"> & {
  category?: Post["category"] | null;
  status?: Post["status"];
};

type Props = {
  candidates: RelatedPostOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  title?: string;
  description?: string;
  excludeId?: number;
  maxItems?: number;
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có ngày đăng";
}

export default function RelatedPostsSelector({
  candidates,
  selectedIds,
  onChange,
  title = "Bài viết liên quan",
  description = "Chọn tối đa 3 bài viết đã xuất bản và sắp xếp theo thứ tự hiển thị.",
  excludeId,
  maxItems = 3,
}: Props) {
  const [search, setSearch] = useState("");
  const candidateMap = useMemo(() => new Map(candidates.map((post) => [post.id, post])), [candidates]);
  const selectedPosts = selectedIds.map((id) => candidateMap.get(id)).filter((post): post is RelatedPostOption => Boolean(post));
  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");
  const results = candidates.filter((post) => (
    (!post.status || post.status === "published") &&
    post.id !== excludeId &&
    !selectedIds.includes(post.id) &&
    (!normalizedSearch || post.title.toLocaleLowerCase("vi-VN").includes(normalizedSearch))
  ));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = (id: number) => {
    if (selectedIds.length >= maxItems || selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setSearch("");
  };

  return (
    <section className="rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-4" aria-labelledby="related-posts-selector-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="related-posts-selector-title" className="text-xs font-bold text-[#6E5F51]">{title}</h3>
          <p className="mt-1 text-[11px] leading-5 text-[#8C7A6B]">{description}</p>
        </div>
        <span className="rounded-full border border-[#E8DCCB] bg-white px-2.5 py-1 text-[11px] font-bold text-[#8C7A6B]">
          {selectedIds.length}/{maxItems}
        </span>
      </div>

      {selectedPosts.length > 0 ? (
        <div className="mt-3 space-y-2">
          {selectedPosts.map((post, index) => (
            <div key={post.id} className="flex items-center gap-3 rounded-xl border border-[#E8DCCB] bg-white p-2.5">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F3EEE6]">
                {post.thumbnail ? (
                  <Image src={post.thumbnail} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] font-black text-[#B88746]">MH</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-bold leading-4 text-[#1F1B16]">{post.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#8C7A6B]">
                  <span>{post.category?.name || "Chưa phân loại"}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(post.published_at)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Đưa bài lên" className="rounded-lg p-1.5 text-[#6E5F51] hover:bg-[#FBF8F2] disabled:opacity-25"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={index === selectedPosts.length - 1} onClick={() => move(index, 1)} aria-label="Đưa bài xuống" className="rounded-lg p-1.5 text-[#6E5F51] hover:bg-[#FBF8F2] disabled:opacity-25"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => onChange(selectedIds.filter((id) => id !== post.id))} aria-label="Xóa bài liên quan" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-[#DCCDB8] bg-white/70 px-3 py-4 text-center text-[11px] text-[#8C7A6B]">Chưa chọn bài viết liên quan.</p>
      )}

      {selectedIds.length >= maxItems ? (
        <p className="mt-3 text-xs font-semibold text-[#A15C32]">Chỉ được chọn tối đa 3 bài viết liên quan</p>
      ) : (
        <div className="mt-3">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7A6B]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài đã xuất bản..." className="h-10 w-full rounded-xl border border-[#E8DCCB] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#B88746]" />
          </label>
          {search.trim() ? (
            <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-[#E8DCCB] bg-white p-1.5">
              {results.slice(0, 10).map((post) => (
                <button type="button" key={post.id} onClick={() => add(post.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#FBF8F2]">
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-[#F3EEE6]">
                    {post.thumbnail ? <Image src={post.thumbnail} alt="" fill sizes="56px" className="object-cover" /> : null}
                  </div>
                  <span className="min-w-0">
                    <span className="line-clamp-1 block text-xs font-bold text-[#1F1B16]">{post.title}</span>
                    <span className="mt-0.5 block text-[10px] text-[#8C7A6B]">{post.category?.name || "Chưa phân loại"} · {formatDate(post.published_at)}</span>
                  </span>
                </button>
              ))}
              {results.length === 0 ? <p className="px-3 py-4 text-center text-xs text-[#8C7A6B]">Không tìm thấy bài viết phù hợp.</p> : null}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
