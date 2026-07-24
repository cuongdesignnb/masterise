export interface FaqSchemaItem {
  question?: string | null;
  answer?: string | null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function questionKey(value: string): string {
  return normalizeWhitespace(value).normalize('NFC').toLocaleLowerCase('vi-VN');
}

export function buildFaqPageNode(
  canonical: string,
  items?: FaqSchemaItem[] | null,
): Record<string, unknown> | null {
  const seen = new Set<string>();
  const mainEntity = (items || [])
    .map((item) => ({
      question: normalizeWhitespace(String(item?.question || '')),
      answer: normalizeWhitespace(String(item?.answer || '')),
    }))
    .filter((item) => item.question && item.answer)
    .filter((item) => {
      const key = questionKey(item.question);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }));

  if (!mainEntity.length) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    mainEntity,
  };
}
