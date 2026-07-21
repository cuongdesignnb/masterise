import type { Metadata } from 'next';
import CareerListClient from '@/components/career/CareerListClient';
import { getServerApiUrl } from '@/lib/serverApi';
import { SITE_URL } from '@/config/seo';
import type { CareerOptions } from '@/types/career';
import type { CareerJob } from '@/types/career';
import { buildMetadata } from '@/lib/seo/buildMetadata';
import { getSiteEntityConfig } from '@/services/siteEntityServerService';
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildOperatorContext,
} from '@/lib/seo/schema';
import JsonLd from '@/components/seo/JsonLd';

async function options(): Promise<CareerOptions> {
  const response = await fetch(`${getServerApiUrl()}/career/options`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) return { departments: [], locations: [], employment_types: [], stats: { open_jobs: 0, departments: 0, locations: 0 }, page_content: { title: 'Kiến tạo tương lai cùng Masterise Homes' } };
  return (await response.json()).data;
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await options();
  const content = data.page_content;

  return buildMetadata({
    title: content.seo_title ? { absolute: content.seo_title } : 'Tuyển dụng',
    description: content.seo_description || content.description || 'Cơ hội nghề nghiệp và tuyển dụng tại Masterise Homes.',
    path: '/tuyen-dung',
    ogImage: content.hero_image || undefined,
  });
}

async function jobs(): Promise<{ data: CareerJob[]; meta: { total: number; last_page: number } }> {
  try {
    const response = await fetch(`${getServerApiUrl()}/career/jobs?per_page=9`, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) return { data: [], meta: { total: 0, last_page: 1 } };
    const payload = await response.json();
    return { data: payload.data || [], meta: { total: payload.meta?.total || 0, last_page: payload.meta?.last_page || 1 } };
  } catch { return { data: [], meta: { total: 0, last_page: 1 } }; }
}

export default async function CareerPage() {
  const [initialOptions, initialJobs, siteEntity] = await Promise.all([options(), jobs(), getSiteEntityConfig()]);
  const pageUrl = `${SITE_URL}/tuyen-dung`;

  const operatorContext = buildOperatorContext(siteEntity);
  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const webpageNode = {
    ...buildWebPageNode(pageUrl, 'Tuyển dụng Masterise Homes', 'Cơ hội nghề nghiệp và môi trường làm việc đẳng cấp quốc tế'),
    '@type': 'CollectionPage',
  };
  const breadcrumbNode = buildBreadcrumbSchema(pageUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Tuyển dụng", item: "/tuyen-dung" },
  ]);

  const itemList = (initialJobs.data || []).map(j => ({ name: j.title, url: `/tuyen-dung/${j.slug}` }));
  const itemListNode = itemList.length > 0
    ? buildItemListSchema(pageUrl, "Cơ hội nghề nghiệp Masterise Homes", itemList)
    : null;

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    itemListNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <CareerListClient initialOptions={initialOptions} initialJobs={initialJobs.data} initialMeta={initialJobs.meta} />
    </>
  );
}
