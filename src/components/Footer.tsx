"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { publicFooterColumns } from "@/data/publicNavigation";
import Container from "./Container";

export default function Footer() {
  const { hotline, email, companyAddress, companyName, socialLinks } = useSiteSettings();

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-ink-deep text-white pt-16 pb-8 border-t border-white/5 relative">
      <Container>
        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Logo & Description */}
          <div className="lg:col-span-4 flex flex-col justify-start text-left">
            <Link href="#" className="flex items-center group self-start">
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-[0.15em] text-white uppercase heading-font leading-none">
                  Masterise
                </span>
                <span className="text-[10px] font-semibold tracking-[0.3em] text-gold-light uppercase leading-none mt-1">
                  Homes
                </span>
              </div>
            </Link>

            <p className="mt-5 text-sm text-line/70 font-light leading-relaxed max-w-sm">
              Kiến tạo những công trình biểu tượng, nâng tầm phong cách sống Việt Nam với các dự án bất động sản hàng hiệu đạt chuẩn mực quốc tế.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {[
                {
                  label: "Facebook",
                  href: socialLinks.facebook || "#",
                  svg: (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: socialLinks.instagram || "#",
                  svg: (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  label: "Youtube",
                  href: socialLinks.youtube || "#",
                  svg: (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.046 0 12 0 12s0 3.954.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.954 24 12 24 12s0-3.954-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
                {
                  label: "Linkedin",
                  href: socialLinks.linkedin || "#",
                  svg: (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                    </svg>
                  ),
                },
              ].map((social, idx) => {
                return (
                  <Link
                    key={idx}
                    href={social.href}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center text-line/80 hover:-translate-y-1 transition-all duration-300"
                    aria-label={`Follow on ${social.label}`}
                  >
                    {social.svg}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Columns 2-4: Navigation links */}
          {publicFooterColumns.map((col) => (
            <div key={col.title} className="lg:col-span-2 flex flex-col text-left">
              <h3 className="text-xs font-bold text-gold tracking-widest uppercase mb-6">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-line/70 hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 5: Contact Info */}
          <div className="lg:col-span-2 flex flex-col text-left">
            <h3 className="text-xs font-bold text-gold tracking-widest uppercase mb-6">
              LIÊN HỆ
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-gold mt-1 flex-shrink-0" />
                <span className="text-sm font-bold text-line/90">{hotline || 'Đang cập nhật'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-gold mt-1 flex-shrink-0" />
                <span className="text-sm text-line/80 break-all">{email || 'Đang cập nhật'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-gold mt-1 flex-shrink-0" />
                <span className="text-sm text-line/80 leading-relaxed">
                  {companyAddress || 'Đang cập nhật'}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-line/50 font-light">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </span>

          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <Link href="#sitemap" className="text-xs text-line/50 hover:text-gold transition-colors">
              Sơ đồ trang
            </Link>
            <Link href="#privacy" className="text-xs text-line/50 hover:text-gold transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="#terms" className="text-xs text-line/50 hover:text-gold transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>

          {/* Back to top button */}
          <button
            onClick={handleBackToTop}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-gold border border-white/10 hover:border-gold flex items-center justify-center text-line/80 hover:text-white hover:-translate-y-1 transition-all duration-300 focus:outline-none cursor-pointer group"
            aria-label="Back to top"
          >
            <ArrowUp size={16} className="group-hover:animate-bounce" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
