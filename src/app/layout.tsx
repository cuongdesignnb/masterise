import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Masterise Homes - Bất động sản hàng hiệu",
  description:
    "Masterise Homes mang đến những bất động sản hàng hiệu với tầm nhìn quốc tế, kiến tạo cộng đồng thịnh vượng và phong cách sống xứng tầm.",
  keywords: "masterise homes, bat dong san, hang hieu, can ho cao cap, biet thu",
  authors: [{ name: "Masterise Homes" }],
};

import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${beVietnam.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-cream text-ink antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
