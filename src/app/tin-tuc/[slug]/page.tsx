import type { Metadata } from "next";
import NewsArticleClient from "./NewsArticleClient";
import { articleDetail } from "@/data/newsDetailSeed";

export function generateStaticParams() {
  return [
    {
      slug: "the-global-city-tam-diem-moi-cua-bat-dong-san-cao-cap-tai-tp-thu-duc",
    },
  ];
}

export const metadata: Metadata = {
  title:
    "The Global City: Tâm điểm mới của bất động sản cao cấp tại TP. Thủ Đức | Masterise Homes",
  description:
    "Khám phá bài viết phân tích The Global City – tâm điểm mới của bất động sản cao cấp tại TP. Thủ Đức với vị trí chiến lược, quy hoạch chuẩn quốc tế và tiềm năng đầu tư vượt trội.",
  keywords: [
    "The Global City",
    "bất động sản TP Thủ Đức",
    "bất động sản cao cấp",
    "Masterise Homes",
    "tin tức bất động sản",
    "đầu tư bất động sản",
    "thị trường Thủ Đức",
    "quy hoạch đô thị",
  ],
  openGraph: {
    title:
      "The Global City: Tâm điểm mới của bất động sản cao cấp tại TP. Thủ Đức",
    description:
      "Phân tích vị trí, quy hoạch, tiện ích và tiềm năng đầu tư của The Global City.",
    type: "article",
    locale: "vi_VN",
  },
  alternates: {
    canonical:
      "/tin-tuc/the-global-city-tam-diem-moi-cua-bat-dong-san-cao-cap-tai-tp-thu-duc",
  },
};

export default function NewsArticleDetailPage() {
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Masterise Homes",
    url: "https://masterisehomes.com",
    logo: "https://masterisehomes.com/logo.png",
    sameAs: [
      "https://www.facebook.com/MasteriseHomes",
      "https://www.youtube.com/@MasteriseHomes",
    ],
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: articleDetail.breadcrumb.map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item:
        index === 0
          ? "https://masterisehomes.com"
          : index === 1
            ? "https://masterisehomes.com/tin-tuc"
            : undefined,
    })),
  };

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleDetail.title,
    description: articleDetail.excerpt,
    image: articleDetail.heroImage,
    datePublished: "2024-05-10",
    dateModified: "2024-05-10",
    author: {
      "@type": "Person",
      name: articleDetail.author.name,
      jobTitle: articleDetail.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Masterise Homes",
      logo: {
        "@type": "ImageObject",
        url: "https://masterisehomes.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://masterisehomes.com/tin-tuc/${articleDetail.slug}`,
    },
    articleSection: articleDetail.category,
    keywords: [
      "The Global City",
      "bất động sản cao cấp",
      "TP Thủ Đức",
      "Masterise Homes",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdOrganization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumb),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdArticle),
        }}
      />
      <NewsArticleClient />
    </>
  );
}
