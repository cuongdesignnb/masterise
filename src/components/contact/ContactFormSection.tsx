"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  MapPin,
  PhoneCall,
  Mail,
  Globe,
  Share2,
  Play,
  Link2,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import Button from "@/components/Button";
import { officeInfo } from "@/data/contactSeed";

const socialIconMap: Record<string, LucideIcon> = {
  Globe,
  Share2,
  Play,
  Link2,
  MessageCircle,
};

/* ── Sub-components ── */

function OfficeInfoCard() {
  return (
    <div className="bg-white rounded-[18px] border border-line/50 p-5">
      <h3 className="heading-font font-bold text-ink text-base mb-4">
        Thông tin văn phòng
      </h3>

      {/* Address */}
      <div className="flex items-start gap-3 py-2 border-b border-line/20">
        <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-muted">{officeInfo.address}</p>
      </div>

      {/* Hotline */}
      <div className="flex items-start gap-3 py-2 border-b border-line/20">
        <PhoneCall className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-sm font-bold text-ink">{officeInfo.hotline}</p>
      </div>

      {/* Email */}
      <div className="flex items-start gap-3 py-2">
        <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-muted">{officeInfo.email}</p>
      </div>
    </div>
  );
}

function MapCard() {
  return (
    <div className="bg-ivory rounded-[18px] border border-line/50 overflow-hidden h-[200px] relative">
      {/* Title overlay */}
      <span className="absolute top-3 left-4 text-[10px] uppercase text-muted tracking-wider z-10">
        Bản đồ chỉ đường
      </span>

      {/* SVG map illustration */}
      <svg
        viewBox="0 0 380 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Bản đồ minh hoạ khu vực văn phòng Masterise Homes"
      >
        {/* Background */}
        <rect width="380" height="200" fill="#fffdf8" />

        {/* Road grid - horizontal */}
        <line x1="0" y1="60" x2="380" y2="60" stroke="#E8DCCB" strokeWidth="1" />
        <line x1="0" y1="100" x2="380" y2="100" stroke="#E8DCCB" strokeWidth="1.2" />
        <line x1="0" y1="140" x2="380" y2="140" stroke="#E8DCCB" strokeWidth="1" />
        <line x1="0" y1="170" x2="380" y2="170" stroke="#E8DCCB" strokeWidth="0.8" />

        {/* Road grid - vertical */}
        <line x1="80" y1="0" x2="80" y2="200" stroke="#E8DCCB" strokeWidth="1" />
        <line x1="190" y1="0" x2="190" y2="200" stroke="#E8DCCB" strokeWidth="1.2" />
        <line x1="300" y1="0" x2="300" y2="200" stroke="#E8DCCB" strokeWidth="1" />

        {/* Diagonal road */}
        <line x1="40" y1="30" x2="340" y2="180" stroke="#E8DCCB" strokeWidth="0.8" />

        {/* Gold marker at centre */}
        <circle cx="190" cy="100" r="10" fill="#b88746" opacity="0.2" />
        <circle cx="190" cy="100" r="5" fill="#b88746" />
        <text
          x="190"
          y="104"
          textAnchor="middle"
          fontSize="7"
          fill="#fff"
          fontWeight="bold"
        >
          M
        </text>

        {/* Area labels */}
        <text x="60" y="52" fontSize="8" fill="#6f665c" opacity="0.5">
          Nhà Thờ Đức Bà Sài Gòn
        </text>
        <text x="240" y="80" fontSize="8" fill="#6f665c" opacity="0.5">
          Bến Nghé
        </text>
        <text x="100" y="155" fontSize="8" fill="#6f665c" opacity="0.5">
          Dinh Độc Lập
        </text>
        <text x="270" y="160" fontSize="8" fill="#6f665c" opacity="0.5">
          Quận 7
        </text>
      </svg>
    </div>
  );
}

function SocialLinksCard() {
  return (
    <div className="bg-white rounded-[18px] border border-line/50 p-5">
      <h3 className="heading-font font-bold text-ink text-base mb-4">
        Kết nối với chúng tôi
      </h3>
      <div className="flex gap-3">
        {officeInfo.socials.map((s) => {
          const Icon = socialIconMap[s.icon] ?? Globe;
          return (
            <button
              key={s.label}
              aria-label={s.label}
              className="w-10 h-10 rounded-full border border-line/60 flex items-center justify-center text-muted hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 cursor-pointer"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ── */

const subjectOptions = [
  "Tư vấn dự án",
  "Đặt lịch tham quan",
  "Bảng giá",
  "Hợp tác",
];

const needOptions = [
  "Tìm mua căn hộ",
  "Tìm mua biệt thự",
  "Đầu tư",
  "Tham quan nhà mẫu",
  "Khác",
];

const inputClass =
  "w-full border border-line rounded-xl px-4 py-3 text-sm text-ink bg-white placeholder:text-muted/40 focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none transition";

export default function ContactFormSection() {
  const [agreed, setAgreed] = useState(false);

  return (
    <section className="py-10">
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_380px] gap-7">
          {/* Left: Contact form */}
          <MotionWrapper>
            <div className="bg-white rounded-[22px] border border-line/50 p-6 lg:p-8 shadow-soft">
              <h2 className="heading-font text-xl font-bold text-ink mb-6">
                Gửi yêu cầu cho chúng tôi
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="space-y-4"
              >
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1.5 block">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1.5 block">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      placeholder="0900 000 000"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1.5 block">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1.5 block">
                      Chủ đề *
                    </label>
                    <select required className={inputClass}>
                      <option value="">Chọn chủ đề</option>
                      {subjectOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">
                    Nhu cầu tư vấn *
                  </label>
                  <select required className={inputClass}>
                    <option value="">Chọn nhu cầu</option>
                    {needOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 4 */}
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">
                    Nội dung
                  </label>
                  <textarea
                    placeholder="Nhập nội dung yêu cầu..."
                    className={`${inputClass} min-h-[130px] resize-y`}
                  />
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-gold w-4 h-4 rounded"
                  />
                  <span className="text-xs text-muted leading-snug">
                    Tôi đồng ý với{" "}
                    <span className="text-gold font-medium">
                      Chính sách bảo mật
                    </span>{" "}
                    và xác nhận thông tin trên là chính xác.
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="gold-gradient"
                  className="w-full mt-4"
                  icon={<ArrowRight className="w-4 h-4" />}
                  disabled={!agreed}
                >
                  Gửi yêu cầu
                </Button>
              </form>
            </div>
          </MotionWrapper>

          {/* Right: Side cards */}
          <div className="space-y-4 mt-7 lg:mt-0">
            <MotionWrapper delay={0.1}>
              <OfficeInfoCard />
            </MotionWrapper>

            <MotionWrapper delay={0.18}>
              <MapCard />
            </MotionWrapper>

            <MotionWrapper delay={0.26}>
              <SocialLinksCard />
            </MotionWrapper>
          </div>
        </div>
      </Container>
    </section>
  );
}
