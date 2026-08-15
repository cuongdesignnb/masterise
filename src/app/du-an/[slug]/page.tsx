import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectDetailClient from "@/components/project-detail/ProjectDetailClient";
import ProjectReviews from "@/components/project-detail/ProjectReviews";
import StickyLeadCTA from "@/components/lead/StickyLeadCTA";
import JsonLd from "@/components/seo/JsonLd";
import { getProjectForSEO } from "@/services/projectServerService";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import { getSeoFeatureFlags } from "@/services/seoFeatureFlagsServerService";
import { mapApiProjectToProjectDetail } from "@/adapters/projectAdapter";
import type { Project as ApiProject } from "@/types/api";
import { absoluteUrl, SITE_URL } from "@/config/seo";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildImageObjectNode,
  buildPlaceNode,
  buildResidenceNode,
  buildOffersNode,
  buildProductNode,
  buildOperatorContext,
  buildFaqPageNode,
} from "@/lib/seo/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function stripHtml(value?: string | null) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function collectProjectSchemaImages(project: ApiProject) {
  const candidates = [
    project.seo_meta?.og_image,
    project.banner_image,
    project.thumbnail,
    ...(Array.isArray(project.gallery) ? project.gallery : []),
    ...(Array.isArray(project.detail_gallery) ? project.detail_gallery : []),
    project.map_image_url,
    project.video_thumbnail_url,
  ];

  return Array.from(new Set(candidates
    .map((value) => typeof value === "string" ? value.trim() : "")
    .filter((value) => value.length > 0)
    .filter((value) => !/^data:|^blob:/i.test(value))
    .filter((value) => !/(^|\/)file\.svg(?:$|[?#])/i.test(value))
    .map((value) => absoluteUrl(value))));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectForSEO(slug);

  if (!project) {
    return buildMetadata({
      title: "Không tìm thấy dự án",
      description: "Dự án không tồn tại hoặc đã bị gỡ xuống.",
      noindex: true,
    });
  }

  const seoTitle = project.seo_meta?.title ? { absolute: project.seo_meta.title } : project.name;
  const seoDescription = project.seo_meta?.description || project.description || `Thông tin chi tiết dự án ${project.name}.`;
  const seoImage = project.seo_meta?.og_image || project.banner_image || project.thumbnail || undefined;
  return buildMetadata({
    title: seoTitle,
    description: seoDescription,
    path: `/${project.slug}`,
    ogImage: seoImage ? absoluteUrl(seoImage) : undefined,
  });
}

/**
 * Render the canonical project detail page. The root `/{slug}` route imports
 * this named export so there is only one public URL for a project.
 */
export async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [projectData, siteEntity, featureFlags] = await Promise.all([
    getProjectForSEO(slug),
    getSiteEntityConfig(),
    getSeoFeatureFlags(),
  ]);

  if (!projectData) {
    notFound();
  }

  const projectDetail = mapApiProjectToProjectDetail(projectData);
  const projectUrl = `${SITE_URL}/${projectDetail.slug}`;
  const schemaDescription = stripHtml(projectDetail.description) || projectDetail.name;
  // Use only real, crawlable project media. The UI adapter intentionally has
  // a /file.svg placeholder for missing images; that placeholder must never
  // be advertised as the project's structured-data image.
  const projectImages = collectProjectSchemaImages(projectData);
  const primaryImageNode = projectImages[0]
    ? buildImageObjectNode(projectUrl, projectImages[0], projectDetail.name)
    : null;

  // Numerical Price / Offer Nodes
  const priceMin = projectData.price_min ? Number(projectData.price_min) : undefined;
  const priceMax = projectData.price_max ? Number(projectData.price_max) : undefined;
  const schemaPrice = projectDetail.schemaPrice ? Number(projectDetail.schemaPrice) : undefined;
  const offerCount = projectDetail.floorPlans.filter((plan) => {
    return Boolean(plan.name?.trim() || plan.productType?.trim());
  }).length;

  const offerNode = buildOffersNode(projectUrl, {
    price: schemaPrice || (priceMin && !priceMax ? priceMin : undefined),
    lowPrice: priceMin && priceMax && priceMax > priceMin ? priceMin : undefined,
    highPrice: priceMin && priceMax && priceMax > priceMin ? priceMax : undefined,
    offerCount: offerCount > 0 ? offerCount : undefined,
    priceCurrency: projectDetail.schemaPriceCurrency || "VND",
    availability: projectDetail.schemaAvailability || undefined,
  });

  // Real Reviews and Summary from Backend
  const reviewsList = projectData.reviews?.items ?? [];
  const reviewSummary = projectData.reviews?.aggregate ?? null;
  const validReviewCount = reviewsList.filter((rev) => {
    const rating = Number(rev.rating);
    return Boolean(rev.reviewer_name?.trim() && rev.review_body?.trim())
      && Number.isFinite(rating)
      && rating >= 1
      && rating <= 5;
  }).length;

  const aggregateRatingNode = reviewSummary && reviewSummary.ratingCount > 0 && validReviewCount > 0 ? {
    "@type": "AggregateRating",
    ratingValue: reviewSummary.ratingValue,
    ratingCount: reviewSummary.ratingCount,
    reviewCount: reviewSummary.reviewCount,
    bestRating: 5,
    worstRating: 1,
  } : undefined;

  // Keep one aggregate rating on the Product. Individual Review nodes are
  // rendered visibly in the page UI, but nesting every review under Product
  // makes Google's review parser create one rich-result item per review and
  // report "Review has multiple aggregate ratings" for the same product.
  const schemaReviewSummary = featureFlags.projectReviewSchema ? aggregateRatingNode : undefined;
  const isProductEligible = featureFlags.projectProductSchema
    && (!!offerNode || !!schemaReviewSummary);

  const effectiveSiteEntity = {
    ...siteEntity,
    enabled: featureFlags.siteEntity && siteEntity.enabled,
  };
  const operatorContext = buildOperatorContext(effectiveSiteEntity);

  const productNode = isProductEligible ? buildProductNode(projectUrl, {
    name: projectDetail.name,
    description: schemaDescription,
    images: projectImages,
    offers: offerNode || undefined,
    aggregateRating: schemaReviewSummary,
  }, operatorContext) : null;

  // Base Semantic Graph Nodes
  const operatorNode = buildOperatorNode(effectiveSiteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const webpageNode = buildWebPageNode(projectUrl, projectDetail.name, schemaDescription, {
    aboutId: `${projectUrl}#residence`,
    breadcrumbId: `${projectUrl}#breadcrumb`,
    imageId: primaryImageNode ? `${projectUrl}#primaryimage` : undefined,
  });
  const breadcrumbNode = buildBreadcrumbSchema(projectUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Dự án", item: "/du-an" },
    { name: projectDetail.name, item: `/${projectDetail.slug}` },
  ]);
  const placeNode = buildPlaceNode(
    projectUrl,
    projectDetail.name,
    projectData.address || projectData.location || projectDetail.address,
    projectData.lat ?? undefined,
    projectData.lng ?? undefined
  );
  const residenceNode = buildResidenceNode(
    projectUrl,
    projectDetail.name,
    schemaDescription,
    projectDetail.address,
    projectImages
  );


  const projectFaqNode = buildFaqPageNode(projectUrl, projectDetail.faqs);

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    primaryImageNode,
    placeNode,
    residenceNode,
    productNode,
    projectFaqNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <Header />
      <ProjectDetailClient project={projectDetail} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProjectReviews
          projectId={projectDetail.id || projectData.id}
          projectName={projectDetail.name}
          reviews={reviewsList}
          summary={reviewSummary}
          submissionEnabled={featureFlags.publicProjectReviewSubmission}
        />
      </div>
      <StickyLeadCTA projectId={projectDetail.id || projectData.id} projectName={projectDetail.name} />
      <Footer />
    </>
  );
}

/**
 * `/du-an/{slug}` is the legacy project URL. Keep it as a permanent redirect
 * so old links continue to work without exposing duplicate project content.
 */
export default async function LegacyProjectDetailRedirect({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectForSEO(slug);

  if (!project) {
    notFound();
  }

  permanentRedirect(`/${project.slug}`);
}
