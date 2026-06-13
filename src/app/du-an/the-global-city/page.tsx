import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectDetailClient from "@/components/project-detail/ProjectDetailClient";
import { projectDetail } from "@/data/projectDetailSeed";

const siteUrl = "https://masterisehomes.com";

export const metadata: Metadata = {
  title: "The Global City - Trung tâm mới của TP. Thủ Đức | Masterise Homes",
  description:
    "Khám phá dự án The Global City của Masterise Homes tại trung tâm TP. Thủ Đức: quy mô 117,4 ha, sản phẩm đa dạng, tiện ích đẳng cấp, vị trí chiến lược và chính sách bán hàng mới nhất.",
  keywords: [
    "The Global City",
    "Masterise Homes",
    "dự án The Global City",
    "bất động sản TP Thủ Đức",
    "nhà phố The Global City",
    "biệt thự The Global City",
    "căn hộ cao cấp Masterise",
    "dự án bất động sản cao cấp",
  ],
  alternates: {
    canonical: "/du-an/the-global-city",
  },
  openGraph: {
    title: "The Global City - Trung tâm mới của TP. Thủ Đức",
    description:
      "Thông tin vị trí, tiện ích, mặt bằng, bảng giá và chính sách bán hàng dự án The Global City.",
    type: "website",
    locale: "vi_VN",
    url: `${siteUrl}/du-an/the-global-city`,
    images: [
      {
        url: projectDetail.heroImage,
        width: 1200,
        height: 630,
        alt: "The Global City Masterise Homes",
      },
    ],
  },
};

export default function TheGlobalCityPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Masterise Homes",
        url: siteUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dự án",
            item: `${siteUrl}/du-an`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: projectDetail.name,
            item: `${siteUrl}/du-an/${projectDetail.slug}`,
          },
        ],
      },
      {
        "@type": "Product",
        name: projectDetail.name,
        image: projectDetail.heroImage,
        brand: { "@type": "Brand", name: "Masterise Homes" },
        description: projectDetail.description,
        category: "Real Estate Project",
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: "8900000000",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/du-an/${projectDetail.slug}`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: projectDetail.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <ProjectDetailClient />
      <Footer />
    </>
  );
}
