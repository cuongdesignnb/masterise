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
import { normalizeContactPageContent } from "@/lib/contactPage";
import type { ContactPageContent, ContactPageSiteDetails, ContactSectionKey } from "@/types/contact-page";

export default function ContactClient({ initialContent, siteDetails }: { initialContent: ContactPageContent; siteDetails: ContactPageSiteDetails }) {
  const content = normalizeContactPageContent(initialContent);
  const renderSection = (key: ContactSectionKey) => {
    switch (key) {
      case "hero": return content.hero.enabled ? <ContactHero key={key} content={content.hero} site={siteDetails} /> : null;
      case "commitments": return content.commitments.enabled ? <ContactTrustCommitments key={key} content={content.commitments} /> : null;
      case "introduction": return content.introduction.enabled ? <ContactIntroduction key={key} content={content.introduction} /> : null;
      case "salesTeam": return content.salesTeam.enabled ? <ContactSalesTeam key={key} content={content.salesTeam} /> : null;
      case "achievements": return content.achievements.enabled ? <ContactAchievements key={key} content={content.achievements} /> : null;
      case "contactForm": return content.contactForm.enabled ? <ContactConversionSection key={key} content={content.contactForm} site={siteDetails} /> : null;
      case "departments": return content.departments.enabled ? <SupportDepartments key={key} content={content.departments} /> : null;
      case "faqs": return content.faqs.enabled ? <ContactFAQ key={key} content={content.faqs} /> : null;
      case "cta": return content.cta.enabled ? <ContactCTA key={key} content={content.cta} /> : null;
    }
  };

  return <><Header /><MobileTabBar /><main className="relative z-10 overflow-x-clip pb-16 lg:pb-0">{content.sectionOrder.map(renderSection)}</main><Footer /></>;
}
