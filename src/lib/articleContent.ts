export type ArticleTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export function stripHtml(value?: string | null) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(value?: string | null) {
  const words = stripHtml(value).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractTocFromHtml(content?: string | null): ArticleTocItem[] {
  const html = content || "";
  const matches = Array.from(html.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi));
  const usedIds = new Map<string, number>();

  return matches
    .map((match, index) => {
      const level = Number(match[1]) as 2 | 3;
      const title = stripHtml(match[2]);
      if (!title) return null;

      const baseId = slugifyHeading(title) || `muc-${index + 1}`;
      const count = usedIds.get(baseId) || 0;
      usedIds.set(baseId, count + 1);

      return {
        id: count ? `${baseId}-${count + 1}` : baseId,
        title,
        level,
      };
    })
    .filter(Boolean) as ArticleTocItem[];
}

export function enhanceArticleHtmlWithHeadingIds(content?: string | null) {
  const usedIds = new Map<string, number>();
  let fallbackIndex = 0;

  return (content || "").replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    if (/\sid=["'][^"']+["']/.test(attrs)) return full;

    const title = stripHtml(inner);
    const baseId = slugifyHeading(title) || `muc-${fallbackIndex + 1}`;
    const count = usedIds.get(baseId) || 0;
    usedIds.set(baseId, count + 1);
    fallbackIndex += 1;

    const id = count ? `${baseId}-${count + 1}` : baseId;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export function sanitizeArticleHtml(content?: string | null) {
  return (content || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "");
}

export function enhanceArticleTables(content?: string | null) {
  const protectedBlocks: string[] = [];
  const protect = (value: string) => {
    const token = `___ARTICLE_PROTECTED_${protectedBlocks.length}___`;
    protectedBlocks.push(value);
    return token;
  };

  let html = content || "";
  html = html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre\s*>/gi, protect);
  html = html.replace(/<code\b[^>]*>[\s\S]*?<\/code\s*>/gi, protect);
  html = html.replace(/<div\b[^>]*class=["'][^"']*article-table-scroll[^"']*["'][^>]*>[\s\S]*?<\/table\s*>\s*<\/div\s*>/gi, protect);
  html = html.replace(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi, (table) => {
    const rows = Array.from(table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi));
    const columnCount = Math.max(1, ...rows.map((row) => {
      const cells = Array.from(row[1].matchAll(/<(?:th|td)\b([^>]*)>/gi));
      return cells.reduce((total, cell) => {
        const colspan = cell[1].match(/\bcolspan\s*=\s*["']?(\d+)/i);
        return total + Math.max(1, Number(colspan?.[1] || 1));
      }, 0);
    }));
    // One- and two-column tables should fit the article on phones. Wider
    // tables retain a readable column width and scroll inside their wrapper.
    const minWidth = columnCount <= 2
      ? 0
      : Math.min(1400, columnCount * 140);

    return `<div class="article-table-scroll" role="region" tabindex="0" aria-label="Bảng dữ liệu trong bài viết" data-column-count="${columnCount}" style="--article-table-min-width: ${minWidth}px">${table}</div>`;
  });

  return html.replace(/___ARTICLE_PROTECTED_(\d+)___/g, (_, index) => protectedBlocks[Number(index)] || "");
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function enhanceArticleImages(content?: string | null, fallbackAlt = "") {
  let imageIndex = 0;
  return (content || "").replace(/<img\b([^>]*)>/gi, (_full, attributes: string) => {
    imageIndex += 1;
    let nextAttributes = attributes;
    if (!/\salt\s*=/i.test(nextAttributes)) {
      const alt = fallbackAlt ? `${fallbackAlt} - hình ảnh ${imageIndex}` : "";
      nextAttributes += ` alt="${escapeHtmlAttribute(alt)}"`;
    }
    if (!/\sloading\s*=/i.test(nextAttributes)) nextAttributes += ' loading="lazy"';
    if (!/\sdecoding\s*=/i.test(nextAttributes)) nextAttributes += ' decoding="async"';
    return `<img${nextAttributes}>`;
  });
}

export function enhanceArticleHtml(content?: string | null, fallbackImageAlt = "") {
  return enhanceArticleTables(enhanceArticleImages(enhanceArticleHtmlWithHeadingIds(sanitizeArticleHtml(content)), fallbackImageAlt));
}

export function splitArticleIntroAndMain(content?: string | null) {
  const html = content || "";
  if (!html) return { introHtml: "", mainHtml: "" };

  const paragraphs = Array.from(html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p\s*>/gi));
  const firstMeaningful = paragraphs.find((match) => stripHtml(match[0]).length > 0);
  if (!firstMeaningful || firstMeaningful.index === undefined) {
    return { introHtml: html, mainHtml: "" };
  }

  const splitAt = firstMeaningful.index + firstMeaningful[0].length;
  const mainHtml = html.slice(splitAt);
  if (stripHtml(mainHtml).length < 80) return { introHtml: html, mainHtml: "" };

  return { introHtml: html.slice(0, splitAt), mainHtml };
}

export function splitArticleHtmlForInlineLinks(content?: string | null) {
  const { introHtml, mainHtml } = splitArticleIntroAndMain(content);
  return { before: introHtml, after: mainHtml };
}

export function formatArticleDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
