import { cache } from "react";
import type { Metadata } from "next";
import { absoluteUrl, SITE_URL } from "@/config/seo";
import { activeSorted, asSafeRecord, asSafeString, normalizeContactPageContent } from "@/lib/contactPage";
import { defaultContactPageContent } from "@/data/defaultContactPageContent";
import { getServerApiUrl } from "@/lib/serverApi";
import type { ContactPageSiteDetails } from "@/types/contact-page";
import ContactClient from "./ContactClient";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildOperatorContext,
  buildFaqPageNode,
} from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

interface PublicSettingsResponse {
  success: boolean;
  data?: Record<string, unknown>;
}

const getContactPageData = cache(async () => {
  const apiUrl = getServerApiUrl();
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/settings/public`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Public settings returned ${response.status}`);
    const payload = (await response.json()) as PublicSettingsResponse;
    const settings = asSafeRecord(payload.data);
    const rawSocialLinks = asSafeRecord(settings.social_links);
    const socialLinks = Object.fromEntries(
      Object.entries(rawSocialLinks).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
    const legacyDepartments = Array.isArray(settings.contact_departments)
      ? settings.contact_departments as Array<Record<string, unknown>>
      : [];
    return {
      content: normalizeContactPageContent(settings.contact_page_content, legacyDepartments),
      site: {
        companyName: asSafeString(settings.company_name, "Masterise Homes") || "Masterise Homes",
        companyAddress: asSafeString(settings.company_address),
        hotline: asSafeString(settings.hotline),
        email: asSafeString(settings.email),
        logoUrl: asSafeString(settings.logo_url),
        socialLinks,
      } satisfies ContactPageSiteDetails,
    };
  } catch {
    return {
      content: normalizeContactPageContent(defaultContactPageContent),
      site: {
        companyName: "Masterise Homes", companyAddress: "", hotline: "", email: "", logoUrl: "", socialLinks: {},
      } satisfies ContactPageSiteDetails,
    };
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getContactPageData();
  const seo = content.seo;
  const ogImage = seo.ogImage ? absoluteUrl(seo.ogImage) : undefined;

  return buildMetadata({
    title: seo.title || defaultContactPageContent.seo.title,
    description: seo.description || defaultContactPageContent.seo.description,
    keywords: seo.keywords ? seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean) : undefined,
    path: "/lien-he",
    ogImage,
  });
}

export default async function LienHePage() {
  const [{ content, site }, siteEntity] = await Promise.all([
    getContactPageData(),
    getSiteEntityConfig(),
  ]);
  const faqItems = content.faqs.enabled ? activeSorted(content.faqs.items) : [];
  const pageUrl = `${SITE_URL}/lien-he`;

  const operatorContext = buildOperatorContext(siteEntity);
  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const webpageNode = {
    ...buildWebPageNode(pageUrl, content.seo.title, content.seo.description, {
      aboutId: operatorContext.enabled && operatorContext.id ? operatorContext.id : undefined,
      breadcrumbId: `${pageUrl}#breadcrumb`,
    }),
    '@type': 'ContactPage',
  };
  const breadcrumbNode = buildBreadcrumbSchema(pageUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Liên hệ", item: "/lien-he" },
  ]);

  const faqNode = buildFaqPageNode(pageUrl, faqItems);

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    faqNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <ContactClient initialContent={content} siteDetails={site} />
    </>
  );
}
