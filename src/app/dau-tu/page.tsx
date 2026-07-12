import type { Metadata } from "next";
import DauTuClient from "./DauTuClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cơ hội đầu tư Masterise Homes - Sự kiện, chính sách và phân tích",
  description:
    "Cập nhật các cơ hội sở hữu, sự kiện mở bán và phân tích giá trị đầu tư từ hệ sinh thái dự án Masterise Homes.",
  alternates: { canonical: "/dau-tu" },
};

export default function DauTuPage() {
  return <Suspense fallback={<div className="min-h-screen bg-ivory" />}><DauTuClient /></Suspense>;
}
