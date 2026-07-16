import type { Metadata } from 'next';
import CareerListClient from '@/components/career/CareerListClient';
import { getServerApiUrl } from '@/lib/serverApi';
import { absoluteUrl } from '@/config/seo';
import type { CareerOptions } from '@/types/career';
import type { CareerJob } from '@/types/career';

async function options(): Promise<CareerOptions> {
  const response = await fetch(`${getServerApiUrl()}/career/options`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) return { departments: [], locations: [], employment_types: [], stats: { open_jobs: 0, departments: 0, locations: 0 }, page_content: { title: 'Kiến tạo tương lai cùng Masterise Homes' } };
  return (await response.json()).data;
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await options(); const content = data.page_content;
  return { title: content.seo_title || 'Tuyển dụng | Masterise Homes', description: content.seo_description || content.description,
    alternates: { canonical: absoluteUrl('/tuyen-dung') }, openGraph: { title: content.seo_title || content.title, description: content.seo_description || content.description, images: content.hero_image ? [content.hero_image] : undefined, url: absoluteUrl('/tuyen-dung'), type: 'website' } };
}

async function jobs(): Promise<{ data: CareerJob[]; meta: { total: number; last_page: number } }> {
  try {
    const response = await fetch(`${getServerApiUrl()}/career/jobs?per_page=9`, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) return { data: [], meta: { total: 0, last_page: 1 } };
    const payload = await response.json();
    return { data: payload.data || [], meta: { total: payload.meta?.total || 0, last_page: payload.meta?.last_page || 1 } };
  } catch { return { data: [], meta: { total: 0, last_page: 1 } }; }
}

export default async function CareerPage() { const [initialOptions, initialJobs] = await Promise.all([options(), jobs()]); return <CareerListClient initialOptions={initialOptions} initialJobs={initialJobs.data} initialMeta={initialJobs.meta} />; }
