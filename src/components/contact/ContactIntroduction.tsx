"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { activeSorted, safeExternalUrl } from "@/lib/contactPage";
import type { ContactPageContent } from "@/types/contact-page";

export default function ContactIntroduction({ content }: { content: ContactPageContent["introduction"] }) {
  const images = activeSorted(content.images);
  const bullets = activeSorted(content.bullets);
  const ctaUrl = safeExternalUrl(content.cta.url);
  if (!content.title && !images.length) return null;
  return <section className="bg-white py-16 sm:py-24" data-contact-section="introduction"><Container><div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
    <MotionWrapper className="relative min-h-[420px]">
      {images[0] && <div className="h-[460px] overflow-hidden rounded-[2rem] bg-beige sm:h-[560px]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={images[0].url} alt={images[0].alt || content.title} className="h-full w-full object-cover" /></div>}
      {images[1] && <div className="absolute -bottom-6 -right-2 h-48 w-40 overflow-hidden rounded-3xl border-[6px] border-white shadow-xl sm:h-60 sm:w-52">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={images[1].url} alt={images[1].alt || content.title} className="h-full w-full object-cover" /></div>}
    </MotionWrapper>
    <MotionWrapper delay={.08}><p className="text-eyebrow">{content.label}</p><h2 className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">{content.title}</h2><div className="mt-6 space-y-4">{content.paragraphs.filter(Boolean).map((paragraph, index) => <p key={index} className="text-sm leading-7 text-muted">{paragraph}</p>)}</div>
      {bullets.length > 0 && <ul className="mt-7 grid gap-3 sm:grid-cols-2">{bullets.map((item) => <li key={item.id} className="flex items-start gap-2.5 text-sm text-ink"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-gold" />{item.text}</li>)}</ul>}
      {ctaUrl && content.cta.label && <a href={ctaUrl} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{content.cta.label}<ArrowUpRight size={16} /></a>}
    </MotionWrapper>
  </div></Container></section>;
}
