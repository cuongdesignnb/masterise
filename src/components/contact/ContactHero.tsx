"use client";

import { ArrowDownRight, ChevronRight, Clock3, PhoneCall } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";
import { activeSorted, safeExternalUrl } from "@/lib/contactPage";
import { getContactIcon } from "@/lib/contactIcons";
import type { ContactPageContent, ContactPageSiteDetails } from "@/types/contact-page";

export default function ContactHero({ content, site }: { content: ContactPageContent["hero"]; site: ContactPageSiteDetails }) {
  const reduceMotion = useReducedMotion();
  const primaryUrl = safeExternalUrl(content.primaryCta.url);
  const secondaryUrl = safeExternalUrl(content.secondaryCta.url);
  return (
    <section className="relative overflow-hidden bg-ink-deep pb-16 pt-28 text-white sm:pb-20 sm:pt-32 lg:min-h-[760px] lg:pb-24 lg:pt-36" data-contact-section="hero">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(184,135,70,.22),transparent_36%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,.08),transparent_30%)]" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-white/55">
              <a href="/" className="rounded-sm transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne">Trang chủ</a>
              <ChevronRight size={13} aria-hidden />
              <span className="text-champagne">Liên hệ</span>
            </nav>
            {content.eyebrow && <p className="text-eyebrow text-champagne">{content.eyebrow}</p>}
            <h1 className="mt-5 max-w-2xl text-balance font-heading text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[4.25rem]">{content.title}</h1>
            {content.description && <p className="mt-6 max-w-xl text-base leading-8 text-white/68">{content.description}</p>}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primaryUrl && content.primaryCta.label && <a href={primaryUrl} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-champagne px-6 text-sm font-bold text-ink-deep transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{content.primaryCta.label}<ArrowDownRight size={17} /></a>}
              {secondaryUrl && content.secondaryCta.label && <a href={secondaryUrl} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold transition hover:border-champagne hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne">{content.secondaryCta.label}</a>}
            </div>
            <div className="mt-9 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              {(content.hotlineLine || site.hotline) && <a href={site.hotline ? `tel:${site.hotline.replace(/[^\d+]/g, "")}` : undefined} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 hover:border-champagne/40"><PhoneCall size={17} className="text-champagne" /><span><small className="block text-[10px] uppercase tracking-wider text-white/45">{content.hotlineLine}</small>{site.hotline || "Đang cập nhật"}</span></a>}
              {content.responseLine && <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3"><Clock3 size={17} className="text-champagne" /><span>{content.responseLine}</span></div>}
            </div>
          </motion.div>

          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .75, delay: .08 }} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 sm:aspect-[5/4] lg:aspect-[4/5]">
              {/* Dynamic Media Library URLs can use any approved host, so the native image element is intentional. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.image} alt={content.imageAlt || content.title} className="h-full w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-deep/55 via-transparent to-transparent" />
            </div>
            {activeSorted(content.quickInfo).length > 0 && <div className="relative -mt-10 ml-4 grid max-w-[92%] gap-2 rounded-2xl border border-white/15 bg-white/95 p-3 text-ink shadow-2xl backdrop-blur sm:ml-10 sm:grid-cols-2 lg:absolute lg:-bottom-6 lg:-left-12 lg:m-0 lg:max-w-md">
              {activeSorted(content.quickInfo).map((item) => { const Icon = getContactIcon(item.icon); return <div key={item.id} className="flex items-center gap-3 rounded-xl bg-ivory px-3 py-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/15 text-gold"><Icon size={18} /></span><div><p className="text-[10px] uppercase tracking-wider text-muted">{item.label}</p><p className="mt-0.5 text-sm font-semibold">{item.value}</p></div></div>; })}
            </div>}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
