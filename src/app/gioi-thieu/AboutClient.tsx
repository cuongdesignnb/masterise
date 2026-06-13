"use client";

import Header from "@/components/Header";
import MobileTabBar from "@/components/MobileTabBar";
import Footer from "@/components/Footer";

import AboutHero from "@/components/about/AboutHero";
import AboutIntro from "@/components/about/AboutIntro";
import AboutMetrics from "@/components/about/AboutMetrics";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutVisionMission from "@/components/about/AboutVisionMission";
import AboutCoreValues from "@/components/about/AboutCoreValues";
import AboutAwards from "@/components/about/AboutAwards";
import AboutEcosystem from "@/components/about/AboutEcosystem";
import AboutSustainability from "@/components/about/AboutSustainability";
import AboutWhyChoose from "@/components/about/AboutWhyChoose";
import AboutBrandFaq from "@/components/about/AboutBrandFaq";
import AboutContactCTA from "@/components/about/AboutContactCTA";

export default function AboutClient() {
  return (
    <>
      <Header />
      <MobileTabBar />

      <main className="relative z-10 pb-16 lg:pb-0">
        {/* Hero: Full-width banner with breadcrumb, title, CTAs, stats */}
        <AboutHero />

        {/* Intro: Company overview with images */}
        <AboutIntro />

        {/* Metrics: Key figures strip */}
        <AboutMetrics />

        {/* Timeline: Company milestones */}
        <AboutTimeline />

        {/* Vision & Mission: Two-card layout */}
        <AboutVisionMission />

        {/* Core Values: 6-card grid */}
        <AboutCoreValues />

        {/* Awards & Achievements */}
        <AboutAwards />

        {/* Product Ecosystem + Partners */}
        <AboutEcosystem />

        {/* Sustainability pillars */}
        <AboutSustainability />

        {/* Why Choose Masterise Homes */}
        <AboutWhyChoose />

        {/* Brand Story + FAQ Accordion */}
        <AboutBrandFaq />

        {/* Contact CTA */}
        <AboutContactCTA />
      </main>

      <Footer />
    </>
  );
}
