"use client";

import { ChevronDown, ListTree } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { ArticleTocItem } from "@/lib/articleContent";

type Props = {
  toc: ArticleTocItem[];
  className?: string;
};

function TocLinks({ toc, activeId, onSelect }: { toc: ArticleTocItem[]; activeId: string; onSelect: (event: MouseEvent<HTMLAnchorElement>, id: string) => void }) {
  return (
    <div className="max-h-72 space-y-0.5 overflow-y-auto border-l border-[#E8DCCB] pl-3 pr-1 overscroll-contain">
      {toc.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "location" : undefined}
          onClick={(event) => onSelect(event, item.id)}
          className={`block rounded-r-lg border-l-2 py-2 pr-2 text-xs font-semibold leading-relaxed transition ${
            item.level === 3 ? "pl-5 text-[11px]" : "pl-3"
          } ${activeId === item.id ? "border-[#B88746] bg-[#B88746]/8 text-[#9B692D]" : "border-transparent text-[#6E5F51] hover:text-[#B88746]"}`}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}

export default function ArticleToc({ toc, className = "" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [activeId, setActiveId] = useState(toc[0]?.id || "");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible?.target.id) setActiveId(visible.target.id);
    }, { rootMargin: "-96px 0px -68% 0px", threshold: [0, 1] });

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      const passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      setShowQuick(passed);
      if (!passed) setQuickOpen(false);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!toc.length) return null;

  const selectHeading = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    setExpanded(false);
    setQuickOpen(false);
  };

  return (
    <>
      <section ref={sectionRef} className={`rounded-[20px] border border-[#E8DCCB]/80 bg-white shadow-[0_18px_50px_rgba(31,27,22,0.06)] ${className}`}>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="mobile-article-toc-list"
          className="flex min-h-12 w-full items-center gap-2 px-4 text-left md:hidden"
        >
          <ListTree className="h-4 w-4 text-[#B88746]" />
          <span className="flex-1 text-xs font-black text-[#1F1B16]">Mục lục bài viết</span>
          <ChevronDown className={`h-4 w-4 text-[#8C7A6B] transition ${expanded ? "rotate-180" : ""}`} />
        </button>
        <div className="hidden items-center gap-2 px-5 pb-3 pt-5 md:flex">
          <ListTree className="h-4 w-4 text-[#B88746]" />
          <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#B88746]">Mục lục</h2>
        </div>
        <div id="mobile-article-toc-list" className={`${expanded ? "block" : "hidden"} border-t border-[#E8DCCB]/70 px-4 py-3 md:block md:border-0 md:px-5 md:pb-5 md:pt-0`}>
          <TocLinks toc={toc} activeId={activeId} onSelect={selectHeading} />
        </div>
      </section>

      {showQuick ? (
        <div className="fixed bottom-20 right-4 z-30 md:hidden">
          {quickOpen ? (
            <div className="absolute bottom-14 right-0 w-[min(360px,calc(100vw-32px))] rounded-[18px] border border-[#E8DCCB] bg-white p-4 shadow-[0_22px_60px_rgba(31,27,22,0.22)]">
              <div className="mb-3 flex items-center gap-2">
                <ListTree className="h-4 w-4 text-[#B88746]" />
                <p className="flex-1 text-xs font-black text-[#1F1B16]">Mục lục bài viết</p>
                <button type="button" onClick={() => setQuickOpen(false)} className="text-[11px] font-bold text-[#8C7A6B]">Đóng</button>
              </div>
              <TocLinks toc={toc} activeId={activeId} onSelect={selectHeading} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setQuickOpen((value) => !value)}
            aria-expanded={quickOpen}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D8C6AE] bg-[#1F1B16] px-4 text-xs font-bold text-white shadow-[0_12px_30px_rgba(31,27,22,0.24)]"
          >
            <ListTree className="h-4 w-4 text-[#D1A15F]" />
            Xem nhanh
            <ChevronDown className={`h-3.5 w-3.5 transition ${quickOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      ) : null}
    </>
  );
}
