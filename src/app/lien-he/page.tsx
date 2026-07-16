import { cache } from "react";
import type { Metadata } from "next";
import { absoluteUrl, SITE_URL } from "@/config/seo";
import { normalizeContactPageContent, activeSorted } from "@/lib/contactPage";
import { defaultContactPageContent } from "@/data/defaultContactPageContent";
import { getServerApiUrl } from "@/lib/serverApi";
import type { ContactPageSiteDetails } from "@/types/contact-page";
import ContactClient from "./ContactClient";

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
    const settings = payload.data || {};
    const legacyDepartments = Array.isArray(settings.contact_departments)
      ? settings.contact_departments as Array<Record<string, unknown>>
      : [];
    return {
      content: normalizeContactPageContent(settings.contact_page_content, legacyDepartments),
      site: {
        companyName: String(settings.company_name || "Masterise Homes"),
        companyAddress: String(settings.company_address || ""),
        hotline: String(settings.hotline || ""),
        email: String(settings.email || ""),
        logoUrl: String(settings.logo_url || ""),
        socialLinks: settings.social_links && typeof settings.social_links === "object"
          ? settings.social_links as Record<string, string>
          : {},
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
  return {
    title: seo.title || defaultContactPageContent.seo.title,
    description: seo.description || defaultContactPageContent.seo.description,
    keywords: seo.keywords ? seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean) : undefined,
    alternates: { canonical: "/lien-he" },
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      type: "website",
      locale: "vi_VN",
      url: `${SITE_URL}/lien-he`,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function LienHePage() {
  const { content, site } = await getContactPageData();
  const faqItems = content.faqs.enabled ? activeSorted(content.faqs.items) : [];
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.companyName,
    url: SITE_URL,
  };
  if (site.logoUrl) organization.logo = absoluteUrl(site.logoUrl);
  if (site.email) organization.email = site.email;
  if (site.companyAddress) organization.address = { "@type": "PostalAddress", streetAddress: site.companyAddress, addressCountry: "VN" };
  if (site.hotline) organization.contactPoint = { "@type": "ContactPoint", telephone: site.hotline, contactType: "customer service", areaServed: "VN", availableLanguage: ["Vietnamese", "English"] };

  const graph: Record<string, unknown>[] = [
    organization,
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Liên hệ", item: `${SITE_URL}/lien-he` },
      ],
    },
    {
      "@type": "ContactPage",
      name: content.seo.title,
      description: content.seo.description,
      url: `${SITE_URL}/lien-he`,
      mainEntity: { "@id": `${SITE_URL}/#organization` },
    },
  ];
  if (faqItems.length) graph.push({
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  });

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />
    <ContactClient initialContent={content} siteDetails={site} />
  </>;
}
