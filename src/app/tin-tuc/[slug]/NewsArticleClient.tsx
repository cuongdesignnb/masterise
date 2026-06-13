"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ArticleHero from "@/components/news-detail/ArticleHero";
import ArticleBody from "@/components/news-detail/ArticleBody";
import ArticleSidebar from "@/components/news-detail/ArticleSidebar";
import ArticleRelatedPosts from "@/components/news-detail/ArticleRelatedPosts";
import ArticleCTA from "@/components/news-detail/ArticleCTA";
import Container from "@/components/Container";

export default function NewsArticleClient() {
  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ArticleHero />
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] py-10 lg:py-14">
            <div className="min-w-0">
              <ArticleBody />
            </div>
            <aside className="space-y-5 lg:sticky lg:top-24 self-start">
              <ArticleSidebar />
            </aside>
          </div>
        </Container>
        <ArticleRelatedPosts />
        <ArticleCTA />
      </main>
      <Footer />
    </>
  );
}
