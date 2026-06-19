import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectDetailClient from '@/components/project-detail/ProjectDetailClient';
import StickyLeadCTA from '@/components/lead/StickyLeadCTA';
import FloatingContactButtons from '@/components/lead/FloatingContactButtons';
import GlobalContactForm from '@/components/lead/GlobalContactForm';
import { getProjectForSEO } from '@/services/projectServerService';
import { mapApiProjectToProjectDetail } from '@/adapters/projectAdapter';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masterisehomes.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectForSEO(slug);
  
  if (!project) {
    return {
      title: 'Không tìm thấy dự án | Masterise Homes',
      description: 'Dự án không tồn tại hoặc đã bị gỡ xuống.',
    };
  }

  return {
    title: `${project.name} - Chi tiết dự án | Masterise Homes`,
    description: project.description || `Thông tin chi tiết dự án ${project.name} phát triển bởi Masterise Homes.`,
    openGraph: {
      title: project.name,
      description: project.description || '',
      images: [
        {
          url: project.banner_image || project.thumbnail || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
        },
      ],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const projectData = await getProjectForSEO(slug);

  if (!projectData) {
    notFound();
  }

  // Map database project data to ProjectDetail structure
  const projectDetail = mapApiProjectToProjectDetail(projectData);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Masterise Homes",
        url: siteUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dự án",
            item: `${siteUrl}/du-an`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: projectDetail.name,
            item: `${siteUrl}/du-an/${projectDetail.slug}`,
          },
        ],
      },
      {
        "@type": "Product",
        name: projectDetail.name,
        image: projectDetail.heroImage,
        brand: { "@type": "Brand", name: "Masterise Homes" },
        description: projectDetail.description,
        category: "Real Estate Project",
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: "8900000000",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/du-an/${projectDetail.slug}`,
        },
      },
    ],
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
      <StickyLeadCTA projectId={projectDetail.id || 1} projectName={projectDetail.name} />
      <FloatingContactButtons projectId={projectDetail.id || 1} />
      <GlobalContactForm
        projectId={projectDetail.id || projectData.id}
        leadSourcePosition="project_detail_footer_form"
      />
      <Footer />
    </>
  );
}
