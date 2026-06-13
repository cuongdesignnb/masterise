import Header from "@/components/Header";
import MobileTabBar from "@/components/MobileTabBar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import Stats from "@/components/Stats";
import HotProjects from "@/components/HotProjects";
import FeaturedProjects from "@/components/FeaturedProjects";
import LuxuryCollections from "@/components/LuxuryCollections";
import RegionProjects from "@/components/RegionProjects";
import InvestmentOpportunities from "@/components/InvestmentOpportunities";
import PropertyTypes from "@/components/PropertyTypes";
import ProjectStatus from "@/components/ProjectStatus";
import WhyChooseUs from "@/components/WhyChooseUs";
import LifestyleAmenities from "@/components/LifestyleAmenities";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import NewsAndGuide from "@/components/NewsAndGuide";
import FAQ from "@/components/FAQ";
import AccountCTA from "@/components/AccountCTA";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

export default function Home() {
  return (
    <>
      {/* 8.1 Header & Mobile Tab Bar */}
      <Header />
      <MobileTabBar />

      <main className="relative z-10 pb-16 lg:pb-0">
        {/* 8.2 Hero Section */}
        <Hero />

        {/* 8.3 Search Bar */}
        <SearchBar />

        {/* 8.4 Stats Strip */}
        <Stats />

        {/* 8.5 HOT Projects Carousel */}
        <HotProjects />

        {/* 8.6 Featured Projects Grid */}
        <FeaturedProjects />

        {/* 8.7 Luxury Collections Cards (horizontal split layout inside) */}
        <LuxuryCollections />

        {/* Region Projects + Investment Opportunities + Property Types in a unified 2-column layout row */}
        <section id="phan-khuc" className="py-16 sm:py-20 bg-[#FFFDF8] border-t border-line/30">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left Column: Region Projects (5/12 cols) */}
              <div className="lg:col-span-5 flex flex-col lg:h-full">
                <RegionProjects />
              </div>
              {/* Right Column: Investment Opportunities & Property Types (7/12 cols) */}
              <div className="lg:col-span-7 flex flex-col lg:justify-between lg:h-full gap-10">
                <div>
                  <InvestmentOpportunities />
                </div>
                <div className="border-t border-line/20 pt-10">
                  <PropertyTypes />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 8.11 Project Status columns (upcoming, selling, done) */}
        <ProjectStatus />

        {/* 8.12 Why Choose Us Benefits */}
        <WhyChooseUs />

        {/* 8.13 Lifestyle Amenities Gallery */}
        <LifestyleAmenities />

        {/* 8.14 & 8.15 Testimonials + Partners in a unified 2-column layout row */}
        <section className="py-16 sm:py-20 bg-cream border-t border-line/35">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left half: Testimonials */}
              <div className="lg:col-span-6 flex flex-col lg:h-full">
                <Testimonials />
              </div>
              {/* Right half: Partners logos */}
              <div className="lg:col-span-6 flex flex-col lg:h-full">
                <Partners />
              </div>
            </div>
          </Container>
        </section>

        {/* 8.16 & 8.17 NewsAndGuide + FAQ in a unified 2-column layout row */}
        <section className="py-16 sm:py-20 bg-ivory border-t border-line/35">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left half: News */}
              <div className="lg:col-span-6 flex flex-col lg:h-full">
                <NewsAndGuide />
              </div>
              {/* Right half: FAQ Accordions */}
              <div className="lg:col-span-6 flex flex-col lg:h-full">
                <FAQ />
              </div>
            </div>
          </Container>
        </section>

        {/* 8.18 Account Registration CTA & Dashboard Mockup */}
        <AccountCTA />
      </main>

      {/* 8.20 Footer */}
      <Footer />
    </>
  );
}
