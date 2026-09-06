import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/seo";
import { getServerApiUrl } from "@/lib/serverApi";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Masterise Homes",
    "dự án Masterise Homes",
    "bất động sản cao cấp",
    "căn hộ hạng sang",
    "Hanoi Seasons Garden",
    "The Global City",
    "Grand Marina Saigon",
    "Masteri Collection",
    "Lumiere Series",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Keep a conventional same-origin fallback. When an administrator selects
  // a favicon in Settings, generateMetadata replaces these URLs with the
  // configured media URL.
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Bất động sản cao cấp và hạng sang`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/**
 * Resolve the site favicon from the public settings so an administrator can
 * change it without rebuilding the frontend. The bundled app icons remain the
 * fallback when no favicon has been configured yet.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await fetch(`${getServerApiUrl()}/settings/public`, {
      next: { revalidate: 60, tags: ["settings"] },
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null) as { data?: { favicon_url?: unknown } } | null;
    const configuredFavicon = typeof payload?.data?.favicon_url === "string"
      ? payload.data.favicon_url.trim()
      : "";

    if (configuredFavicon && /^https?:\/\//i.test(configuredFavicon)) {
      return {
        ...baseMetadata,
        icons: {
          icon: configuredFavicon,
          shortcut: configuredFavicon,
          apple: configuredFavicon,
        },
      };
    }
  } catch {
    // Keep the bundled favicon when the settings API is unavailable.
  }

  return baseMetadata;
}

import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${roboto.variable} ${roboto.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-cream text-ink antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
