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

export function formatArticleDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
