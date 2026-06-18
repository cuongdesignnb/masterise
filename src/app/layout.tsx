import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Masterise Homes - Bất động sản hàng hiệu",
  description:
    "Masterise Homes mang đến những bất động sản hàng hiệu với tầm nhìn quốc tế, kiến tạo cộng đồng thịnh vượng và phong cách sống xứng tầm.",
  keywords: "masterise homes, bất động sản, hàng hiệu, căn hộ cao cấp, biệt thự, đầu tư bất động sản",
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
      className={`${roboto.variable} ${roboto.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-cream text-ink antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
