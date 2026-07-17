"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Mail } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import Container from "@/components/Container";
import Button from "@/components/Button";
import type { Post } from "@/types/api";

export default function NewsHero({ post, postLabel }: { post: Post | null; postLabel: string }) {
  const { newsPageHero: hero } = useSiteSettings();
  const postHref = post?.slug ? `/tin-tuc/${post.slug}` : "#bai-viet-moi-nhat";

  return (
    <section className="relative min-h-[420px] w-full overflow-hidden bg-cream pt-[72px] lg:min-h-[460px]">
      <Container className="relative z-10 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col justify-center lg:col-span-6">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted">
              {hero.breadcrumb.map((label, index) => (
                <span key={`${label}-${index}`} className="inline-flex items-center gap-1.5">
                  {index > 0 ? <ChevronRight size={12} className="text-gold" /> : null}
                  <Link href={index === 0 ? "/" : "/tin-tuc"} className={`transition-colors hover:text-gold ${index === hero.breadcrumb.length - 1 ? "font-semibold text-gold" : ""}`}>{label}</Link>
                </span>
              ))}
            </nav>
            <span className="gold-gradient mb-4 inline-block w-fit rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:text-xs">{hero.badge}</span>
            <h1 className="heading-font text-3xl font-bold leading-tight text-ink md:text-4xl lg:text-[46px]">{hero.title}</h1>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-muted">{hero.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button href="#bai-viet-moi-nhat" variant="solid" size="md" icon={<ArrowRight size={14} />} iconPosition="right">{hero.primaryCta}</Button>
              <Button href="/lien-he#global-contact-form" variant="outline" size="md" icon={<Mail size={14} />} iconPosition="left">{hero.secondaryCta}</Button>
            </div>
          </div>

          <div className="flex items-center justify-center lg:col-span-6 lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none">
              <Link href={postHref} aria-label={post ? `Đọc bài viết ${post.title}` : "Khám phá bài viết mới nhất"} className="relative block aspect-[4/3] overflow-hidden rounded-[22px] shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">
                <Image src={post?.thumbnail || hero.image} alt={post?.title || hero.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </Link>
              {post ? (
                <Link href={postHref} className="group absolute bottom-4 left-4 right-4 rounded-[16px] border border-line/30 bg-white/90 p-4 shadow-soft backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:left-auto sm:w-72">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">{postLabel}</span>
                  <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink">{post.title}</h2>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gold transition-colors group-hover:text-gold-dark">Đọc ngay<ArrowRight size={12} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
