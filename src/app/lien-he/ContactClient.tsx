"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ContactHero from "@/components/contact/ContactHero";
import ContactTrustCommitments from "@/components/contact/ContactTrustCommitments";
import ContactIntroduction from "@/components/contact/ContactIntroduction";
import ContactSalesTeam from "@/components/contact/ContactSalesTeam";
import ContactAchievements from "@/components/contact/ContactAchievements";
import ContactConversionSection from "@/components/contact/ContactConversionSection";
import SupportDepartments from "@/components/contact/SupportDepartments";
import ContactFAQ from "@/components/contact/ContactFAQ";
import ContactCTA from "@/components/contact/ContactCTA";
import type { ContactPageContent, ContactPageSiteDetails, ContactSectionKey } from "@/types/contact-page";

export default function ContactClient({ initialContent, siteDetails }: { initialContent: ContactPageContent; siteDetails: ContactPageSiteDetails }) {
  const renderSection = (key: ContactSectionKey) => {
    switch (key) {
      case "hero": return initialContent.hero.enabled ? <ContactHero key={key} content={initialContent.hero} site={siteDetails} /> : null;
      case "commitments": return initialContent.commitments.enabled ? <ContactTrustCommitments key={key} content={initialContent.commitments} /> : null;
      case "introduction": return initialContent.introduction.enabled ? <ContactIntroduction key={key} content={initialContent.introduction} /> : null;
      case "salesTeam": return initialContent.salesTeam.enabled ? <ContactSalesTeam key={key} content={initialContent.salesTeam} /> : null;
      case "achievements": return initialContent.achievements.enabled ? <ContactAchievements key={key} content={initialContent.achievements} /> : null;
      case "contactForm": return initialContent.contactForm.enabled ? <ContactConversionSection key={key} content={initialContent.contactForm} site={siteDetails} /> : null;
      case "departments": return initialContent.departments.enabled ? <SupportDepartments key={key} content={initialContent.departments} /> : null;
      case "faqs": return initialContent.faqs.enabled ? <ContactFAQ key={key} content={initialContent.faqs} /> : null;
      case "cta": return initialContent.cta.enabled ? <ContactCTA key={key} content={initialContent.cta} /> : null;
    }
  };

  return <><Header /><MobileTabBar /><main className="relative z-10 overflow-x-clip pb-16 lg:pb-0">{initialContent.sectionOrder.map(renderSection)}</main><Footer /></>;
}
