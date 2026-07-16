"use client";

import { Clock3, ExternalLink, Mail, MapPin, PhoneCall } from "lucide-react";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import { safeExternalUrl } from "@/lib/contactPage";
import type { ContactPageContent, ContactPageSiteDetails } from "@/types/contact-page";

export default function ContactConversionSection({ content, site }: { content: ContactPageContent["contactForm"]; site: ContactPageSiteDetails }) {
  const hotline = content.hotline || site.hotline;
  const email = content.email || site.email;
  const address = content.address || site.companyAddress;
  const directions = safeExternalUrl(content.directionsUrl || content.mapUrl);
  const embed = safeExternalUrl(content.mapEmbedUrl);
  return <section className="bg-ivory py-16 sm:py-24" data-contact-section="contactForm"><Container>
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
      <div className="rounded-[2rem] bg-ink-deep p-5 text-white shadow-xl sm:p-8"><p className="text-eyebrow text-champagne">{content.label}</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>{content.description && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">{content.description}</p>}<div className="mt-7"><GlobalContactForm leadSourcePosition="contact_page_form" compact embedded /></div></div>
      <aside className="overflow-hidden rounded-[2rem] border border-line/60 bg-white shadow-sm"><div className="p-6 sm:p-8"><p className="text-eyebrow">THÔNG TIN LIÊN HỆ</p><h3 className="mt-3 text-2xl font-semibold text-ink">{content.officeTitle}</h3><div className="mt-6 space-y-4">
        {hotline && <a href={`tel:${hotline.replace(/[^\d+]/g, "")}`} className="flex items-start gap-3 rounded-2xl bg-ivory p-4 hover:text-gold"><PhoneCall size={18} className="mt-0.5 shrink-0 text-gold" /><span><small className="block text-[10px] uppercase tracking-wide text-muted">Hotline</small><strong className="text-sm text-ink">{hotline}</strong></span></a>}
        {email && <a href={`mailto:${email}`} className="flex items-start gap-3 rounded-2xl bg-ivory p-4"><Mail size={18} className="mt-0.5 shrink-0 text-gold" /><span className="min-w-0"><small className="block text-[10px] uppercase tracking-wide text-muted">Email</small><strong className="break-all text-sm text-ink">{email}</strong></span></a>}
        {address && <div className="flex items-start gap-3 rounded-2xl bg-ivory p-4"><MapPin size={18} className="mt-0.5 shrink-0 text-gold" /><span><small className="block text-[10px] uppercase tracking-wide text-muted">Địa chỉ</small><strong className="text-sm leading-6 text-ink">{address}</strong></span></div>}
        {content.workingHours && <div className="flex items-start gap-3 rounded-2xl bg-ivory p-4"><Clock3 size={18} className="mt-0.5 shrink-0 text-gold" /><span><small className="block text-[10px] uppercase tracking-wide text-muted">Giờ làm việc</small><strong className="text-sm text-ink">{content.workingHours}</strong></span></div>}
      </div></div>
      {(embed || content.mapImage) && <div className="aspect-[16/9] bg-beige">{embed ? <iframe src={embed} title="Bản đồ văn phòng" className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={content.mapImage} alt={content.mapImageAlt || "Bản đồ văn phòng"} className="h-full w-full object-cover" /></>}</div>}
      {directions && <div className="p-6 pt-0 sm:px-8"><a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-ink hover:border-gold hover:text-gold">{content.directionsLabel || "Xem chỉ đường"}<ExternalLink size={15} /></a></div>}
      </aside>
    </div>
  </Container></section>;
}
