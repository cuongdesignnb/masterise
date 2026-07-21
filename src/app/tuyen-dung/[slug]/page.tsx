import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CareerDetailClient from '@/components/career/CareerDetailClient';
import { getServerApiUrl } from '@/lib/serverApi';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/config/seo';
import type { CareerJob, CareerOptions } from '@/types/career';
import { buildMetadata } from '@/lib/seo/buildMetadata';
import { getSiteEntityConfig } from '@/services/siteEntityServerService';
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildJobPostingSchema,
} from '@/lib/seo/schema';
import JsonLd from '@/components/seo/JsonLd';

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
  if (!data) {
    return buildMetadata({
      title: 'Không tìm thấy vị trí | Masterise Homes',
      noindex: true,
    });
  }

  const { job } = data;
  const description = job.seo_description || job.short_description || `Thông tin tuyển dụng vị trí ${job.title} tại Masterise Homes.`;
  const image = job.banner_image || job.thumbnail ? absoluteUrl(job.banner_image || job.thumbnail || '') : undefined;

  return buildMetadata({
    title: job.seo_title || `${job.title} | Tuyển dụng Masterise Homes`,
    description,
    keywords: job.seo_keywords || undefined,
    path: `/tuyen-dung/${job.slug}`,
    ogImage: image,
    noindex: !job.accepting_applications,
  });
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  const [data, rules, siteEntity] = await Promise.all([
    detail(slug),
    applicationRules(),
    getSiteEntityConfig(),
  ]);

  if (!data) notFound();
  const { job } = data;
  const jobUrl = `${SITE_URL}/tuyen-dung/${job.slug}`;
  const description = job.seo_description || job.short_description || `Thông tin tuyển dụng vị trí ${job.title} tại Masterise Homes.`;

  // Build JSON-LD Graph Nodes
  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode();
  const webpageNode = buildWebPageNode(jobUrl, job.title, description, `${jobUrl}#job`);
  const breadcrumbNode = buildBreadcrumbSchema(jobUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Tuyển dụng", item: "/tuyen-dung" },
    { name: job.title, item: `/tuyen-dung/${job.slug}` },
  ]);

  const jobPostingNode = buildJobPostingSchema(jobUrl, {
    title: job.title,
    description: job.description || job.short_description || job.title,
    datePosted: job.published_at || new Date().toISOString(),
    validThrough: job.application_deadline || undefined,
    employmentType: (job.employment_type?.toUpperCase() as any) || 'FULL_TIME',
    streetAddress: job.location || 'Trụ sở Masterise Homes',
    salaryMin: job.salary_min ? Number(job.salary_min) : undefined,
    salaryMax: job.salary_max ? Number(job.salary_max) : undefined,
    salaryCurrency: job.salary_currency || 'VND',
  });

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    jobPostingNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <CareerDetailClient job={job} related={data.related} applicationRules={rules} />
    </>
  );
}
