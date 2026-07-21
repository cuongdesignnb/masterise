import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_NAME, SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, Project, ProjectCategoryOption, ProjectStatusOption, RegionOption } from "@/types/api";
import ProjectsClient from "./ProjectsClient";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const query = await searchParams;
  const hasFilters = !!(
    first(query.q) ||
    first(query.region) ||
    first(query.category) ||
    first(query.project_status) ||
    first(query.price_range) ||
    (first(query.page) && first(query.page) !== "1")
  );

  return buildMetadata({
    title: "Dự án Masterise Homes | Bộ sưu tập bất động sản hàng hiệu",
    description:
      "Khám phá danh mục dự án Masterise Homes với các bộ sưu tập căn hộ hạng sang, biệt thự cao cấp, shophouse, branded residences và bất động sản nghỉ dưỡng tại những vị trí chiến lược.",
    path: "/du-an",
    noindex: hasFilters,
  });
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const projectParams: Record<string, string> = {};
  for (const key of ["q", "region", "category", "project_status", "price_range"] as const) {
    const value = first(query[key]);
    if (value) projectParams[key] = value;
  }
  projectParams.sort_by = "created_at";
  projectParams.sort_order = "desc";
  projectParams.per_page = "12";
  projectParams.page = first(query.page) || "1";
  const projectQuery = new URLSearchParams(projectParams).toString();

  const [initialProjects, initialFeatured, regions, categories, statuses, siteEntity] = await Promise.all([
    fetchApiResponse<ApiResponse<Project[]>>(`/projects?${projectQuery}`, { revalidate: 180, tags: ["projects"] }),
    fetchApiResponse<ApiResponse<Project[]>>("/projects/featured?limit=6", { revalidate: 300, tags: ["projects-featured"] }),
    fetchApiResponse<ApiResponse<RegionOption[]>>("/projects/regions", { revalidate: 600, tags: ["project-taxonomy"] }),
    fetchApiResponse<ApiResponse<ProjectCategoryOption[]>>("/project-categories", { revalidate: 600, tags: ["project-taxonomy"] }),
    fetchApiResponse<ApiResponse<ProjectStatusOption[]>>("/project-statuses", { revalidate: 600, tags: ["project-taxonomy"] }),
    getSiteEntityConfig(),
  ]);

  const pageUrl = `${SITE_URL}/du-an`;
  const projectsList = initialProjects?.data || [];

  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode();
  const webpageNode = {
    ...buildWebPageNode(pageUrl, "Dự án Masterise Homes", "Danh sách dự án bất động sản cao cấp của Masterise Homes"),
    '@type': 'CollectionPage',
  };
  const breadcrumbNode = buildBreadcrumbSchema(pageUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Dự án", item: "/du-an" },
  ]);

  const itemListNode = projectsList.length > 0 ? buildItemListSchema(
    pageUrl,
    "Danh sách dự án Masterise Homes",
    projectsList.map((p) => ({ name: p.name, url: `/${p.slug}` }))
  ) : null;

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
      <Suspense fallback={
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ProjectsClient
          initialProjects={initialProjects}
          initialProjectQuery={projectQuery}
          initialFeatured={initialFeatured?.data || []}
          initialRegions={regions?.data || []}
          initialCategories={categories?.data || []}
          initialStatuses={(statuses?.data || []).filter((status) => status.is_active && status.projects_count > 0)}
        />
      </Suspense>
    </>
  );
}
