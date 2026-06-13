"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsSearchBar from "@/components/projects/ProjectsSearchBar";
import FeaturedProjects from "@/components/projects/FeaturedProjects";
import ProjectCollections from "@/components/projects/ProjectCollections";
import ProjectsByRegion from "@/components/projects/ProjectsByRegion";
import WhyChooseProjects from "@/components/projects/WhyChooseProjects";
import AllProjectsGrid from "@/components/projects/AllProjectsGrid";
import ProjectsCTA from "@/components/projects/ProjectsCTA";

export default function ProjectsClient() {
  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ProjectsHero />
        <ProjectsSearchBar />
        <FeaturedProjects />
        <ProjectCollections />
        <ProjectsByRegion />
        <WhyChooseProjects />
        <AllProjectsGrid />
        <ProjectsCTA />
      </main>
      <Footer />
    </>
  );
}
