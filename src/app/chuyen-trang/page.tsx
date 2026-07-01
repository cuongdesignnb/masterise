import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPublicPages } from '@/services/pageServerService';

export const metadata = {
  title: 'Chuyên trang | Masterise Homes',
  description: 'Tổng hợp các chuyên trang, chính sách và nội dung thông tin từ Masterise Homes.',
};

export default async function ChuyenTrangListPage() {
  const pages = await getPublicPages();

  return (
    <>
      <Header />
      <main className="bg-[#FBF8F2] pt-[96px] text-[#1F1B16]">
        <section className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B88746]">
            Masterise Homes
          </p>
          <h1 className="heading-font text-[36px] font-semibold leading-tight sm:text-[52px]">
            Chuyên trang
          </h1>

          {pages.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/chuyen-trang/${page.slug}`}
                  className="group rounded-[22px] border border-[#E8DCCB] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(92,64,32,0.1)]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B88746]">
                    Chuyên trang
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-[#1F1B16] group-hover:text-[#B88746]">
                    {page.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#8C7A6B]">
                    {(page.content || '').replace(/<[^>]*>/g, '').slice(0, 180)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#E8DCCB] bg-white p-8 text-center text-sm text-[#8C7A6B]">
              Chưa có chuyên trang nào được xuất bản.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
