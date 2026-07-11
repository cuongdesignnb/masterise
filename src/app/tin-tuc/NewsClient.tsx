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
import type { Post } from "@/types/api";

export default function NewsClient({ heroPost, heroPostLabel }: { heroPost: Post | null; heroPostLabel: string }) {
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
              <ArticleGrid />
            </div>
            {/* Sidebar */}
            <aside className="space-y-6">
              <NewsSidebar />
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
