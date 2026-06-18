import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Masterise Homes - Bất động sản cao cấp và hạng sang",
  description:
    "Masterise Homes kiến tạo bộ sưu tập bất động sản cao cấp, căn hộ hạng sang và cơ hội đầu tư dành cho cộng đồng tinh hoa.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePageClient />;
}
