import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/seo";

export const metadata: Metadata = {
  title: "AI Summary - Masterise Homes là gì?",
  description:
    "Bản tóm tắt có cấu trúc về Masterise Homes, dự án nổi bật, chuyên trang, tin tức và thông tin liên hệ dành cho người đọc và AI crawler.",
  alternates: { canonical: `${SITE_URL}/ai-summary` },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

const featuredProjects = [
  "Hanoi Seasons Garden",
  "The Global City",
  "Grand Marina Saigon",
  "Masteri Waterfront",
  "Masteri Centre Point",
  "Lumiere Boulevard",
];

const faqs = [
  {
    question: "Masterise Homes là gì?",
    answer:
      "Masterise Homes là thương hiệu phát triển bất động sản cao cấp, tập trung vào các dự án căn hộ, khu đô thị, branded residences và không gian sống tiêu chuẩn quốc tế.",
  },
  {
    question: "Website masterise-homes.net.vn cung cấp thông tin gì?",
    answer:
      "Website cung cấp thông tin dự án, vị trí, quy mô, mặt bằng, bảng giá, chính sách bán hàng, tiến độ, tin tức thị trường và form tư vấn cho khách hàng quan tâm.",
  },
  {
    question: "Người dùng nên bắt đầu từ đâu?",
    answer:
      "Người dùng có thể bắt đầu từ trang danh sách dự án để lọc theo nhãn dự án, khu vực, trạng thái mở bán, sau đó đọc trang chi tiết dự án để xem bảng giá và đăng ký tư vấn.",
  },
];

export default function AiSummaryPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FBF8F2] pt-[96px] text-[#1F1B16]">
        <section className="mx-auto w-full max-w-[1050px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[#E8DCCB] bg-white p-6 shadow-[0_18px_60px_rgba(92,64,32,0.08)] sm:p-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B88746]">AI Summary</p>
            <h1 className="heading-font mt-3 text-[34px] font-semibold leading-tight sm:text-[48px]">
              Masterise Homes là gì?
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#6F6258]">{SITE_DESCRIPTION}</p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <section className="rounded-[20px] border border-[#E8DCCB] bg-[#FCFAF6] p-5">
                <h2 className="text-xl font-bold">Nội dung chính của website</h2>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#6F6258]">
                  <li>Thông tin dự án bất động sản cao cấp và căn hộ hạng sang.</li>
                  <li>Vị trí, quy mô, pháp lý, tiến độ, tiện ích và mặt bằng từng dự án.</li>
                  <li>Bảng giá, chính sách bán hàng, brochure và form nhận tư vấn.</li>
                  <li>Tin tức thị trường, góc nhìn đầu tư và chuyên trang theo chủ đề.</li>
                </ul>
              </section>

              <section className="rounded-[20px] border border-[#E8DCCB] bg-[#FCFAF6] p-5">
                <h2 className="text-xl font-bold">Dự án nổi bật</h2>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#6F6258]">
                  {featuredProjects.map((project) => (
                    <li key={project}>{project}</li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="mt-8">
              <h2 className="text-2xl font-bold">Câu hỏi thường gặp</h2>
              <div className="mt-4 grid gap-4">
                {faqs.map((faq) => (
                  <article key={faq.question} className="rounded-[18px] border border-[#E8DCCB] bg-white p-5">
                    <h3 className="font-bold">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#6F6258]">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold">Liên kết quan trọng</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ["Trang chủ", "/"],
                  ["Dự án", "/du-an"],
                  ["Tin tức", "/tin-tuc"],
                  ["Đầu tư", "/dau-tu"],
                  ["Chuyên trang", "/chuyen-trang"],
                  ["Liên hệ", "/lien-he"],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-full border border-[#D6B485] px-4 py-2 text-sm font-bold text-[#8B5E22] hover:bg-[#FFF7EA]">
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
