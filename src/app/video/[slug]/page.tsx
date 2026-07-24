import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import JsonLd from "@/components/seo/JsonLd";
import VideoWatchPlayer from "@/components/video/VideoWatchPlayer";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/config/seo";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import {
  buildBreadcrumbSchema,
  buildOperatorContext,
  buildOperatorNode,
  buildVideoObjectNode,
  buildWebPageNode,
  buildWebSiteNode,
} from "@/lib/seo/schema";
import { getProjectVideo } from "@/lib/video/projectVideo";
import { getProjectForVideoSlug } from "@/services/projectServerService";
import { getSeoFeatureFlags } from "@/services/seoFeatureFlagsServerService";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getWatchVideo(slug: string) {
  const project = await getProjectForVideoSlug(slug);
  const video = getProjectVideo(project);
  return project && video ? { project, video } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getWatchVideo(slug);

  if (!result) {
    return buildMetadata({
      title: "Không tìm thấy video",
      description: "Video không tồn tại hoặc chưa đủ metadata để lập chỉ mục.",
      noindex: true,
    });
  }

  return buildMetadata({
    title: { absolute: `${result.video.title} | ${SITE_NAME}` },
    description: result.video.description,
    path: result.video.canonicalPath,
    ogImage: absoluteUrl(result.video.thumbnailUrl),
  });
}

export default async function VideoWatchPage({ params }: PageProps) {
  const { slug } = await params;
  const [result, siteEntity, featureFlags] = await Promise.all([
    getWatchVideo(slug),
    getSiteEntityConfig(),
    getSeoFeatureFlags(),
  ]);

  if (!result) notFound();

  const { project, video } = result;
  const canonical = `${SITE_URL}${video.canonicalPath}`;
  const effectiveSiteEntity = {
    ...siteEntity,
    enabled: featureFlags.siteEntity && siteEntity.enabled,
  };
  const operatorContext = buildOperatorContext(effectiveSiteEntity);
  const operatorNode = buildOperatorNode(effectiveSiteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const videoNode = buildVideoObjectNode(canonical, {
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    embedUrl: video.parsed.embedUrl,
    duration: video.duration,
    publisherId: operatorContext.enabled && operatorContext.id ? operatorContext.id : undefined,
  });
  const webpageNode = buildWebPageNode(canonical, video.title, video.description, {
    aboutId: videoNode ? `${canonical}#video` : undefined,
    breadcrumbId: `${canonical}#breadcrumb`,
  });
  const breadcrumbNode = buildBreadcrumbSchema(canonical, [
    { name: "Trang chủ", item: "/" },
    { name: "Dự án", item: "/du-an" },
    { name: project.name, item: `/${project.slug}` },
    { name: "Video" },
  ]);
  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    videoNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <Header />
      <MobileTabBar />
      <main className="bg-ivory pb-20 pt-24 lg:pb-0">
        <Container className="py-8 sm:py-12">
          <div className="mx-auto max-w-5xl">
            <nav className="mb-5 text-xs font-semibold text-muted">
              <Link href="/" className="hover:text-gold">Trang chủ</Link>
              <span className="mx-2">/</span>
              <Link href={`/${project.slug}`} className="hover:text-gold">{project.name}</Link>
            </nav>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">Video dự án</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
              {video.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
              {video.description}
            </p>

            <div className="mt-8">
              <VideoWatchPlayer video={video} />
            </div>

            <div className="mt-8 rounded-[20px] border border-line/80 bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-lg font-bold text-ink">Thông tin video</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Video này giới thiệu nội dung nổi bật của dự án {project.name}. Để xem đầy đủ thông tin vị trí,
                tiện ích, mặt bằng, bảng giá và chính sách, vui lòng quay lại trang chi tiết dự án.
              </p>
              <Link
                href={`/${project.slug}`}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] border border-gold/40 bg-white px-5 text-[11px] font-bold uppercase tracking-[0.05em] text-gold-dark transition hover:border-gold"
              >
                Xem toàn bộ thông tin dự án
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
