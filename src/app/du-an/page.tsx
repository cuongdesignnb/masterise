import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectsClient from "./ProjectsClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

export const metadata: Metadata = {
  title: "Dự án Masterise Homes | Bộ sưu tập bất động sản hàng hiệu",
  description:
    "Khám phá danh mục dự án Masterise Homes với các bộ sưu tập căn hộ hạng sang, biệt thự cao cấp, shophouse, branded residences và bất động sản nghỉ dưỡng tại những vị trí chiến lược.",
  keywords: [
    "dự án Masterise Homes",
    "Masterise Homes",
    "The Global City",
    "Lumière Riverside",
    "Masteri Centre Point",
    "Grand Marina Saigon",
    "căn hộ hạng sang",
    "biệt thự cao cấp",
    "shophouse",
    "branded residences",
    "bất động sản cao cấp",
  ],
  openGraph: {
    title: "Dự án Masterise Homes",
    description:
      "Tuyển chọn các dự án bất động sản hàng hiệu, kiến tạo chuẩn sống quốc tế và giá trị bền vững.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: { canonical: "/du-an" },
};

export default function ProjectsPage() {
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
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dự án",
            item: `${siteUrl}/du-an`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Dự án Masterise Homes",
        description:
          "Danh sách dự án bất động sản cao cấp của Masterise Homes theo khu vực, loại hình, trạng thái và mức giá.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ProjectsClient />
      </Suspense>
    </>
  );
}
