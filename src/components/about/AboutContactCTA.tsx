"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Container from "@/components/Container";
import MotionWrapper from "@/components/MotionWrapper";
import { contactCta } from "@/data/aboutSeed";

export default function AboutContactCTA() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(
      `Cảm ơn ${form.name}! Chúng tôi sẽ liên hệ với bạn qua số ${form.phone} trong thời gian sớm nhất.`,
    );
    setForm({ name: "", phone: "", email: "", note: "" });
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
              src={contactCta.image}
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
                    {contactCta.label}
                  </span>
                </MotionWrapper>

                <MotionWrapper delay={0.2}>
                  <h2 className="heading-font text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                    {contactCta.title}
                  </h2>
                </MotionWrapper>

                <MotionWrapper delay={0.3}>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md">
                    {contactCta.description}
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
                    className="w-full gold-gradient text-white uppercase tracking-wider font-bold text-sm py-3.5 rounded-lg transition-opacity duration-300 hover:opacity-90 cursor-pointer"
                  >
                    GỬI THÔNG TIN
                  </button>
                </form>
              </MotionWrapper>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
