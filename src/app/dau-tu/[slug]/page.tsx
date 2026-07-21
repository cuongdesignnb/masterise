import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import NewsArticleHero from "@/components/news-detail/NewsArticleHero";
import NewsArticleMainContent from "@/components/news-detail/NewsArticleMainContent";
import NewsArticleSidebar from "@/components/news-detail/NewsArticleSidebar";
import NewsArticleMetaFooter from "@/components/news-detail/NewsArticleMetaFooter";
import NewsMediaBlocks from "@/components/news-detail/NewsMediaBlocks";
import NewsRelatedSection from "@/components/news-detail/NewsRelatedSection";
import { extractTocFromHtml, formatArticleDate, readingMinutes, stripHtml } from "@/lib/articleContent";
import ArticleToc from "@/components/news-detail/ArticleToc";
import { fetchApi } from "@/lib/serverApi";
import type { PostDetailData } from "@/types/api";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/config/seo";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getSiteEntityConfig } from "@/services/siteEntityServerService";
import { getSeoFeatureFlags } from "@/services/seoFeatureFlagsServerService";
import {
  buildOperatorNode,
  buildWebSiteNode,
  buildWebPageNode,
  buildBreadcrumbSchema,
  buildNewsArticleSchema,
  buildEventSchema,
  buildOperatorContext,
} from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ slug: string }>;
};

type PostDetailResponse = PostDetailData;

async function getInvestmentPost(slug: string): Promise<PostDetailResponse | null> {
  const data = await fetchApi<PostDetailResponse>(`/posts/${slug}`);
  if (!data?.post) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getInvestmentPost(slug);
  const post = data?.post;

  if (!post) {
    return buildMetadata({
      title: "Không tìm thấy nội dung đầu tư",
      noindex: true,
    });
  }

  const description = post.seo_meta?.description || post.summary || stripHtml(post.content || "").slice(0, 180);
  const seoImage = post.thumbnail ? absoluteUrl(post.thumbnail) : undefined;

  return buildMetadata({
    title: post.seo_meta?.title ? { absolute: post.seo_meta.title } : post.title,
    description,
    keywords: post.seo_meta?.keywords || undefined,
    path: `/${post.slug}`,
    ogType: "article",
    ogImage: seoImage,
    publishedTime: post.published_at || undefined,
    modifiedTime: post.updated_at || undefined,
    authors: [post.author?.name || "Masterise Homes"],
    section: "Đầu tư",
  });
}

export default async function InvestmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const [data, siteEntity, featureFlags] = await Promise.all([
    getInvestmentPost(slug),
    getSiteEntityConfig(),
    getSeoFeatureFlags(),
  ]);

  if (!data?.post) notFound();
  if (data.post.post_type === "news") permanentRedirect(`/${data.post.slug}`);

  const { post, inline_related = [], related = [], previous = null, next = null } = data;
  const postUrl = `${SITE_URL}/${post.slug}`;
  const metaDescription = post.seo_meta?.description || post.summary || stripHtml(post.content || "").slice(0, 180);
  const completeContent = [post.intro_content, post.content].filter(Boolean).join("");
  const toc = extractTocFromHtml(completeContent);
  const publishedLabel = formatArticleDate(post.published_at);
  const minutes = readingMinutes(completeContent || post.summary);

  const hasOfflineLocation = Boolean(post.event_location_name && post.event_street_address && post.event_country);
  const hasOnlineLocation = Boolean(post.event_online_url);
  const hasEligibleLocation = post.event_attendance_mode === 'Online'
    ? hasOnlineLocation
    : post.event_attendance_mode === 'Mixed'
      ? hasOfflineLocation && hasOnlineLocation
      : hasOfflineLocation;
  const isEvent = featureFlags.eventSchema
    && post.post_type === "event"
    && Boolean(post.event_start_at && post.event_attendance_mode && post.event_status && hasEligibleLocation);

  // Build JSON-LD Graph Nodes
  const operatorContext = buildOperatorContext(siteEntity);
  const operatorNode = buildOperatorNode(siteEntity);
  const websiteNode = buildWebSiteNode(operatorContext);
  const webpageNode = buildWebPageNode(postUrl, post.title, metaDescription, isEvent ? `${postUrl}#event` : `${postUrl}#article`);
  const breadcrumbNode = buildBreadcrumbSchema(postUrl, [
    { name: "Trang chủ", item: "/" },
    { name: "Đầu tư", item: "/dau-tu" },
    { name: post.title, item: `/${post.slug}` },
  ]);

  const mainEntityNode = isEvent
    ? buildEventSchema(postUrl, {
        name: post.title,
        description: metaDescription,
        startDate: post.event_start_at!,
        endDate: post.event_end_at || undefined,
        imageUrl: post.thumbnail ? absoluteUrl(post.thumbnail) : undefined,
        locationName: post.event_location_name || undefined,
        streetAddress: post.event_street_address || undefined,
        locality: post.event_locality || undefined,
        region: post.event_region || undefined,
        postalCode: post.event_postal_code || undefined,
        country: post.event_country || undefined,
        attendanceMode: post.event_attendance_mode!,
        eventStatus: post.event_status!,
        organizerName: post.event_organizer_name || undefined,
        organizerUrl: post.event_organizer_url || undefined,
        onlineUrl: post.event_online_url || undefined,
        price: post.event_price ? Number(post.event_price) : undefined,
        currency: post.event_currency || undefined,
        availability: post.event_availability || undefined,
      }, operatorContext)
    : buildNewsArticleSchema(postUrl, {
        headline: post.title,
        description: metaDescription,
        images: post.thumbnail ? [absoluteUrl(post.thumbnail)] : [],
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at || post.published_at || post.created_at,
        authorName: post.author?.name || SITE_NAME,
        authorType: post.author?.name ? "Person" : "Organization",
      }, operatorContext);

  const graph = [
    operatorNode,
    websiteNode,
    webpageNode,
    breadcrumbNode,
    mainEntityNode,
  ].filter(Boolean);

  return (
    <>
      <JsonLd schema={{ "@context": "https://schema.org", "@graph": graph }} />
      <Header />
      <MobileTabBar />
      <main className="relative z-10 bg-[#FBF8F2] pb-16 lg:pb-0">
        <NewsArticleHero post={post} publishedLabel={publishedLabel} minutes={minutes} />

        <Container>
          <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              {post.post_type === "event" && (
                <div className="rounded-[24px] border border-[#B88746]/30 bg-[#B88746]/5 p-6 text-left shadow-[0_18px_50px_rgba(184,135,70,0.04)]">
                  <h2 className="text-lg font-black text-[#1F1B16]">Thông tin sự kiện</h2>
                  <div className="mt-3 space-y-2 text-sm text-[#4B4238]">
                    <p>
                      <span className="font-bold text-[#1F1B16]">Thời gian:</span>{" "}
                      {post.event_start_at ? new Date(post.event_start_at).toLocaleString("vi-VN") : "Đang cập nhật"}
                      {post.event_end_at && ` - ${new Date(post.event_end_at).toLocaleString("vi-VN")}`}
                    </p>
                    {post.event_location && (
                      <p>
                        <span className="font-bold text-[#1F1B16]">Địa điểm:</span> {post.event_location}
                      </p>
                    )}
                    {post.event_location_name && (
                      <p><span className="font-bold text-[#1F1B16]">Địa điểm tổ chức:</span> {post.event_location_name}</p>
                    )}
                    {post.event_street_address && (
                      <p>
                        <span className="font-bold text-[#1F1B16]">Địa chỉ:</span>{' '}
                        {[post.event_street_address, post.event_locality, post.event_region, post.event_country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {post.event_online_url && (
                      <p><span className="font-bold text-[#1F1B16]">Tham dự trực tuyến:</span> <a className="underline" href={post.event_online_url}>Mở liên kết</a></p>
                    )}
                    {post.event_organizer_name && (
                      <p><span className="font-bold text-[#1F1B16]">Đơn vị tổ chức:</span> {post.event_organizer_name}</p>
                    )}
                  </div>
                  {post.event_register_url && (
                    <a
                      href={post.event_register_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#B88746] px-5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#1F1B16]"
                    >
                      Đăng ký tham dự
                    </a>
                  )}
                </div>
              )}
              <ArticleToc toc={toc} className="lg:hidden" />
              <NewsArticleMainContent post={post} related={inline_related} />
              <NewsMediaBlocks mediaItems={post.media_items} />
              <NewsArticleMetaFooter post={post} previous={previous} next={next} />
            </div>
            <NewsArticleSidebar toc={toc} related={related} postType={post.post_type} />
          </div>
        </Container>

        <NewsRelatedSection related={related} postType={post.post_type} />
        <GlobalContactForm defaultDemandType="Tìm cơ hội đầu tư" leadSourcePosition="investment_detail_footer_form" />
      </main>
      <Footer />
    </>
  );
}
