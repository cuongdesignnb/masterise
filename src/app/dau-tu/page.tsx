import type { Metadata } from "next";
import DauTuClient from "./DauTuClient";
import { Suspense } from "react";
import { SITE_URL } from "@/config/seo";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildOperatorContext,
} from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Cơ hội đầu tư - Sự kiện, chính sách và phân tích",
  description:
    "Cập nhật các cơ hội sở hữu, sự kiện mở bán và phân tích giá trị đầu tư từ hệ sinh thái dự án Masterise Homes.",
  path: "/dau-tu",
});

export default async function DauTuPage() {
  const siteEntity = await getSiteEntityConfig();
  const pageUrl = `${SITE_URL}/dau-tu`;

  const operatorContext = buildOperatorContext(siteEntity);
  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const webpageNode = {
    ...buildWebPageNode(pageUrl, "Cơ hội đầu tư Masterise Homes", "Cập nhật các cơ hội sở hữu và phân tích đầu tư bất động sản"),
    '@type': 'CollectionPage',
  };
  const breadcrumbNode = buildBreadcrumbSchema(pageUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Đầu tư", item: "/dau-tu" },
  ]);
  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
        <DauTuClient />
      </Suspense>
    </>
  );
}
