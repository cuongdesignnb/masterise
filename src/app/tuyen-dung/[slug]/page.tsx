import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CareerDetailClient from '@/components/career/CareerDetailClient';
import { getServerApiUrl } from '@/lib/serverApi';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/config/seo';
import type { CareerJob, CareerOptions } from '@/types/career';

type Props = { params: Promise<{ slug: string }> };

async function detail(slug: string): Promise<{ job: CareerJob; related: CareerJob[] } | null> {
  const response = await fetch(`${getServerApiUrl()}/career/jobs/${slug}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) return null;
  return (await response.json()).data;
}

async function applicationRules(): Promise<CareerOptions['application_rules']> {
  try {
    const response = await fetch(`${getServerApiUrl()}/career/options`, { cache: 'no-store', headers: { Accept: 'application/json' } });
    return response.ok ? (await response.json()).data?.application_rules : undefined;
  } catch { return undefined; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await detail((await params).slug);
  if (!data) return { title: 'Không tìm thấy vị trí | Masterise Homes' };
  const { job } = data;
  return {
    title: job.seo_title || `${job.title} | Tuyển dụng Masterise Homes`, description: job.seo_description || job.short_description || undefined,
    keywords: job.seo_keywords || undefined, alternates: { canonical: absoluteUrl(`/tuyen-dung/${job.slug}`) },
    robots: job.accepting_applications ? undefined : { index: false, follow: true },
    openGraph: { title: job.seo_title || job.title, description: job.seo_description || job.short_description || undefined,
      images: job.banner_image || job.thumbnail ? [absoluteUrl(job.banner_image || job.thumbnail || '')] : undefined,
      url: absoluteUrl(`/tuyen-dung/${job.slug}`), type: 'website' },
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const [data, rules] = await Promise.all([detail((await params).slug), applicationRules()]);
  if (!data) notFound();
  const { job } = data;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'JobPosting', title: job.title, description: job.description || job.short_description,
    datePosted: job.published_at, validThrough: job.application_deadline, employmentType: job.employment_type.toUpperCase(),
    hiringOrganization: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', streetAddress: job.location, addressCountry: 'VN' } },
    identifier: { '@type': 'PropertyValue', name: SITE_NAME, value: job.code }, url: absoluteUrl(`/tuyen-dung/${job.slug}`),
  };
  if (job.salary_min || job.salary_max) schema.baseSalary = { '@type': 'MonetaryAmount', currency: job.salary_currency,
    value: { '@type': 'QuantitativeValue', minValue: job.salary_min, maxValue: job.salary_max, unitText: 'MONTH' } };
  Object.keys(schema).forEach(key => schema[key] == null && delete schema[key]);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><CareerDetailClient job={job} related={data.related} applicationRules={rules} /></>;
}
