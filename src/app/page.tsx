import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "vi_VN",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function Home() {
  return <HomePageClient />;
}
