import type { HTMLAttributes } from "react";

interface RichHtmlContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  html?: string | null;
}

function sanitizeRichHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|applet|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|applet|form)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(?:(['"]).*?\1|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*(?:(['"]).*?\1|[^\s>]+)/gi, "")
    .replace(/\s(?:srcdoc|formaction)\s*=\s*(?:(['"]).*?\1|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");
}

function wrapTables(html: string): string {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi, (table) => {
    const rows = Array.from(table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi));
    const columnCount = Math.max(1, ...rows.map((row) => {
      const cells = Array.from(row[1].matchAll(/<(?:th|td)\b([^>]*)>/gi));
      return cells.reduce((total, cell) => {
        const colspan = cell[1].match(/\bcolspan\s*=\s*["']?(\d+)/i);
        return total + Math.max(1, Number(colspan?.[1] || 1));
      }, 0);
    }));
    const widthClass = columnCount > 2 ? " rich-html-table-wrap--wide" : "";
    return `<div class="rich-html-table-wrap${widthClass}" role="region" tabindex="0" aria-label="Bảng dữ liệu">${table}</div>`;
  });
}

export default function RichHtmlContent({ html, className = "", ...props }: RichHtmlContentProps) {
  const normalizedHtml = typeof html === "string" ? html.trim() : "";
  if (!normalizedHtml) return null;

  return (
    <div
      {...props}
      className={`rich-html-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: wrapTables(sanitizeRichHtml(normalizedHtml)) }}
    />
  );
}
