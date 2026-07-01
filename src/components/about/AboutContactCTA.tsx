"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { leadService } from "@/services/leadService";

export default function AboutContactCTA() {
  const { aboutPageContactCta } = useSiteSettings();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      setStatus("error");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email chưa đúng định dạng.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const params = new URLSearchParams(window.location.search);
      await leadService.submitLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        type: "consultation",
        demand_type: "Tư vấn Masterise Homes",
        message: form.note.trim() || undefined,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
        utm_term: params.get("utm_term") || undefined,
        landing_page: window.location.href,
        referrer: document.referrer || undefined,
        visitor_id: localStorage.getItem("mh_visitor_id") || undefined,
        lead_source_position: "about_contact_cta_form",
      });
      setStatus("success");
      setForm({ name: "", phone: "", email: "", note: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chưa thể gửi thông tin. Vui lòng thử lại sau.");
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/50 focus:border-gold focus:outline-none transition-colors duration-200";

  return (
    <section className="py-16 md:py-24">
      <Container>
        <MotionWrapper>
          <div className="rounded-[22px] overflow-hidden relative">
            {/* Background image + overlay */}
            <Image
              src={aboutPageContactCta.image}
              alt="Liên hệ tư vấn Masterise Homes"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/80 to-ink/70" />

            {/* Content */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 md:p-12 lg:p-16">
              {/* ── Left: Copy ───────────────────────── */}
              <div className="flex flex-col justify-center">
                <MotionWrapper delay={0.1}>
                  <span className="text-gold text-xs font-bold uppercase tracking-widest mb-3 block">
                    {aboutPageContactCta.label}
                  </span>
                </MotionWrapper>

                <MotionWrapper delay={0.2}>
                  <h2 className="heading-font text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                    {aboutPageContactCta.title}
                  </h2>
                </MotionWrapper>

                <MotionWrapper delay={0.3}>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md">
                    {aboutPageContactCta.description}
                  </p>
                </MotionWrapper>
              </div>

              {/* ── Right: Form ──────────────────────── */}
              <MotionWrapper delay={0.25}>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Họ và tên *"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputClasses}
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại *"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClasses}
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClasses}
                  />

                  <textarea
                    name="note"
                    placeholder="Nhu cầu quan tâm"
                    rows={3}
                    value={form.note}
                    onChange={handleChange}
                    className={`${inputClasses} resize-none`}
                  />

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full gold-gradient text-white uppercase tracking-wider font-bold text-sm py-3.5 rounded-lg transition-opacity duration-300 hover:opacity-90 cursor-pointer"
                  >
                    {status === "loading" ? "ĐANG GỬI..." : "GỬI THÔNG TIN"}
                  </button>
                  {status === "success" ? (
                    <p className="text-xs font-semibold text-emerald-200">
                      Cảm ơn Quý khách. Đội ngũ tư vấn sẽ liên hệ trong thời gian sớm nhất.
                    </p>
                  ) : null}
                  {status === "error" && error ? (
                    <p className="text-xs font-semibold text-red-200">{error}</p>
                  ) : null}
                </form>
              </MotionWrapper>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
