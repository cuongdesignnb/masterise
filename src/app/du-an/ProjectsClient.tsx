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
import type { ApiResponse, Project, ProjectCategoryOption, ProjectStatusOption, RegionOption } from "@/types/api";

interface ProjectsClientProps {
  initialProjects: ApiResponse<Project[]> | null;
  initialProjectQuery: string;
  initialFeatured: Project[];
  initialRegions: RegionOption[];
  initialCategories: ProjectCategoryOption[];
  initialStatuses: ProjectStatusOption[];
}

export default function ProjectsClient({
  initialProjects,
  initialProjectQuery,
  initialFeatured,
  initialRegions,
  initialCategories,
  initialStatuses,
}: ProjectsClientProps) {
  const searchParams = useSearchParams();
  const hasActiveFilters = 
    (searchParams.get("q") !== null && searchParams.get("q") !== "") || 
    (searchParams.get("region") !== null && searchParams.get("region") !== "") || 
    (searchParams.get("category") !== null && searchParams.get("category") !== "") || 
    (searchParams.get("project_status") !== null && searchParams.get("project_status") !== "") ||
    (searchParams.get("price_range") !== null && searchParams.get("price_range") !== "");

  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ProjectsHero />
        <ProjectsSearchBar initialRegions={initialRegions} initialCategories={initialCategories} initialStatuses={initialStatuses} />

        {!hasActiveFilters ? (
          <>
            <FeaturedProjects initialProjects={initialFeatured} />
            <WhyChooseProjects />
            <AllProjectsGrid initialResponse={initialProjects} initialQuery={initialProjectQuery} initialCategories={initialCategories} />
          </>
        ) : (
          <AllProjectsGrid initialResponse={initialProjects} initialQuery={initialProjectQuery} initialCategories={initialCategories} />
        )}
        
        <ProjectsCTA />
        <GlobalContactForm leadSourcePosition="projects_listing_footer_form" />
      </main>
      <Footer />
    </>
  );
}
