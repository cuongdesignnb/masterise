import { CONTACT_SECTION_KEYS, defaultContactPageContent } from "@/data/defaultContactPageContent";
import type { ContactDepartment, ContactPageContent, ContactSectionKey } from "@/types/contact-page";

const listFields: Partial<Record<ContactSectionKey, string[]>> = {
  hero: ["quickInfo"], commitments: ["items"], introduction: ["paragraphs", "images", "bullets"],
  salesTeam: ["items"], achievements: ["metrics", "milestones"], departments: ["items"], faqs: ["items"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeContactPageContent(
  value: unknown,
  legacyDepartments: Array<Record<string, unknown>> = [],
): ContactPageContent {
  const source = isRecord(value) ? value : {};
  const result = structuredClone(defaultContactPageContent) as ContactPageContent;
  if (isRecord(source.seo)) result.seo = { ...result.seo, ...source.seo } as ContactPageContent["seo"];

  const order = Array.isArray(source.sectionOrder)
    ? source.sectionOrder.filter((key): key is ContactSectionKey => CONTACT_SECTION_KEYS.includes(key as ContactSectionKey))
    : [];
  result.sectionOrder = new Set(order).size === CONTACT_SECTION_KEYS.length ? order : [...CONTACT_SECTION_KEYS];

  for (const sectionKey of CONTACT_SECTION_KEYS) {
    const incoming = isRecord(source[sectionKey]) ? source[sectionKey] : {};
    const section = { ...result[sectionKey], ...incoming } as ContactPageContent[typeof sectionKey];
    for (const field of listFields[sectionKey] || []) {
      if (Array.isArray(incoming[field])) (section as unknown as Record<string, unknown>)[field] = incoming[field];
    }
    (result as unknown as Record<string, unknown>)[sectionKey] = section;
  }

  if (!isRecord(value) && legacyDepartments.length > 0) {
    result.departments.items = legacyDepartments
      .map((item, index): ContactDepartment => ({
        id: `legacy-department-${index + 1}`,
        name: String(item.name || item.title || "").trim(),
        description: String(item.description || "").trim(),
        phone: String(item.phone || "").trim(),
        email: String(item.email || "").trim(),
        workingHours: String(item.workingHours || item.time || "").trim(),
        icon: String(item.icon || "Headphones"),
        isActive: true,
        sortOrder: (index + 1) * 10,
      }))
      .filter((item) => item.name);
  }

  return result;
}

export function activeSorted<T extends { isActive: boolean; sortOrder: number }>(items: T[]): T[] {
  return items.filter((item) => item.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function safeExternalUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if ((trimmed.startsWith("/") && !trimmed.startsWith("//")) || /^#[A-Za-z][\w-]*$/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function createContactItemId(prefix: string): string {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${suffix}`;
}
