"use client";

import { ArrowUpRight } from "lucide-react";
import Container from "@/components/Container";
import { safeExternalUrl } from "@/lib/contactPage";
import type { ContactPageContent } from "@/types/contact-page";

export default function ContactCTA({ content }: { content: ContactPageContent["cta"] }) {
  const primary = safeExternalUrl(content.primaryCta.url);
  const secondary = safeExternalUrl(content.secondaryCta.url);
  return <section className="bg-white py-10 sm:py-16" data-contact-section="cta"><Container><div className="relative overflow-hidden rounded-[2rem] bg-ink-deep px-6 py-14 text-center text-white sm:px-12 sm:py-20"><div aria-hidden className="absolute inset-0">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={content.image} alt="" className="h-full w-full object-cover opacity-25" /><div className="absolute inset-0 bg-gradient-to-r from-ink-deep via-ink-deep/90 to-ink-deep/60" /></div><div className="relative mx-auto max-w-3xl"><p className="text-eyebrow text-champagne">{content.label}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.title}</h2>{content.description && <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65">{content.description}</p>}<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{primary && content.primaryCta.label && <a href={primary} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-champagne px-6 text-sm font-bold text-ink-deep hover:bg-white">{content.primaryCta.label}<ArrowUpRight size={16} /></a>}{secondary && content.secondaryCta.label && <a href={secondary} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold hover:border-champagne hover:text-champagne">{content.secondaryCta.label}</a>}</div></div></div></Container></section>;
}
