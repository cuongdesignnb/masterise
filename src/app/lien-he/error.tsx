"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";

export default function ContactPageError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Contact page render error", error);
  }, [error]);

  return <>
    <Header />
    <MobileTabBar />
    <main className="grid min-h-[70vh] place-items-center bg-ivory px-5 py-24 pb-32 lg:pb-24">
      <section className="w-full max-w-xl rounded-3xl border border-line/70 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Liên hệ Masterise Homes</p>
        <h1 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">Trang đang cần tải lại</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-base">
          Dữ liệu liên hệ chưa tải hoàn chỉnh. Vui lòng thử lại để tiếp tục kết nối cùng đội ngũ tư vấn.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <RefreshCw size={17} />
          Tải lại trang
        </button>
      </section>
    </main>
    <Footer />
  </>;
}
