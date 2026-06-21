import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Container from '@/components/Container';

interface StaticPageData {
  title: string;
  content: string;
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

async function getPageData(slug: string): Promise<StaticPageData | null> {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  // Fallback to absolute production API url or default local url
  const apiUrl = envUrl || 'https://api.masterise-homes.net.vn/api/v1';

  try {
    const res = await fetch(`${apiUrl}/pages/${slug}`, {
      next: { revalidate: 60 } // cache for 1 minute
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error('Error fetching static page:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPageData(params.slug);
  if (!page) return { title: 'Không tìm thấy trang' };

  return {
    title: page.seo_meta?.title || `${page.title} | Masterise Homes`,
    description: page.seo_meta?.description || `Trang thông tin ${page.title} của Masterise Homes.`,
    keywords: page.seo_meta?.keywords ? page.seo_meta.keywords.split(',').map(s => s.trim()) : [],
    openGraph: {
      title: page.seo_meta?.title || page.title,
      description: page.seo_meta?.description || `Trang thông tin ${page.title} của Masterise Homes.`,
    }
  };
}

export default async function StaticPageDetail({ params }: { params: { slug: string } }) {
  const page = await getPageData(params.slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8F2] pt-28 pb-16">
        <Container>
          <article className="max-w-4xl mx-auto bg-white border border-[#E8DCCB] rounded-3xl p-6 md:p-12 shadow-sm space-y-8">
            {/* Header section */}
            <div className="space-y-4 border-b border-[#E8DCCB]/60 pb-6 text-center">
              <h1 className="text-3xl md:text-4xl font-heading font-semibold text-[#1F1B16] leading-tight">
                {page.title}
              </h1>
              <div className="w-12 h-1 bg-[#B88746] mx-auto" />
            </div>

            {/* Rich text Content */}
            <div 
              className="prose prose-stone max-w-none prose-sm md:prose-base prose-headings:font-heading prose-headings:font-semibold prose-headings:text-[#1F1B16] prose-a:text-[#B88746] hover:prose-a:underline prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: page.content || '' }}
            />
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
