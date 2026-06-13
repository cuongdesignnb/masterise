"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoCards from "@/components/contact/ContactInfoCards";
import ContactFormSection from "@/components/contact/ContactFormSection";
import SupportDepartments from "@/components/contact/SupportDepartments";
import ContactFAQ from "@/components/contact/ContactFAQ";
import ContactCTA from "@/components/contact/ContactCTA";

export default function ContactClient() {
  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ContactHero />
        <ContactInfoCards />
        <ContactFormSection />
        <SupportDepartments />
        <ContactFAQ />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
