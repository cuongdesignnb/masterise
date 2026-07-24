import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectDetailClient from "@/components/project-detail/ProjectDetailClient";
import ProjectReviews from "@/components/project-detail/ProjectReviews";
import StickyLeadCTA from "@/components/lead/StickyLeadCTA";
import FloatingContactButtons from "@/components/lead/FloatingContactButtons";
import JsonLd from "@/components/seo/JsonLd";
import { getProjectForSEO } from "@/services/projectServerService";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import { getSeoFeatureFlags } from "@/services/seoFeatureFlagsServerService";
import { mapApiProjectToProjectDetail } from "@/adapters/projectAdapter";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/config/seo";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
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
  const projectUrl = absoluteUrl(`/${project.slug}`);

  return buildMetadata({
    title: seoTitle,
    description: seoDescription,
    path: `/${project.slug}`,
    ogImage: seoImage ? absoluteUrl(seoImage) : undefined,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
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
  const projectImages = Array.from(new Set([
    projectDetail.heroImage,
    projectDetail.thumbnail,
    ...projectDetail.gallery.images,
    ...projectDetail.detailGallery.images,
    projectDetail.mapImageUrl,
  ].filter(Boolean).map((image) => absoluteUrl(image as string))));

  // Numerical Price / Offer Nodes
  const priceMin = projectData.price_min ? Number(projectData.price_min) : undefined;
  const priceMax = projectData.price_max ? Number(projectData.price_max) : undefined;
  const schemaPrice = projectDetail.schemaPrice ? Number(projectDetail.schemaPrice) : undefined;

  const offerNode = buildOffersNode(projectUrl, {
    price: schemaPrice || (priceMin && !priceMax ? priceMin : undefined),
    lowPrice: priceMin && priceMax && priceMax > priceMin ? priceMin : undefined,
    highPrice: priceMin && priceMax && priceMax > priceMin ? priceMax : undefined,
    priceCurrency: projectDetail.schemaPriceCurrency || "VND",
    availability: projectDetail.schemaAvailability || undefined,
  });

  // Real Reviews and Summary from Backend
  const reviewsList = projectData.reviews?.items ?? [];
  const reviewSummary = projectData.reviews?.aggregate ?? null;

  const aggregateRatingNode = reviewSummary && reviewSummary.ratingCount > 0 ? {
    "@type": "AggregateRating",
    ratingValue: reviewSummary.ratingValue,
    ratingCount: reviewSummary.ratingCount,
    reviewCount: reviewSummary.reviewCount,
    bestRating: 5,
    worstRating: 1,
  } : undefined;

  const reviewNodes = reviewsList.map((rev) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: rev.reviewer_name,
    },
    datePublished: rev.reviewed_at || undefined,
    reviewBody: rev.review_body,
    reviewRating: {
      "@type": "Rating",
      ratingValue: Number(rev.rating),
      bestRating: 5,
      worstRating: 1,
    },
  }));

  // Eligibility Gate: Only emit Product schema if there is a valid offer or real reviews
  const schemaReviewSummary = featureFlags.projectReviewSchema ? aggregateRatingNode : undefined;
  const schemaReviewNodes = featureFlags.projectReviewSchema ? reviewNodes : [];
  const isProductEligible = featureFlags.projectProductSchema
    && (!!offerNode || !!schemaReviewSummary || schemaReviewNodes.length > 0);

  const effectiveSiteEntity = {
    ...siteEntity,
    enabled: featureFlags.siteEntity && siteEntity.enabled,
  };
  const operatorContext = buildOperatorContext(effectiveSiteEntity);

  const productNode = isProductEligible ? buildProductNode(projectUrl, {
    name: projectDetail.name,
    description: projectDetail.description,
    images: projectImages,
    offers: offerNode || undefined,
    aggregateRating: schemaReviewSummary,
    reviews: schemaReviewNodes.length > 0 ? schemaReviewNodes : undefined,
  }, operatorContext) : null;

  // Base Semantic Graph Nodes
  const operatorNode = buildOperatorNode(effectiveSiteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const webpageNode = buildWebPageNode(projectUrl, projectDetail.name, projectDetail.description, { aboutId: `${projectUrl}#residence`, breadcrumbId: `${projectUrl}#breadcrumb` });
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
    projectDetail.description,
    projectDetail.address,
    projectImages
  );


  const projectFaqNode = buildFaqPageNode(projectUrl, projectDetail.faqs);

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
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
      <FloatingContactButtons projectId={projectDetail.id || projectData.id} />
      <Footer />
    </>
  );
}
