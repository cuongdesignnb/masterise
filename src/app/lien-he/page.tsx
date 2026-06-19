import type { Metadata } from "next";
import { contactFaqs } from "@/data/contactSeed";
import ContactClient from "./ContactClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

export const metadata: Metadata = {
  title: "Liên hệ Masterise Homes | Tư vấn dự án bất động sản cao cấp",
  description:
    "Liên hệ Masterise Homes để nhận tư vấn chuyên sâu về dự án bất động sản hàng hiệu, bảng giá mới nhất và đặt lịch tham quan nhà mẫu.",
  keywords: [
    "liên hệ Masterise Homes",
    "tư vấn bất động sản",
    "bất động sản cao cấp",
    "dự án Masterise Homes",
    "mua căn hộ hạng sang",
    "branded residences",
    "hotline Masterise Homes",
  ],
  openGraph: {
    title: "Liên hệ Masterise Homes",
    description:
      "Liên hệ ngay để nhận tư vấn miễn phí về dự án bất động sản hàng hiệu từ Masterise Homes.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: { canonical: "/lien-he" },
};

export default function LienHePage() {
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
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+84-1900-988-998",
          contactType: "customer service",
          areaServed: "VN",
          availableLanguage: ["Vietnamese", "English"],
        },
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
            name: "Liên hệ",
            item: `${siteUrl}/lien-he`,
          },
        ],
      },
      {
        "@type": "ContactPage",
        name: "Liên hệ Masterise Homes",
        description:
          "Trang liên hệ chính thức của Masterise Homes – nhà phát triển bất động sản hàng hiệu tại Việt Nam.",
        url: `${siteUrl}/lien-he`,
        mainEntity: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: contactFaqs.map((faq) => ({
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
      <ContactClient />
    </>
  );
}
