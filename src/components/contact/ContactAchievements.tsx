"use client";

import { ArrowUpRight } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { activeSorted, safeExternalUrl } from "@/lib/contactPage";
import { getContactIcon } from "@/lib/contactIcons";
import type { ContactPageContent } from "@/types/contact-page";

export default function ContactAchievements({ content }: { content: ContactPageContent["achievements"] }) {
  const metrics = content.metricsEnabled ? activeSorted(content.metrics) : [];
  const milestones = content.milestonesEnabled ? activeSorted(content.milestones) : [];
  if (!metrics.length && !milestones.length) return null;
  return <section className="overflow-hidden bg-ink-deep py-16 text-white sm:py-24" data-contact-section="achievements"><Container>
    <MotionWrapper className="max-w-3xl"><p className="text-eyebrow text-champagne">{content.label}</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>{content.description && <p className="mt-4 text-sm leading-7 text-white/60">{content.description}</p>}</MotionWrapper>
    {metrics.length > 0 && <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric) => { const Icon = getContactIcon(metric.icon); return <div key={metric.id} className="bg-ink-deep p-6"><Icon size={21} className="text-champagne" /><p className="mt-6 font-heading text-4xl text-champagne">{metric.value}<small className="text-xl">{metric.suffix}</small></p><h3 className="mt-2 text-sm font-semibold">{metric.label}</h3>{metric.description && <p className="mt-2 text-xs leading-6 text-white/50">{metric.description}</p>}</div>; })}</div>}
    {milestones.length > 0 && <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{milestones.map((item) => { const href = safeExternalUrl(item.referenceUrl); return <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[.04] p-5">{item.image && <div className="mb-5 aspect-[16/8] overflow-hidden rounded-2xl bg-white/5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.image} alt={item.imageAlt || item.title} className="h-full w-full object-cover" /></div>}<p className="text-xs font-bold tracking-widest text-champagne">{item.year}</p><h3 className="mt-2 text-lg font-semibold">{item.title}</h3>{item.description && <p className="mt-3 text-sm leading-6 text-white/55">{item.description}</p>}{href && <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-champagne">Tham khảo<ArrowUpRight size={14} /></a>}</article>; })}</div>}
  </Container></section>;
}
