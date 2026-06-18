"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoCards from "@/components/contact/ContactInfoCards";
import SupportDepartments from "@/components/contact/SupportDepartments";
import ContactFAQ from "@/components/contact/ContactFAQ";
import ContactCTA from "@/components/contact/ContactCTA";
import GlobalContactForm from "@/components/lead/GlobalContactForm";

export default function ContactClient() {
  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <ContactHero />
        <ContactInfoCards />
        <GlobalContactForm leadSourcePosition="contact_page_form" />
        <SupportDepartments />
        <ContactFAQ />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
