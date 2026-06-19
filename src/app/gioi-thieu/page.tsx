import type { Metadata } from "next";
import { aboutFaqs } from "@/data/aboutSeed";
import AboutClient from "./AboutClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

export const metadata: Metadata = {
  title:
    "Giới thiệu Masterise Homes | Nhà phát triển bất động sản hàng hiệu",
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
  openGraph: {
    title: "Giới thiệu Masterise Homes",
    description:
      "Masterise Homes kiến tạo chuẩn sống quốc tế, phát triển những không gian sống hàng hiệu và bền vững tại Việt Nam.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: { canonical: "/gioi-thieu" },
};

export default function GioiThieuPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Masterise Homes",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          "Nhà phát triển bất động sản hàng hiệu hàng đầu Việt Nam",
        foundingDate: "2014",
        // TODO: Replace hardcoded social URLs with dynamic values from site settings when possible
        sameAs: [
          "https://www.facebook.com/MasteriseHomes",
          "https://www.linkedin.com/company/masterise-homes",
        ],
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
            name: "Giới thiệu",
            item: `${siteUrl}/gioi-thieu`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: aboutFaqs.map((faq) => ({
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
      <AboutClient />
    </>
  );
}
