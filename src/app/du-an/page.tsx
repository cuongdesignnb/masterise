import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";

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
        url: "https://masterisehomes.com",
        logo: "https://masterisehomes.com/logo.png",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: "https://masterisehomes.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dự án",
            item: "https://masterisehomes.com/du-an",
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
      <ProjectsClient />
    </>
  );
}
