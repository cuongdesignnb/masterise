"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Container from "@/components/Container";
import { activeSorted } from "@/lib/contactPage";
import type { ContactPageContent } from "@/types/contact-page";

export default function ContactFAQ({ content }: { content: ContactPageContent["faqs"] }) {
  const items = activeSorted(content.items);
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  if (!items.length) return null;
  return <section className="bg-ivory py-16 sm:py-24" data-contact-section="faqs"><Container><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20"><div><p className="text-eyebrow">{content.label}</p><h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{content.title}</h2>{content.description && <p className="mt-4 text-sm leading-7 text-muted">{content.description}</p>}</div><div className="divide-y divide-line/60 border-y border-line/60">{items.map((item) => { const open = openId === item.id; return <div key={item.id}><button type="button" aria-expanded={open} aria-controls={`contact-faq-${item.id}`} onClick={() => setOpenId(open ? null : item.id)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><span>{item.question}</span><ChevronDown size={18} className={`shrink-0 text-gold transition-transform ${open ? "rotate-180" : ""}`} /></button><div id={`contact-faq-${item.id}`} hidden={!open} className="pb-5 pr-8 text-sm leading-7 text-muted">{item.answer}</div></div>; })}</div></div></Container></section>;
}
