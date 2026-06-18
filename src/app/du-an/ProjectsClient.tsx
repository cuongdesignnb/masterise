"use client";

import React, { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";
import FeaturedProjects from "@/components/projects/FeaturedProjects";

import ProjectsByRegion from "@/components/projects/ProjectsByRegion";
import WhyChooseProjects from "@/components/projects/WhyChooseProjects";
import AllProjectsGrid from "@/components/projects/AllProjectsGrid";
import ProjectsCTA from "@/components/projects/ProjectsCTA";
import GlobalContactForm from "@/components/lead/GlobalContactForm";

export default function ProjectsClient() {
  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ProjectsHero />
        <ProjectsSearchBar />
        <FeaturedProjects />

        <ProjectsByRegion />
        <WhyChooseProjects />
        <Suspense fallback={
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AllProjectsGrid />
        </Suspense>
        <ProjectsCTA />
        <GlobalContactForm leadSourcePosition="projects_listing_footer_form" />
      </main>
      <Footer />
    </>
  );
}
