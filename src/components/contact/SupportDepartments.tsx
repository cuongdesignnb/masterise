"use client";

import { Mail, PhoneCall } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { activeSorted } from "@/lib/contactPage";
import { getContactIcon } from "@/lib/contactIcons";
import type { ContactPageContent } from "@/types/contact-page";

export default function SupportDepartments({ content }: { content: ContactPageContent["departments"] }) {
  const items = activeSorted(content.items);
  if (!items.length) return null;
  return <section className="bg-white py-16 sm:py-24" data-contact-section="departments"><Container><MotionWrapper className="mx-auto max-w-3xl text-center"><p className="text-eyebrow">{content.label}</p><h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{content.title}</h2>{content.description && <p className="mt-4 text-sm leading-7 text-muted">{content.description}</p>}</MotionWrapper><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => { const Icon = getContactIcon(item.icon); return <MotionWrapper key={item.id} delay={index * .06} className="rounded-3xl border border-line/60 bg-ivory/50 p-6"><span className="grid size-12 place-items-center rounded-2xl bg-white text-gold shadow-sm"><Icon size={20} /></span><h3 className="mt-5 text-lg font-semibold text-ink">{item.name}</h3>{item.description && <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>}<div className="mt-5 space-y-2 border-t border-line/50 pt-4">{item.phone && <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold"><PhoneCall size={15} />{item.phone}</a>}{item.email && <a href={`mailto:${item.email}`} className="flex items-center gap-2 break-all text-sm text-muted hover:text-gold"><Mail size={15} />{item.email}</a>}{item.workingHours && <p className="text-xs text-muted">{item.workingHours}</p>}</div></MotionWrapper>; })}</div></Container></section>;
}
