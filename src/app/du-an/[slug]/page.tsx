import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectDetailClient from "@/components/project-detail/ProjectDetailClient";
import StickyLeadCTA from "@/components/lead/StickyLeadCTA";
import FloatingContactButtons from "@/components/lead/FloatingContactButtons";
import { getProjectForSEO } from "@/services/projectServerService";
import { mapApiProjectToProjectDetail } from "@/adapters/projectAdapter";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/config/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function stripHtml(value?: string | null) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");
    let id = "";
    if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (!id && parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (!id && parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (!id) id = parsed.searchParams.get("v") || "";
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function getYouTubeThumbnailUrl(url?: string | null) {
  const embedUrl = getYouTubeEmbedUrl(url);
  const match = embedUrl?.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectForSEO(slug);

  if (!project) {
    return {
      title: "Không tìm thấy dự án",
      description: "Dự án không tồn tại hoặc đã bị gỡ xuống.",
    };
  }

  const seoTitle = project.seo_meta?.title || project.name;
  const seoDescription = project.seo_meta?.description || project.description || `Thông tin chi tiết dự án ${project.name}.`;
  const seoImage = project.seo_meta?.og_image || project.banner_image || project.thumbnail || undefined;
  const projectUrl = absoluteUrl(`/du-an/${project.slug}`);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: projectUrl },
    openGraph: {
      title: project.seo_meta?.og_title || seoTitle,
      description: project.seo_meta?.og_description || seoDescription,
      url: projectUrl,
      type: "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      images: seoImage ? [{ url: absoluteUrl(seoImage) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.seo_meta?.og_title || seoTitle,
      description: project.seo_meta?.og_description || seoDescription,
      images: seoImage ? [absoluteUrl(seoImage)] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const projectData = await getProjectForSEO(slug);

  if (!projectData) {
    notFound();
  }

  const projectDetail = mapApiProjectToProjectDetail(projectData);
  const projectUrl = `${SITE_URL}/du-an/${projectDetail.slug}`;
  const projectImages = Array.from(new Set([
    projectDetail.heroImage,
    projectDetail.thumbnail,
    ...projectDetail.gallery.images,
    ...projectDetail.detailGallery.images,
    projectDetail.mapImageUrl,
  ].filter(Boolean).map((image) => absoluteUrl(image as string))));

  const offer = projectDetail.schemaPrice || projectData.price_text
    ? {
        "@type": "Offer",
        priceCurrency: projectDetail.schemaPriceCurrency || "VND",
        price: projectDetail.schemaPrice || undefined,
        availability: projectDetail.schemaAvailability || undefined,
        url: projectUrl,
      }
    : undefined;

  const offerItems = [
    ...projectDetail.floorPlans.map((item, index) => ({
      "@type": "Offer",
      position: index + 1,
      name: item.name || item.productType || `Sản phẩm ${index + 1}`,
      description: item.description || item.area || item.totalArea || undefined,
      priceCurrency: projectDetail.schemaPriceCurrency || "VND",
      availability: projectDetail.schemaAvailability || "https://schema.org/InStock",
      url: projectUrl,
    })),
    ...projectDetail.priceRows
      .filter((item) => item.kind === "row")
      .map((item, index) => ({
        "@type": "Offer",
        position: projectDetail.floorPlans.length + index + 1,
        name: item.productType || `Bảng giá ${index + 1}`,
        description: [item.area, item.payment, item.status, item.note].filter(Boolean).join(" - ") || undefined,
        price: item.price || undefined,
        priceCurrency: projectDetail.schemaPriceCurrency || "VND",
        availability: projectDetail.schemaAvailability || "https://schema.org/InStock",
        url: projectUrl,
      })),
  ];

  const faqSchema = projectDetail.faqs.length
    ? {
        "@type": "FAQPage",
        "@id": `${projectUrl}#faq`,
        mainEntity: projectDetail.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripHtml(faq.answer),
          },
        })),
      }
    : null;

  const offerCatalog = offerItems.length
    ? {
        "@type": "OfferCatalog",
        "@id": `${projectUrl}#offers`,
        name: `Sản phẩm và bảng giá ${projectDetail.name}`,
        itemListElement: offerItems,
      }
    : null;

  const videoSchema = projectDetail.videoUrl
    ? {
        "@type": "VideoObject",
        "@id": `${projectUrl}#video`,
        name: `Video giới thiệu ${projectDetail.name}`,
        description: projectDetail.description,
        thumbnailUrl: getYouTubeThumbnailUrl(projectDetail.videoUrl) || projectDetail.heroImage,
        uploadDate: projectData.published_at || projectData.created_at || projectData.updated_at,
        embedUrl: getYouTubeEmbedUrl(projectDetail.videoUrl),
        contentUrl: /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(projectDetail.videoUrl) ? projectDetail.videoUrl : undefined,
      }
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
      {
        "@type": "WebPage",
        "@id": `${projectUrl}#webpage`,
        url: projectUrl,
        name: projectDetail.name,
        description: projectDetail.description,
        about: { "@id": `${projectUrl}#project` },
        primaryImageOfPage: projectImages[0] ? { "@type": "ImageObject", url: projectImages[0] } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${projectUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Dự án", item: `${SITE_URL}/du-an` },
          { "@type": "ListItem", position: 3, name: projectDetail.name, item: projectUrl },
        ],
      },
      {
        "@type": "Product",
        "@id": `${projectUrl}#project`,
        name: projectDetail.name,
        image: projectImages,
        brand: { "@type": "Brand", name: SITE_NAME },
        description: projectDetail.description,
        category: "Real Estate Project",
        ...(offer ? { offers: offer } : {}),
      },
      {
        "@type": "Residence",
        "@id": `${projectUrl}#residence`,
        name: projectDetail.name,
        description: projectDetail.description,
        url: projectUrl,
        image: projectImages,
        address: projectDetail.address,
      },
      {
        "@type": "Place",
        "@id": `${projectUrl}#place`,
        name: projectDetail.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: projectData.address || projectData.location || projectDetail.address,
          addressLocality: projectData.district || projectData.province || undefined,
          addressRegion: projectData.province || undefined,
          addressCountry: "VN",
        },
        geo: projectData.lat && projectData.lng ? {
          "@type": "GeoCoordinates",
          latitude: projectData.lat,
          longitude: projectData.lng,
        } : undefined,
      },
      offerCatalog,
      faqSchema,
      ...projectImages.slice(0, 8).map((image, index) => ({
        "@type": "ImageObject",
        "@id": `${projectUrl}#image-${index + 1}`,
        url: image,
        caption: `${projectDetail.name} - hình ảnh ${index + 1}`,
      })),
      videoSchema,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <ProjectDetailClient project={projectDetail} />
      <StickyLeadCTA projectId={projectDetail.id || projectData.id} projectName={projectDetail.name} />
      <FloatingContactButtons projectId={projectDetail.id || projectData.id} />
      <Footer />
    </>
  );
}
