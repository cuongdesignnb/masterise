import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/config/seo";
import { fetchApiResponse } from "@/lib/serverApi";
import type { ApiResponse, Project, ProjectCategoryOption, ProjectStatusOption, RegionOption } from "@/types/api";
import ProjectsClient from "./ProjectsClient";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "Dự án Masterise Homes | Bộ sưu tập bất động sản hàng hiệu",
  description:
    "Khám phá danh mục dự án Masterise Homes với các bộ sưu tập căn hộ hạng sang, biệt thự cao cấp, shophouse, branded residences và bất động sản nghỉ dưỡng tại những vị trí chiến lược.",
  keywords: [
    "dự án Masterise Homes",
    "Masterise Homes",
    "The Global City",
    "Lumière Riverside",
    "Masteri Centre Point",
    "Grand Marina Saigon",
    "căn hộ hạng sang",
    "biệt thự cao cấp",
    "shophouse",
    "branded residences",
    "bất động sản cao cấp",
  ],
  openGraph: {
    title: "Dự án Masterise Homes",
    description:
      "Tuyển chọn các dự án bất động sản hàng hiệu, kiến tạo chuẩn sống quốc tế và giá trị bền vững.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: { canonical: "/du-an" },
};

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

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
  const [initialProjects, initialFeatured, regions, categories, statuses] = await Promise.all([
    fetchApiResponse<ApiResponse<Project[]>>(`/projects?${projectQuery}`, { revalidate: 180, tags: ["projects"] }),
    fetchApiResponse<ApiResponse<Project[]>>("/projects/featured?limit=6", { revalidate: 300, tags: ["projects-featured"] }),
    fetchApiResponse<ApiResponse<RegionOption[]>>("/projects/regions", { revalidate: 600, tags: ["project-taxonomy"] }),
    fetchApiResponse<ApiResponse<ProjectCategoryOption[]>>("/project-categories", { revalidate: 600, tags: ["project-taxonomy"] }),
    fetchApiResponse<ApiResponse<ProjectStatusOption[]>>("/project-statuses", { revalidate: 600, tags: ["project-taxonomy"] }),
  ]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Masterise Homes",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dự án",
            item: `${siteUrl}/du-an`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Dự án Masterise Homes",
        description:
          "Danh sách dự án bất động sản cao cấp của Masterise Homes theo khu vực, loại hình, trạng thái và mức giá.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
