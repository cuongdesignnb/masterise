"use client";

import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { activeSorted } from "@/lib/contactPage";
import { getContactIcon } from "@/lib/contactIcons";
import type { ContactPageContent } from "@/types/contact-page";

export default function ContactTrustCommitments({ content }: { content: ContactPageContent["commitments"] }) {
  const items = activeSorted(content.items);
  if (!items.length) return null;
  return <section className="bg-ivory py-16 sm:py-20" data-contact-section="commitments"><Container>
    <MotionWrapper className="mx-auto max-w-3xl text-center"><p className="text-eyebrow">{content.label}</p><h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{content.title}</h2>{content.description && <p className="mt-4 text-sm leading-7 text-muted">{content.description}</p>}</MotionWrapper>
    <div className={`mt-10 grid gap-4 ${items.length === 2 ? "md:grid-cols-2" : items.length === 3 ? "md:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
      {items.map((item, index) => { const Icon = getContactIcon(item.icon); return <MotionWrapper key={item.id} delay={index * .06} className="group rounded-3xl border border-line/60 bg-white p-6 shadow-[0_14px_40px_rgba(31,27,22,.04)] transition duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:shadow-[0_18px_45px_rgba(31,27,22,.08)] motion-reduce:transform-none"><span className="grid size-12 place-items-center rounded-2xl bg-champagne/12 text-gold transition group-hover:bg-champagne group-hover:text-ink-deep"><Icon size={21} /></span><h3 className="mt-6 text-lg font-semibold text-ink">{item.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{item.description}</p></MotionWrapper>; })}
    </div>
  </Container></section>;
}
