import { CONTACT_SECTION_KEYS, defaultContactPageContent } from "../data/defaultContactPageContent";
import type {
  ContactAchievement,
  ContactBullet,
  ContactCommitment,
  ContactDepartment,
  ContactFaq,
  ContactImage,
  ContactListItemBase,
  ContactMilestone,
  ContactPageContent,
  ContactQuickInfo,
  ContactSalesMember,
  ContactSectionKey,
} from "../types/contact-page";

export function asSafeRecord(value: unknown): Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function asSafeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null) return "";
  return fallback;
}

export function asSafeBoolean(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return fallback;
}

export function asSafeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function asSafeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(source: Record<string, unknown>, key: string, fallback = ""): string {
  return asSafeString(source[key], fallback);
}

function listBase(source: Record<string, unknown>, prefix: string, index: number): ContactListItemBase {
  return {
    id: text(source, "id", `${prefix}-${index + 1}`) || `${prefix}-${index + 1}`,
    isActive: asSafeBoolean(source.isActive, true),
    sortOrder: asSafeNumber(source.sortOrder, (index + 1) * 10),
  };
}

function normalizeObjectList<T>(value: unknown, normalizer: (source: Record<string, unknown>, index: number) => T): T[] {
  return asSafeArray(value)
    .filter((item) => Object.keys(asSafeRecord(item)).length > 0)
    .map((item, index) => normalizer(asSafeRecord(item), index));
}

function normalizeCta(value: unknown, fallback: { label: string; url: string }): { label: string; url: string } {
  const source = asSafeRecord(value);
  return {
    label: text(source, "label", fallback.label),
    url: text(source, "url", fallback.url),
  };
}

function normalizeQuickInfo(value: unknown): ContactQuickInfo[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "quick-info", index),
    label: text(source, "label"),
    value: text(source, "value"),
    icon: text(source, "icon", "HeartHandshake"),
  })).filter((item) => item.label.trim() !== "");
}

function normalizeCommitments(value: unknown): ContactCommitment[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "commitment", index),
    title: text(source, "title"),
    description: text(source, "description"),
    icon: text(source, "icon", "ShieldCheck"),
  })).filter((item) => item.title.trim() !== "");
}

function normalizeImages(value: unknown): ContactImage[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "contact-image", index),
    url: text(source, "url"),
    alt: text(source, "alt"),
  })).filter((item) => item.url.trim() !== "");
}

function normalizeBullets(value: unknown): ContactBullet[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "contact-bullet", index),
    text: text(source, "text"),
  })).filter((item) => item.text.trim() !== "");
}

function normalizeSalesMembers(value: unknown): ContactSalesMember[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "sales-member", index),
    name: text(source, "name"),
    title: text(source, "title"),
    avatar: text(source, "avatar"),
    avatarAlt: text(source, "avatarAlt"),
    description: text(source, "description"),
    responsibility: text(source, "responsibility"),
    phone: text(source, "phone"),
    email: text(source, "email"),
    zaloUrl: text(source, "zaloUrl"),
    facebookUrl: text(source, "facebookUrl"),
    tags: asSafeArray(source.tags).filter((tag): tag is string => typeof tag === "string"),
  })).filter((item) => item.name.trim() !== "");
}

function normalizeAchievements(value: unknown): ContactAchievement[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "achievement", index),
    value: text(source, "value"),
    suffix: text(source, "suffix"),
    label: text(source, "label"),
    description: text(source, "description"),
    icon: text(source, "icon", "Award"),
  })).filter((item) => item.label.trim() !== "");
}

function normalizeMilestones(value: unknown): ContactMilestone[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "milestone", index),
    year: text(source, "year"),
    title: text(source, "title"),
    description: text(source, "description"),
    image: text(source, "image"),
    imageAlt: text(source, "imageAlt"),
    referenceUrl: text(source, "referenceUrl"),
  })).filter((item) => item.title.trim() !== "");
}

function normalizeDepartments(value: unknown): ContactDepartment[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "department", index),
    name: text(source, "name"),
    description: text(source, "description"),
    phone: text(source, "phone"),
    email: text(source, "email"),
    workingHours: text(source, "workingHours"),
    icon: text(source, "icon", "Headphones"),
  })).filter((item) => item.name.trim() !== "");
}

function normalizeFaqs(value: unknown): ContactFaq[] {
  return normalizeObjectList(value, (source, index) => ({
    ...listBase(source, "faq", index),
    question: text(source, "question"),
    answer: text(source, "answer"),
  })).filter((item) => item.question.trim() !== "");
}

function sectionSource(source: Record<string, unknown>, key: ContactSectionKey): Record<string, unknown> {
  return asSafeRecord(source[key]);
}

export function normalizeContactPageContent(
  value: unknown,
  legacyDepartments: Array<Record<string, unknown>> = [],
): ContactPageContent {
  const source = asSafeRecord(value);
  const defaults = defaultContactPageContent;
  const seo = asSafeRecord(source.seo);
  const hero = sectionSource(source, "hero");
  const commitments = sectionSource(source, "commitments");
  const introduction = sectionSource(source, "introduction");
  const salesTeam = sectionSource(source, "salesTeam");
  const achievements = sectionSource(source, "achievements");
  const contactForm = sectionSource(source, "contactForm");
  const departments = sectionSource(source, "departments");
  const faqs = sectionSource(source, "faqs");
  const cta = sectionSource(source, "cta");
  const order = asSafeArray(source.sectionOrder)
    .filter((key): key is ContactSectionKey => typeof key === "string" && CONTACT_SECTION_KEYS.includes(key as ContactSectionKey));
  const validOrder = order.length === CONTACT_SECTION_KEYS.length && new Set(order).size === CONTACT_SECTION_KEYS.length;
  const achievementDescription = text(achievements, "description", defaults.achievements.description);

  const result: ContactPageContent = {
    sectionOrder: validOrder ? order : [...CONTACT_SECTION_KEYS],
    seo: {
      title: text(seo, "title", defaults.seo.title),
      description: text(seo, "description", defaults.seo.description),
      keywords: text(seo, "keywords", defaults.seo.keywords),
      ogTitle: text(seo, "ogTitle", defaults.seo.ogTitle),
      ogDescription: text(seo, "ogDescription", defaults.seo.ogDescription),
      ogImage: text(seo, "ogImage", defaults.seo.ogImage),
    },
    hero: {
      enabled: asSafeBoolean(hero.enabled, defaults.hero.enabled),
      sortOrder: asSafeNumber(hero.sortOrder, defaults.hero.sortOrder),
      eyebrow: text(hero, "eyebrow", defaults.hero.eyebrow),
      title: text(hero, "title", defaults.hero.title),
      description: text(hero, "description", defaults.hero.description),
      image: text(hero, "image", defaults.hero.image),
      imageAlt: text(hero, "imageAlt", defaults.hero.imageAlt),
      primaryCta: normalizeCta(hero.primaryCta, defaults.hero.primaryCta),
      secondaryCta: normalizeCta(hero.secondaryCta, defaults.hero.secondaryCta),
      hotlineLine: text(hero, "hotlineLine", defaults.hero.hotlineLine),
      responseLine: text(hero, "responseLine", defaults.hero.responseLine),
      quickInfo: hero.quickInfo === undefined ? structuredClone(defaults.hero.quickInfo) : normalizeQuickInfo(hero.quickInfo),
    },
    commitments: {
      enabled: asSafeBoolean(commitments.enabled, defaults.commitments.enabled),
      sortOrder: asSafeNumber(commitments.sortOrder, defaults.commitments.sortOrder),
      label: text(commitments, "label", defaults.commitments.label),
      title: text(commitments, "title", defaults.commitments.title),
      description: text(commitments, "description", defaults.commitments.description),
      items: commitments.items === undefined ? structuredClone(defaults.commitments.items) : normalizeCommitments(commitments.items),
    },
    introduction: {
      enabled: asSafeBoolean(introduction.enabled, defaults.introduction.enabled),
      sortOrder: asSafeNumber(introduction.sortOrder, defaults.introduction.sortOrder),
      label: text(introduction, "label", defaults.introduction.label),
      title: text(introduction, "title", defaults.introduction.title),
      paragraphs: introduction.paragraphs === undefined
        ? [...defaults.introduction.paragraphs]
        : asSafeArray(introduction.paragraphs).filter((paragraph): paragraph is string => typeof paragraph === "string"),
      images: introduction.images === undefined ? structuredClone(defaults.introduction.images) : normalizeImages(introduction.images),
      bullets: introduction.bullets === undefined ? structuredClone(defaults.introduction.bullets) : normalizeBullets(introduction.bullets),
      cta: normalizeCta(introduction.cta, defaults.introduction.cta),
    },
    salesTeam: {
      enabled: asSafeBoolean(salesTeam.enabled, defaults.salesTeam.enabled),
      sortOrder: asSafeNumber(salesTeam.sortOrder, defaults.salesTeam.sortOrder),
      label: text(salesTeam, "label", defaults.salesTeam.label),
      title: text(salesTeam, "title", defaults.salesTeam.title),
      description: text(salesTeam, "description", defaults.salesTeam.description),
      items: normalizeSalesMembers(salesTeam.items),
    },
    achievements: {
      enabled: asSafeBoolean(achievements.enabled, defaults.achievements.enabled),
      sortOrder: asSafeNumber(achievements.sortOrder, defaults.achievements.sortOrder),
      label: text(achievements, "label", defaults.achievements.label),
      title: text(achievements, "title", defaults.achievements.title),
      description: achievementDescription === "Các số liệu và dấu mốc chỉ hiển thị sau khi được quản trị viên xác nhận."
        ? defaults.achievements.description
        : achievementDescription,
      metricsEnabled: asSafeBoolean(achievements.metricsEnabled, defaults.achievements.metricsEnabled),
      milestonesEnabled: asSafeBoolean(achievements.milestonesEnabled, defaults.achievements.milestonesEnabled),
      metrics: normalizeAchievements(achievements.metrics),
      milestones: normalizeMilestones(achievements.milestones),
    },
    contactForm: {
      enabled: asSafeBoolean(contactForm.enabled, defaults.contactForm.enabled),
      sortOrder: asSafeNumber(contactForm.sortOrder, defaults.contactForm.sortOrder),
      label: text(contactForm, "label", defaults.contactForm.label),
      title: text(contactForm, "title", defaults.contactForm.title),
      description: text(contactForm, "description", defaults.contactForm.description),
      officeTitle: text(contactForm, "officeTitle", defaults.contactForm.officeTitle),
      hotline: text(contactForm, "hotline"),
      email: text(contactForm, "email"),
      address: text(contactForm, "address"),
      workingHours: text(contactForm, "workingHours", defaults.contactForm.workingHours),
      mapUrl: text(contactForm, "mapUrl"),
      mapEmbedUrl: text(contactForm, "mapEmbedUrl"),
      mapImage: text(contactForm, "mapImage"),
      mapImageAlt: text(contactForm, "mapImageAlt", defaults.contactForm.mapImageAlt),
      directionsLabel: text(contactForm, "directionsLabel", defaults.contactForm.directionsLabel),
      directionsUrl: text(contactForm, "directionsUrl"),
    },
    departments: {
      enabled: asSafeBoolean(departments.enabled, defaults.departments.enabled),
      sortOrder: asSafeNumber(departments.sortOrder, defaults.departments.sortOrder),
      label: text(departments, "label", defaults.departments.label),
      title: text(departments, "title", defaults.departments.title),
      description: text(departments, "description", defaults.departments.description),
      items: normalizeDepartments(departments.items),
    },
    faqs: {
      enabled: asSafeBoolean(faqs.enabled, defaults.faqs.enabled),
      sortOrder: asSafeNumber(faqs.sortOrder, defaults.faqs.sortOrder),
      label: text(faqs, "label", defaults.faqs.label),
      title: text(faqs, "title", defaults.faqs.title),
      description: text(faqs, "description", defaults.faqs.description),
      items: faqs.items === undefined ? structuredClone(defaults.faqs.items) : normalizeFaqs(faqs.items),
    },
    cta: {
      enabled: asSafeBoolean(cta.enabled, defaults.cta.enabled),
      sortOrder: asSafeNumber(cta.sortOrder, defaults.cta.sortOrder),
      label: text(cta, "label", defaults.cta.label),
      title: text(cta, "title", defaults.cta.title),
      description: text(cta, "description", defaults.cta.description),
      image: text(cta, "image", defaults.cta.image),
      imageAlt: text(cta, "imageAlt", defaults.cta.imageAlt),
      primaryCta: normalizeCta(cta.primaryCta, defaults.cta.primaryCta),
      secondaryCta: normalizeCta(cta.secondaryCta, defaults.cta.secondaryCta),
    },
  };

  if (Object.keys(source).length === 0 && legacyDepartments.length > 0) {
    result.departments.items = legacyDepartments
      .map((item, index): ContactDepartment => ({
        ...listBase(asSafeRecord(item), "legacy-department", index),
        name: asSafeString(item.name ?? item.title).trim(),
        description: asSafeString(item.description).trim(),
        phone: asSafeString(item.phone).trim(),
        email: asSafeString(item.email).trim(),
        workingHours: asSafeString(item.workingHours ?? item.time).trim(),
        icon: asSafeString(item.icon, "Headphones"),
      }))
      .filter((item) => item.name);
  }

  return result;
}

export function activeSorted<T extends { isActive: boolean; sortOrder: number }>(items: T[]): T[];
export function activeSorted(items: unknown): Array<{ isActive: boolean; sortOrder: number }>;
export function activeSorted<T extends { isActive: boolean; sortOrder: number }>(items: T[] | unknown): T[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is T => Boolean(item) && typeof item === "object" && asSafeBoolean((item as Partial<T>).isActive, false))
    .sort((a, b) => asSafeNumber(a.sortOrder, 0) - asSafeNumber(b.sortOrder, 0));
}

export function safeExternalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
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
