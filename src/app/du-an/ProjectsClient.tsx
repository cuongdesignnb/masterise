"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";
import FeaturedProjects from "@/components/projects/FeaturedProjects";

import WhyChooseProjects from "@/components/projects/WhyChooseProjects";
import AllProjectsGrid from "@/components/projects/AllProjectsGrid";
import ProjectsCTA from "@/components/projects/ProjectsCTA";
import GlobalContactForm from "@/components/lead/GlobalContactForm";

export default function ProjectsClient() {
  const searchParams = useSearchParams();
  const hasActiveFilters = 
    (searchParams.get("q") !== null && searchParams.get("q") !== "") || 
    (searchParams.get("region") !== null && searchParams.get("region") !== "") || 
    (searchParams.get("category") !== null && searchParams.get("category") !== "") || 
    (searchParams.get("status") !== null && searchParams.get("status") !== "") || 
    (searchParams.get("sales_status") !== null && searchParams.get("sales_status") !== "") || 
    (searchParams.get("price_min") !== null && searchParams.get("price_min") !== "") || 
    (searchParams.get("price_max") !== null && searchParams.get("price_max") !== "");

  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ProjectsHero />
        <ProjectsSearchBar />

        {!hasActiveFilters ? (
          <>
            <FeaturedProjects />
            <WhyChooseProjects />
            <AllProjectsGrid />
          </>
        ) : (
          <AllProjectsGrid />
        )}
        
        <ProjectsCTA />
        <GlobalContactForm leadSourcePosition="projects_listing_footer_form" />
      </main>
      <Footer />
    </>
  );
}
