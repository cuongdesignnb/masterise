import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Home, Newspaper } from "lucide-react";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header />

      <main className="relative flex min-h-[680px] flex-1 items-center overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:min-h-[760px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(184,135,70,0.16),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(184,135,70,0.11),transparent_32%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full border border-gold/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full border border-gold/15" />

        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-dark shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Không tìm thấy trang
            </div>

            <div className="relative mx-auto mb-7 flex w-fit items-center justify-center">
              <p className="heading-font select-none text-[116px] font-semibold leading-[0.8] tracking-[-0.08em] text-gold/15 sm:text-[170px] lg:text-[210px]">
                404
              </p>
              <div className="absolute flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-white/90 text-gold shadow-[0_18px_55px_rgba(86,60,29,0.16)] backdrop-blur sm:h-24 sm:w-24">
                <Home className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="heading-font text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[46px]">
              Trang bạn tìm kiếm không tồn tại
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Đường dẫn có thể đã thay đổi, nội dung đã được di chuyển hoặc địa chỉ bạn nhập chưa chính xác.
              Hãy quay về trang chủ để tiếp tục khám phá.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="gold-gradient inline-flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(143,99,47,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(143,99,47,0.3)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Về trang chủ
              </Link>
              <Link
                href="/du-an"
                className="inline-flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-full border border-gold/30 bg-white/80 px-6 text-sm font-bold text-gold-dark shadow-sm transition hover:border-gold hover:bg-white"
              >
                <Building2 className="h-4 w-4" />
                Xem các dự án
              </Link>
            </div>

            <div className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-5 border-t border-line/70 pt-6 text-xs text-muted sm:gap-8">
              <Link href="/du-an" className="inline-flex items-center gap-1.5 transition hover:text-gold">
                <Building2 className="h-3.5 w-3.5" />
                Dự án
              </Link>
              <span className="h-1 w-1 rounded-full bg-gold/50" />
              <Link href="/tin-tuc" className="inline-flex items-center gap-1.5 transition hover:text-gold">
                <Newspaper className="h-3.5 w-3.5" />
                Tin tức
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
