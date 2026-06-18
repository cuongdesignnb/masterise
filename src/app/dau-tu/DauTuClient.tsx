"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Container from "@/components/Container";
import GlobalContactForm from "@/components/lead/GlobalContactForm";
import { postService } from "@/services/postService";
import { unwrapData } from "@/adapters/apiResponseAdapter";
import type { Post } from "@/types/api";

const typeLabel: Record<string, string> = {
  investment: "Cơ hội đầu tư",
  event: "Sự kiện",
};

export default function DauTuClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    postService
      .getPosts({ per_page: 12, post_type: "investment,event" })
      .then((response) => setPosts(unwrapData<Post[]>(response) || []))
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Header />
      <MobileTabBar />
      <main className="relative z-10 pb-16 lg:pb-0">
        <section className="bg-ink pt-28 text-white">
          <Container className="py-14 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Đầu tư</p>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">Cơ hội đầu tư</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">
              Cập nhật các cơ hội sở hữu, sự kiện mở bán và phân tích giá trị đầu tư từ hệ sinh thái dự án Masterise Homes.
            </p>
          </Container>
        </section>

        <section className="bg-ivory py-12 sm:py-16">
          <Container>
            {isLoading ? (
              <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">Đang tải nội dung đầu tư...</div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">Nội dung đầu tư đang được cập nhật.</div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.id} href={`/dau-tu/${post.slug}`} className="group overflow-hidden rounded-lg border border-line/70 bg-white text-left shadow-soft transition hover:-translate-y-1">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.thumbnail || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop"}
                        alt={post.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                        {typeLabel[post.post_type] || "Phân tích"}
                      </span>
                      <h2 className="mt-2 line-clamp-2 text-base font-black text-ink group-hover:text-gold">{post.title}</h2>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{post.summary}</p>
                      <div className="mt-4 flex flex-col gap-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} />
                          {post.event_start_at
                            ? new Date(post.event_start_at).toLocaleDateString("vi-VN")
                            : post.published_at
                              ? new Date(post.published_at).toLocaleDateString("vi-VN")
                              : "Đang cập nhật"}
                        </span>
                        {post.event_location && (
                          <span className="inline-flex items-center gap-1"><MapPin size={13} />{post.event_location}</span>
                        )}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-gold">
                        Xem chi tiết <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
        <GlobalContactForm defaultDemandType="Tìm cơ hội đầu tư" leadSourcePosition="investment_listing_footer_form" />
      </main>
      <Footer />
    </>
  );
}
