import type { HTMLAttributes } from "react";

interface RichHtmlContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  html?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeRichHtml(html: string): string {
  if (/<[a-z][\s\S]*>/i.test(html)) return html;
  return escapeHtml(html).replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
}

function isSafeCssColor(value: string): boolean {
  const normalized = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(normalized)) return true;
  if (/^(?:rgb|rgba|hsl|hsla)\([\d\s.,%+\-/]+\)$/i.test(normalized)) return true;
  return /^[a-z]+$/i.test(normalized);
}

function sanitizeInlineStyle(style: string): string {
  return style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 1) return "";

      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).trim();
      if (/url\s*\(|expression\s*\(|javascript:/i.test(value)) return "";

      if (property === "text-align" && /^(?:left|right|center|justify|start|end)$/i.test(value)) {
        return `${property}: ${value.toLowerCase()}`;
      }
      if (property === "direction" && /^(?:ltr|rtl)$/i.test(value)) {
        return `${property}: ${value.toLowerCase()}`;
      }
      if ((property === "color" || property === "background-color") && isSafeCssColor(value)) {
        return `${property}: ${value}`;
      }
      if (property === "--article-table-min-width" && /^\d{2,4}px$/i.test(value)) {
        return `${property}: ${value}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("; ");
}

function sanitizeRichHtml(html: string): string {
  return normalizeRichHtml(html)
    .replace(/<(script|style|iframe|object|embed|applet|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|applet|form)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(?:(['"]).*?\1|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi, (_match, doubleQuoted: string, singleQuoted: string, unquoted: string) => {
      const safeStyle = sanitizeInlineStyle(doubleQuoted ?? singleQuoted ?? unquoted ?? "");
      return safeStyle ? ` style="${safeStyle}"` : "";
    })
    .replace(/\s(?:srcdoc|formaction)\s*=\s*(?:(['"]).*?\1|[^\s>]+)/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(?:(['"])\s*javascript:[\s\S]*?\1|javascript:[^\s>]*)/gi, "");
}

function wrapTables(html: string): string {
  const protectedTables: string[] = [];
  const protectedHtml = html.replace(
    /<div\b(?=[^>]*\bclass\s*=\s*["'][^"']*\b(?:rich-html-table-wrap|article-table-scroll)\b[^"']*["'])[^>]*>[\s\S]*?<\/table\s*>\s*<\/div\s*>/gi,
    (wrapper) => {
      const token = `__RICH_HTML_TABLE_${protectedTables.length}__`;
      protectedTables.push(wrapper);
      return token;
    },
  );

  const wrappedHtml = protectedHtml.replace(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi, (table) => {
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

  return wrappedHtml.replace(/__RICH_HTML_TABLE_(\d+)__/g, (_token, index: string) => protectedTables[Number(index)] || "");
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
