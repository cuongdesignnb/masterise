"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import NewsHero from "@/components/news/NewsHero";
import NewsFilterBar from "@/components/news/NewsFilterBar";
import NewsSidebar from "@/components/news/NewsSidebar";
import ArticleGrid from "@/components/news/ArticleGrid";
import NewsCTA from "@/components/news/NewsCTA";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import type { ApiResponse, Post, PostCategory } from "@/types/api";

interface NewsClientProps {
  heroPost: Post | null;
  heroPostLabel: string;
  initialPosts: ApiResponse<Post[]> | null;
  initialPostQuery: string;
  initialFeatured: Post[];
  initialCategories: PostCategory[];
}

export default function NewsClient({ heroPost, heroPostLabel, initialPosts, initialPostQuery, initialFeatured, initialCategories }: NewsClientProps) {
  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <NewsHero post={heroPost} postLabel={heroPostLabel} />
        <NewsFilterBar />
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] py-10 lg:py-14">
            {/* Main Content */}
            <div className="space-y-10 lg:space-y-14">
              <ArticleGrid initialResponse={initialPosts} initialQuery={initialPostQuery} />
            </div>
            {/* Sidebar */}
            <aside className="space-y-6">
              <NewsSidebar initialFeatured={initialFeatured} initialCategories={initialCategories} />
            </aside>
          </div>
        </Container>
        <NewsCTA />
        <GlobalContactForm leadSourcePosition="news_listing_footer_form" />
      </main>
      <Footer />
    </>
  );
}
