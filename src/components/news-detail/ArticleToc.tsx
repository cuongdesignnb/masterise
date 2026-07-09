import type { ArticleTocItem } from "@/lib/articleContent";

type Props = {
  toc: ArticleTocItem[];
  className?: string;
};

export default function ArticleToc({ toc, className = "" }: Props) {
  if (!toc.length) return null;

  return (
    <section className={`rounded-[24px] border border-[#E8DCCB]/80 bg-white p-5 shadow-[0_18px_50px_rgba(31,27,22,0.06)] ${className}`}>
      <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#B88746]">Mục lục</h2>
      <div className="mt-3 space-y-0.5 border-l border-[#E8DCCB] pl-4">
        {toc.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block rounded-lg py-1.5 text-xs font-semibold leading-relaxed text-[#6E5F51] transition hover:text-[#B88746] ${
              item.level === 3 ? "pl-3 text-[11px]" : ""
            }`}
          >
            {item.title}
          </a>
        ))}
      </div>
    </section>
  );
}
