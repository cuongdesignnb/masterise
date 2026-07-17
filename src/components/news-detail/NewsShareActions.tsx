"use client";

import { useState } from "react";
import { Check, Copy, Link2, MessageCircle, Share2 } from "lucide-react";

export default function NewsShareActions({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-white/80" aria-label="Chia sẻ bài viết">
      <span className="mr-1">Chia sẻ:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-[#1877F2]" aria-label="Chia sẻ Facebook">
        <Share2 className="h-4 w-4" />
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-[#0A66C2]" aria-label="Chia sẻ LinkedIn">
        <Link2 className="h-4 w-4" />
      </a>
      <a href={`https://zalo.me/share?u=${encodedUrl}&t=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-[#0A8FE3]" aria-label="Chia sẻ Zalo">
        <MessageCircle className="h-4 w-4" />
      </a>
      <button type="button" onClick={copyLink} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 text-white backdrop-blur-md transition hover:bg-black/50">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5 text-[#E6B86B]" />}
        {copied ? "Đã sao chép" : "Sao chép liên kết"}
      </button>
    </div>
  );
}
