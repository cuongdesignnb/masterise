"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { leadService } from "@/services/leadService";
import { projectService } from "@/services/projectService";
import type { ProjectOption } from "@/types/api";
import Container from "@/components/Container";

const demandOptions = [
  "Nhận bảng giá",
  "Đăng ký tư vấn",
  "Đặt lịch tham quan",
  "Tìm cơ hội đầu tư",
  "Nhận thông tin mở bán",
];

interface GlobalContactFormProps {
  projectId?: number | null;
  defaultDemandType?: string;
  leadSourcePosition?: string;
  compact?: boolean;
  embedded?: boolean;
}

export default function GlobalContactForm({
  projectId = null,
  defaultDemandType = "Đăng ký tư vấn",
  leadSourcePosition = "global_footer_form",
  compact = false,
  embedded = false,
}: GlobalContactFormProps) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    demand_type: defaultDemandType,
    project_id: projectId ? String(projectId) : "",
    message: "",
    website_url: "",
  });

  useEffect(() => {
    projectService
      .getProjectOptions()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        message: form.message.trim() || undefined,
        demand_type: form.demand_type,
        project_id: form.project_id ? Number(form.project_id) : undefined,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
        utm_term: params.get("utm_term") || undefined,
        landing_page: window.location.href,
        referrer: document.referrer || undefined,
        visitor_id: localStorage.getItem("mh_visitor_id") || undefined,
        lead_source_position: leadSourcePosition,
        website_url: form.website_url,
      });

      setStatus("success");
      setForm({
        name: "",
        phone: "",
        email: "",
        demand_type: defaultDemandType,
        project_id: projectId ? String(projectId) : "",
        message: "",
        website_url: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chưa thể gửi thông tin. Vui lòng kiểm tra lại hoặc thử lại sau.");
      setStatus("error");
    }
  };

  const benefits = [
    "Nhận thông tin mở bán mới nhất",
    "Cập nhật bảng giá và chính sách ưu đãi",
    "Đặt lịch tham quan dự án thuận tiện",
  ];

  const inputClasses =
    "h-[52px] w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition-all focus:border-champagne focus:ring-2 focus:ring-champagne/20";

  return (
    <motion.section
      id="global-contact-form"
      className={embedded ? "scroll-mt-28" : `scroll-mt-28 bg-ink-deep text-white ${compact ? "py-10" : "py-14 sm:py-20"}`}
      variants={fadeUp}
      initial={false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Container className={embedded ? "px-0 sm:px-0 lg:px-0" : undefined}>
        <div className={embedded ? "block" : "grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16"}>
          {/* Left column – copy & benefits */}
          {!embedded && <div className="flex flex-col justify-center text-left">
            <p className="text-eyebrow">Tư vấn dự án</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
              Đăng ký nhận tư vấn dự án
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Để lại thông tin, đội ngũ tư vấn sẽ liên hệ và hỗ trợ Quý khách cập nhật bảng giá,
              chính sách bán hàng và lịch tham quan dự án phù hợp.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-champagne" />
                  <span className="text-sm leading-relaxed text-white/85">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>}

          {/* Right column – form card */}
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-2xl bg-white p-6 text-left sm:p-8"
          >
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nhập họ và tên của Quý khách *"
                className={inputClasses}
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Nhập số điện thoại *"
                className={inputClasses}
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Nhập email nếu có"
                className={inputClasses}
              />
              <select
                value={form.demand_type}
                onChange={(e) => setForm({ ...form, demand_type: e.target.value })}
                className={inputClasses}
              >
                <option value="" disabled>
                  Quý khách quan tâm điều gì?
                </option>
                {demandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              disabled={Boolean(projectId)}
              className={`${inputClasses} disabled:opacity-80`}
            >
              <option value="">Chọn dự án quan tâm</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Nội dung cần tư vấn thêm"
              rows={4}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-champagne focus:ring-2 focus:ring-champagne/20"
            />

            {status === "error" && (
              <p className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                {error || "Chưa thể gửi thông tin. Vui lòng kiểm tra lại hoặc thử lại sau."}
              </p>
            )}
            {status === "success" && (
              <p className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 size={16} />
                Cảm ơn Quý khách đã đăng ký. Đội ngũ tư vấn sẽ liên hệ trong thời gian sớm nhất.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-champagne text-sm font-bold text-ink-deep transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-10"
            >
              {status === "loading" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Gửi thông tin
            </button>
          </form>
        </div>
      </Container>
    </motion.section>
  );
}
