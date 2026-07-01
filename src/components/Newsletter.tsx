"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import Container from "./Container";
import Button from "./Button";
import MotionWrapper from "./MotionWrapper";
import { leadService } from "@/services/leadService";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) return;
    setMessage("");
    setStatus("loading");

    try {
      await leadService.submitLead({
        name: "Khách đăng ký bản tin",
        phone: phone.trim(),
        email: email.trim(),
        type: "newsletter",
        demand_type: "Đăng ký nhận bản tin",
        landing_page: window.location.href,
        referrer: document.referrer || undefined,
        visitor_id: localStorage.getItem("mh_visitor_id") || undefined,
        lead_source_position: "newsletter_section_form",
      });
      setStatus("success");
      setMessage("Đăng ký bản tin thành công. Cảm ơn Quý khách!");
      setEmail("");
      setPhone("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Chưa thể đăng ký bản tin. Vui lòng thử lại sau.");
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-ivory">
      <Container>
        <div className="max-w-4xl mx-auto">
          <MotionWrapper className="bg-white border border-line rounded-luxury shadow-luxury p-8 sm:p-12 md:p-16 text-center relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

            {/* Floating Mail Icon */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-14 h-14 rounded-full bg-cream flex items-center justify-center text-gold mx-auto mb-6 shadow-sm border border-line/40"
            >
              <Mail size={24} />
            </motion.div>

            {/* Titles */}
            <h2 className="text-2xl sm:text-3xl font-bold text-ink heading-font leading-tight">
              Đăng ký nhận bản tin
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-muted max-w-lg mx-auto leading-relaxed">
              Cập nhật thông tin tiến độ dự án, các chính sách ưu đãi độc quyền và xu hướng thị trường bất động sản mới nhất từ Masterise Homes.
            </p>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="email"
                required
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-5 py-3.5 text-sm bg-cream hover:bg-white text-ink border border-line/75 rounded-full focus:outline-none focus:border-gold focus:bg-white transition-all duration-300 placeholder:text-muted/50"
              />
              <input
                type="tel"
                required
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-grow px-5 py-3.5 text-sm bg-cream hover:bg-white text-ink border border-line/75 rounded-full focus:outline-none focus:border-gold focus:bg-white transition-all duration-300 placeholder:text-muted/50"
              />
              <Button type="submit" variant="solid" size="lg" className="w-full sm:w-auto h-12 font-semibold" disabled={status === "loading"}>
                {status === "loading" ? "Đang gửi..." : "Đăng ký"}
              </Button>
            </form>
            {message && (
              <p className={`mt-3 text-xs font-semibold ${status === "success" ? "text-emerald-700" : "text-red-600"}`}>
                {message}
              </p>
            )}

            <span className="text-[10px] text-muted/65 block mt-4 tracking-wide">
              Chúng tôi cam kết bảo mật thông tin và không gửi thư rác.
            </span>
          </MotionWrapper>
        </div>
      </Container>
    </section>
  );
}
