"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import { postService } from "@/services/postService";
import { tagService } from "@/services/tagService";
import { api } from "@/lib/api";
import { getPostDetailHref, updateListSearchParams } from "@/lib/postRoutes";
import type { ApiResponse, Post, PostCategory } from "@/types/api";

const emptyMeta = { current_page: 1, last_page: 1, per_page: 9, total: 0 };

function PostCard({ post }: { post: Post }) {
  return <Link href={getPostDetailHref(post)} className="group overflow-hidden rounded-lg border border-line/70 bg-white text-left shadow-soft transition hover:-translate-y-1">
    <div className="relative aspect-[16/10] overflow-hidden"><Image src={post.thumbnail || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop"} alt={post.title} fill className="object-cover transition duration-700 group-hover:scale-105" /></div>
    <div className="p-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">{post.category?.name || (post.post_type === 'event' ? 'Sự kiện' : 'Cơ hội đầu tư')}</span>
      <h2 className="mt-2 line-clamp-2 text-base font-black text-ink group-hover:text-gold">{post.title}</h2>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{post.summary}</p>
      <div className="mt-4 flex flex-col gap-2 text-xs text-muted"><span className="inline-flex items-center gap-1"><CalendarDays size={13} />{post.event_start_at ? new Date(post.event_start_at).toLocaleDateString("vi-VN") : post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Đang cập nhật"}</span>{post.event_location && <span className="inline-flex items-center gap-1"><MapPin size={13} />{post.event_location}</span>}</div>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-gold">Xem chi tiết <ArrowRight size={14} /></span>
    </div>
  </Link>;
}

export default function DauTuClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const [search, setSearch] = useState(q);
  const [investmentCategorySlug, setInvestmentCategorySlug] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Post[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTagName, setActiveTagName] = useState('');

  useEffect(() => { setSearch(q); }, [q]);
  useEffect(() => {
    let active = true;
    if (!tag) {
      Promise.resolve().then(() => active && setActiveTagName(''));
      return () => { active = false; };
    }
    tagService.getTags({ q: tag, post_type: 'investment' })
      .then((response) => {
        if (active) setActiveTagName(response.data.find((item) => item.slug === tag)?.name || tag);
      })
      .catch(() => active && setActiveTagName(tag));
    return () => { active = false; };
  }, [tag]);
  useEffect(() => {
    api.get<PostCategory[]>('/post-categories').then((response) => {
      const category = response.data.find((item) => item.name.trim().toLocaleLowerCase('vi-VN') === 'tin tức đầu tư');
      setInvestmentCategorySlug(category?.slug || '');
    }).catch(() => setInvestmentCategorySlug(''));
    postService.getPosts({ per_page: 6, post_type: 'event', status: 'published' }).then((response: ApiResponse<Post[]>) => setEvents(response.data || [])).catch(() => setEvents([]));
  }, []);
  useEffect(() => {
    if (investmentCategorySlug === null) return;
    if (!investmentCategorySlug) {
      setPosts([]); setMeta(emptyMeta); setIsLoading(false); return;
    }
    let active = true;
    Promise.resolve().then(() => active && setIsLoading(true));
    postService.getPosts({ per_page: 9, page, post_type: 'investment', category: investmentCategorySlug, q: q || undefined, tag: tag || undefined, status: 'published' })
      .then((response: ApiResponse<Post[]>) => { if (active) { setPosts(response.data || []); setMeta(response.meta || emptyMeta); } })
      .catch(() => { if (active) { setPosts([]); setMeta(emptyMeta); } })
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [investmentCategorySlug, page, q, tag]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === q) return;
      const params = updateListSearchParams(searchParams, { q: search.trim() || null, page: null });
      router.push(`${pathname}${params.size ? `?${params}` : ''}`);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [pathname, q, router, search, searchParams]);

  const goToPage = (next: number) => {
    const params = updateListSearchParams(searchParams, { page: next });
    router.push(`${pathname}${params.size ? `?${params}` : ''}#danh-sach-dau-tu`);
  };

  return <>
    <Header /><MobileTabBar />
    <main className="relative z-10 pb-16 lg:pb-0">
      <section className="bg-ink pt-28 text-white"><Container className="py-14 text-left"><p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Đầu tư</p><h1 className="mt-4 text-4xl font-black sm:text-5xl">Cơ hội đầu tư</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">Phân tích giá trị đầu tư được lọc đúng theo danh mục Tin tức đầu tư. Sự kiện được tách riêng bên dưới.</p></Container></section>
      <section id="danh-sach-dau-tu" className="scroll-mt-28 bg-ivory py-12 sm:py-16"><Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-ink">{tag ? `Chủ đề: ${activeTagName || tag}` : 'Phân tích đầu tư'}</h2><p className="mt-1 text-xs text-muted">{meta.total} bài · Trang {meta.current_page}/{meta.last_page}</p></div><div className="flex items-center gap-2"><label className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài đầu tư..." className="h-10 rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-gold" /></label>{tag && <button type="button" onClick={() => { const params=updateListSearchParams(searchParams,{tag:null,page:null}); router.push(`${pathname}${params.size?`?${params}`:''}`); }} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-gold"><X size={13}/>Xóa lọc chủ đề</button>}</div></div>
        {isLoading ? <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">Đang tải nội dung đầu tư...</div> : posts.length === 0 ? <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">Không có bài phù hợp trong danh mục Tin tức đầu tư.</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>}
        {meta.last_page > 1 && <nav aria-label="Phân trang bài đầu tư" className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={page<=1} onClick={()=>goToPage(page-1)} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-4 py-2 text-xs font-bold disabled:opacity-40"><ArrowLeft size={13}/>Trang trước</button><span className="text-xs font-bold text-muted">{page}/{meta.last_page}</span><button type="button" disabled={page>=meta.last_page} onClick={()=>goToPage(page+1)} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">Trang sau<ArrowRight size={13}/></button></nav>}
      </Container></section>
      {events.length > 0 && <section className="border-t border-line bg-white py-12"><Container><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-gold">Lịch hoạt động</p><h2 className="mt-2 text-2xl font-black text-ink">Sự kiện</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.map((post)=><PostCard key={post.id} post={post}/>)}</div></Container></section>}
      <GlobalContactForm defaultDemandType="Tìm cơ hội đầu tư" leadSourcePosition="investment_listing_footer_form" />
    </main><Footer />
  </>;
}
