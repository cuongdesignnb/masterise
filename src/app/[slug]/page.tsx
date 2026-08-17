import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailPage,
  generateMetadata as generateProjectMetadata,
} from "@/app/du-an/[slug]/page";
import { NewsArticlePage, generateNewsMetadata } from "@/app/tin-tuc/[slug]/page";
import { InvestmentPage, generateInvestmentMetadata } from "@/app/dau-tu/[slug]/page";
import { resolvePublicSlug } from "@/lib/publicSlugResolver";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const kind = await resolvePublicSlug(slug);

  if (kind === "project") return generateProjectMetadata(props);
  if (kind === "news") return generateNewsMetadata(props);
  if (kind === "investment") return generateInvestmentMetadata(props);

  return {
    title: "Không tìm thấy nội dung | Masterise Homes",
    robots: { index: false, follow: false },
  };
}

export default async function PublicSlugPage(props: Props) {
  const { slug } = await props.params;
  const kind = await resolvePublicSlug(slug);

  if (kind === "project") return ProjectDetailPage(props);
  if (kind === "news") return NewsArticlePage(props);
  if (kind === "investment") return InvestmentPage(props);

  notFound();
}
