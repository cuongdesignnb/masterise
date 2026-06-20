import { Suspense } from "react";
import type { Metadata } from "next";
import NewsClient from "./NewsClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

export const metadata: Metadata = {
  title: "Tin tức & Góc nhìn thị trường | Masterise Homes",
  description:
    "Cập nhật tin tức mới nhất về dự án, xu hướng thị trường bất động sản, pháp lý, kiến trúc và phong cách sống từ Masterise Homes.",
  keywords: [
    "tin tức Masterise Homes",
    "tin tức bất động sản",
    "thị trường bất động sản",
    "dự án Masterise Homes",
    "The Global City",
    "Lumière Riverside",
    "phong cách sống cao cấp",
    "pháp lý bất động sản",
    "kiến trúc bất động sản",
  ],
  openGraph: {
    title: "Tin tức & Góc nhìn thị trường | Masterise Homes",
    description:
      "Cập nhật thông tin mới nhất về dự án, thị trường, pháp lý, kiến trúc và phong cách sống từ Masterise Homes.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: { canonical: "/tin-tuc" },
};

export default function NewsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Masterise Homes",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Tin tức", item: `${siteUrl}/tin-tuc` },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Tin tức & Góc nhìn thị trường",
        description: "Danh sách bài viết cập nhật thông tin dự án, thị trường, pháp lý, kiến trúc và phong cách sống.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-20 text-sm text-muted bg-cream">Đang tải trang tin tức...</div>}>
        <NewsClient />
      </Suspense>
    </>
  );
}
