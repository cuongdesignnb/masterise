"use client";

import { Globe2, Mail, MessageCircle, PhoneCall } from "lucide-react";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { activeSorted, safeExternalUrl } from "@/lib/contactPage";
import type { ContactPageContent } from "@/types/contact-page";

export default function ContactSalesTeam({ content }: { content: ContactPageContent["salesTeam"] }) {
  const items = activeSorted(content.items);
  if (!items.length) return null;
  return <section className="bg-beige/35 py-16 sm:py-24" data-contact-section="salesTeam"><Container>
    <MotionWrapper className="max-w-3xl"><p className="text-eyebrow">{content.label}</p><h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{content.title}</h2>{content.description && <p className="mt-4 text-sm leading-7 text-muted">{content.description}</p>}</MotionWrapper>
    <div className={`mt-10 grid gap-5 ${items.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {items.map((member, index) => { const zalo = safeExternalUrl(member.zaloUrl); const facebook = safeExternalUrl(member.facebookUrl); return <MotionWrapper key={member.id} delay={index * .06} className="overflow-hidden rounded-3xl border border-line/60 bg-white shadow-sm">
        <div className="aspect-[4/5] overflow-hidden bg-beige">{member.avatar ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={member.avatar} alt={member.avatarAlt || member.name} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03] motion-reduce:transform-none" /></> : <div className="grid h-full place-items-center text-sm text-muted">Chưa có ảnh</div>}</div>
        <div className="p-5"><h3 className="text-xl font-semibold text-ink">{member.name}</h3>{member.title && <p className="mt-1 text-sm font-medium text-gold">{member.title}</p>}{member.responsibility && <p className="mt-3 text-xs uppercase tracking-wide text-muted">{member.responsibility}</p>}{member.description && <p className="mt-3 text-sm leading-6 text-muted">{member.description}</p>}
          {member.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{member.tags.map((tag) => <span key={tag} className="rounded-full bg-ivory px-2.5 py-1 text-[10px] font-semibold text-muted">{tag}</span>)}</div>}
          <div className="mt-5 grid grid-cols-2 gap-2">{member.phone && <a href={`tel:${member.phone.replace(/[^\d+]/g, "")}`} aria-label={`Gọi cho ${member.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink text-xs font-semibold text-white hover:bg-gold"><PhoneCall size={15} />Gọi ngay</a>}{zalo && <a href={zalo} target="_blank" rel="noopener noreferrer" aria-label={`Nhắn Zalo cho ${member.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line text-xs font-semibold text-ink hover:border-gold"><MessageCircle size={15} />Nhắn Zalo</a>}</div>
          {(member.email || facebook) && <div className="mt-3 flex gap-2">{member.email && <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`} className="grid size-10 place-items-center rounded-full bg-ivory text-muted hover:text-gold"><Mail size={16} /></a>}{facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label={`Facebook của ${member.name}`} className="grid size-10 place-items-center rounded-full bg-ivory text-muted hover:text-gold"><Globe2 size={16} /></a>}</div>}
        </div>
      </MotionWrapper>; })}
    </div>
  </Container></section>;
}
