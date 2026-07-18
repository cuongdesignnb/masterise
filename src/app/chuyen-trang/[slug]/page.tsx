import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RichHtmlContent from '@/components/content/RichHtmlContent';
import { getPageForSEO } from '@/services/pageServerService';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageForSEO(slug);

  if (!page) {
    return {
      title: 'Không tìm thấy chuyên trang | Masterise Homes',
      description: 'Chuyên trang không tồn tại hoặc chưa được xuất bản.',
    };
  }

  const description =
    page.seo_meta?.description ||
    page.content?.replace(/<[^>]*>/g, '').slice(0, 160) ||
    page.title;

  return {
    title: page.seo_meta?.title || `${page.title} | Masterise Homes`,
    description,
    keywords: page.seo_meta?.keywords
      ? page.seo_meta.keywords.split(',').map((keyword) => keyword.trim())
      : undefined,
    openGraph: {
      title: page.seo_meta?.title || page.title,
      description,
    },
  };
}

export default async function ChuyenTrangDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageForSEO(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-[#FBF8F2] pt-[96px] text-[#1F1B16]">
        <section className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[#E8DCCB] bg-white p-5 shadow-[0_18px_60px_rgba(92,64,32,0.08)] sm:p-8 lg:p-10">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B88746]">
              Chuyên trang
            </p>
            <h1 className="heading-font text-[34px] font-semibold leading-tight text-[#1F1B16] sm:text-[46px]">
              {page.title}
            </h1>

            <RichHtmlContent
              html={page.content}
              className="prose prose-stone mt-8 max-w-none text-[15px] leading-8 prose-headings:font-heading prose-headings:text-[#1F1B16] prose-a:text-[#B88746] hover:prose-a:underline prose-img:rounded-2xl"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
