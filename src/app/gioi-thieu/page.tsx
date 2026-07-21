import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/config/seo";
import { aboutFaqs } from "@/data/aboutSeed";
import AboutClient from "./AboutClient";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Giới thiệu Masterise Homes | Nhà phát triển bất động sản hàng hiệu",
  description:
    "Tìm hiểu về Masterise Homes – nhà phát triển bất động sản hàng hiệu tại Việt Nam, kiến tạo chuẩn sống quốc tế, phát triển bền vững và những công trình biểu tượng.",
  keywords: [
    "Masterise Homes",
    "giới thiệu Masterise Homes",
    "nhà phát triển bất động sản hàng hiệu",
    "bất động sản cao cấp",
    "dự án Masterise Homes",
    "căn hộ hạng sang",
    "branded residences",
    "bất động sản Việt Nam",
  ],
  path: "/gioi-thieu",
});

export default async function GioiThieuPage() {
  const siteEntity = await getSiteEntityConfig();
  const pageUrl = `${SITE_URL}/gioi-thieu`;

  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode();
  const webpageNode = buildWebPageNode(
    pageUrl,
    "Giới thiệu Masterise Homes",
    "Nhà phát triển bất động sản hàng hiệu hàng đầu Việt Nam"
  );
  const breadcrumbNode = buildBreadcrumbSchema(pageUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Giới thiệu", item: "/gioi-thieu" },
  ]);

  const faqNode = {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: aboutFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

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
      <AboutClient />
    </>
  );
}
