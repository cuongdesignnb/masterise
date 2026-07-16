"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Image as ImageIcon,
  Plus, Save, Trash2,
} from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useToast } from "@/components/admin/Toast";
import MediaSelectModal from "@/components/admin/MediaSelectModal";
import { CONTACT_ICON_OPTIONS } from "@/lib/contactIcons";
import { CONTACT_SECTION_KEYS, CONTACT_SECTION_LABELS, defaultContactPageContent } from "@/data/defaultContactPageContent";
import { createContactItemId, normalizeContactPageContent } from "@/lib/contactPage";
import type { SystemSetting } from "@/types/api";
import type { ContactPageContent, ContactSectionKey } from "@/types/contact-page";

type TabKey = "overview" | "hero" | "commitments" | "introduction" | "salesTeam" | "achievements" | "contactForm" | "departments" | "faqs" | "ctaSeo";

const tabs: Array<{ id: TabKey; label: string }> = [
  { id: "overview", label: "Tổng quan & thứ tự" }, { id: "hero", label: "Hero" },
  { id: "commitments", label: "Cam kết" }, { id: "introduction", label: "Giới thiệu" },
  { id: "salesTeam", label: "Đội ngũ Sale" }, { id: "achievements", label: "Thành tích" },
  { id: "contactForm", label: "Form & văn phòng" }, { id: "departments", label: "Bộ phận hỗ trợ" },
  { id: "faqs", label: "FAQ" }, { id: "ctaSeo", label: "CTA & SEO" },
];

const fieldClass = "w-full rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 py-2 text-sm text-[#1F1B16] outline-none transition focus:border-[#B88746] focus:ring-2 focus:ring-[#B88746]/15";
const labelClass = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#8C7A6B]";

function parseSetting(settings: SystemSetting[], key: string): unknown {
  const item = settings.find((setting) => setting.key === key);
  if (!item?.value) return undefined;
  try { return item.type === "json" ? JSON.parse(item.value) : item.value; } catch { return undefined; }
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  return <div className="mb-3 aspect-[16/8] overflow-hidden rounded-xl border border-[#E8DCCB] bg-[#FBF8F2]">{src ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={alt} className="h-full w-full object-cover" /></> : <div className="grid h-full place-items-center text-xs text-[#8C7A6B]">Chưa chọn ảnh</div>}</div>;
}

function IconSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>{CONTACT_ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select>;
}

function ItemActions({ index, total, onMove, onRemove }: { index: number; total: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return <div className="flex shrink-0 gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Đưa lên" className="rounded-lg border border-[#E8DCCB] p-2 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Đưa xuống" className="rounded-lg border border-[#E8DCCB] p-2 disabled:opacity-30"><ArrowDown size={14} /></button><button type="button" onClick={onRemove} aria-label="Xóa mục" className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button></div>;
}

export default function ContactPageSettings({ settings, isLoading }: { settings: SystemSetting[]; isLoading: boolean }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [content, setContent] = useState<ContactPageContent>(structuredClone(defaultContactPageContent));
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [mediaPath, setMediaPath] = useState<string | null>(null);
  const isDirty = useMemo(() => Boolean(savedSnapshot) && JSON.stringify(content) !== savedSnapshot, [content, savedSnapshot]);

  useEffect(() => {
    if (isLoading) return;
    const normalized = normalizeContactPageContent(
      parseSetting(settings, "contact_page_content"),
      (parseSetting(settings, "contact_departments") as Array<Record<string, unknown>>) || [],
    );
    setContent(normalized);
    setSavedSnapshot(JSON.stringify(normalized));
  }, [settings, isLoading]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (isDirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const saveMutation = useMutation({
    mutationFn: async () => api.put("/settings", { settings: [{ key: "contact_page_content", value: content, type: "json" }] }),
    onSuccess: async () => {
      setSavedSnapshot(JSON.stringify(content));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["public-settings"] }),
      ]);
      toast.success("Đã lưu nội dung trang liên hệ.");
    },
    onError: (error) => toast.error(formatApiError(error, "Không thể lưu nội dung trang liên hệ.")),
  });

  const updateSection = <K extends ContactSectionKey>(key: K, patch: Partial<ContactPageContent[K]>) => {
    setContent((previous) => ({ ...previous, [key]: { ...previous[key], ...patch } }));
  };

  const updateItem = (section: ContactSectionKey, field: string, index: number, patch: Record<string, unknown>) => {
    setContent((previous) => {
      const next = structuredClone(previous) as unknown as Record<string, Record<string, unknown>>;
      const list = [...((next[section][field] as Array<Record<string, unknown>>) || [])];
      list[index] = { ...list[index], ...patch };
      next[section][field] = list;
      return next as unknown as ContactPageContent;
    });
  };

  const addItem = (section: ContactSectionKey, field: string, item: Record<string, unknown>) => {
    setContent((previous) => {
      const next = structuredClone(previous) as unknown as Record<string, Record<string, unknown>>;
      const list = [...((next[section][field] as Array<Record<string, unknown>>) || [])];
      next[section][field] = [...list, { ...item, sortOrder: (list.length + 1) * 10 }];
      return next as unknown as ContactPageContent;
    });
  };

  const removeItem = (section: ContactSectionKey, field: string, index: number, label: string) => {
    if (!window.confirm(`Xóa ${label}? Thao tác sẽ được áp dụng khi bấm lưu.`)) return;
    setContent((previous) => {
      const next = structuredClone(previous) as unknown as Record<string, Record<string, unknown>>;
      next[section][field] = ((next[section][field] as unknown[]) || []).filter((_, itemIndex) => itemIndex !== index);
      return next as unknown as ContactPageContent;
    });
  };

  const moveItem = (section: ContactSectionKey, field: string, index: number, direction: -1 | 1) => {
    setContent((previous) => {
      const next = structuredClone(previous) as unknown as Record<string, Record<string, unknown>>;
      const list = [...((next[section][field] as Array<Record<string, unknown>>) || [])];
      const target = index + direction;
      if (target < 0 || target >= list.length) return previous;
      [list[index], list[target]] = [list[target], list[index]];
      next[section][field] = list.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return next as unknown as ContactPageContent;
    });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= content.sectionOrder.length) return;
    const order = [...content.sectionOrder];
    [order[index], order[target]] = [order[target], order[index]];
    setContent((previous) => {
      const next = { ...previous, sectionOrder: order };
      order.forEach((key, orderIndex) => { next[key] = { ...next[key], sortOrder: (orderIndex + 1) * 10 } as never; });
      return next;
    });
  };

  const applyMedia = (url: string | string[]) => {
    if (!mediaPath || Array.isArray(url)) return;
    setContent((previous) => {
      const next = structuredClone(previous) as unknown as Record<string, unknown>;
      const parts = mediaPath.split(".");
      let cursor: Record<string, unknown> | unknown[] = next;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) (cursor as Record<string, unknown>)[part] = url;
        else cursor = (cursor as Record<string, unknown>)[part] as Record<string, unknown>;
      });
      return next as unknown as ContactPageContent;
    });
    setMediaPath(null);
  };

  const SectionHeader = ({ section, title }: { section: ContactSectionKey; title: string }) => {
    const sectionContent = content[section];
    return <div className="flex flex-col gap-3 border-b border-[#E8DCCB] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold text-[#1F1B16]">{title}</h3><p className="mt-1 text-xs text-[#8C7A6B]">Ẩn section sẽ không tạo khoảng trắng ngoài trang public.</p></div><button type="button" onClick={() => updateSection(section, { enabled: !sectionContent.enabled } as Partial<ContactPageContent[typeof section]>)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${sectionContent.enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{sectionContent.enabled ? <Eye size={15} /> : <EyeOff size={15} />}{sectionContent.enabled ? "Đang hiển thị" : "Đang ẩn"}</button></div>;
  };

  const CommonHeadingFields = ({ section }: { section: "commitments" | "salesTeam" | "achievements" | "departments" | "faqs" }) => {
    const sectionContent = content[section];
    return <div className="grid gap-4 md:grid-cols-2"><label><span className={labelClass}>Label</span><input className={fieldClass} value={sectionContent.label} onChange={(event) => updateSection(section, { label: event.target.value } as never)} /></label><label><span className={labelClass}>Tiêu đề</span><input className={fieldClass} value={sectionContent.title} onChange={(event) => updateSection(section, { title: event.target.value } as never)} /></label><label className="md:col-span-2"><span className={labelClass}>Mô tả</span><textarea rows={3} className={fieldClass} value={sectionContent.description} onChange={(event) => updateSection(section, { description: event.target.value } as never)} /></label></div>;
  };

  if (isLoading) return <div className="py-16 text-center text-sm text-[#8C7A6B]">Đang tải nội dung trang liên hệ…</div>;

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-xl font-semibold text-[#1F1B16]">Quản trị trang liên hệ</h2><p className="mt-1 text-xs text-[#8C7A6B]">Một cấu hình duy nhất cho nội dung, thứ tự, SEO và dữ liệu hiển thị public.</p>{isDirty && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700"><AlertTriangle size={14} />Có thay đổi chưa lưu</p>}</div>
      <div className="flex flex-wrap gap-2"><a href="/lien-he" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-4 py-2.5 text-xs font-bold text-[#1F1B16]"><ExternalLink size={15} />Xem trang liên hệ</a><button type="button" disabled={saveMutation.isPending || !isDirty} onClick={() => saveMutation.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-[#B88746] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-45"><Save size={15} />{saveMutation.isPending ? "Đang lưu…" : "Lưu nội dung trang liên hệ"}</button></div>
    </div>

    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-1.5">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold ${activeTab === tab.id ? "bg-white text-[#B88746] shadow-sm" : "text-[#8C7A6B]"}`}>{tab.label}</button>)}</div>

    <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 sm:p-6">
      {activeTab === "overview" && <div className="space-y-5"><div><h3 className="text-lg font-semibold text-[#1F1B16]">Thứ tự section</h3><p className="mt-1 text-xs text-[#8C7A6B]">Dùng nút lên/xuống để thay đổi thứ tự hiển thị.</p></div>{content.sectionOrder.map((key, index) => <div key={key} className="flex items-center gap-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] p-3"><span className="grid size-8 place-items-center rounded-full bg-white text-xs font-bold text-[#B88746]">{index + 1}</span><span className="flex-1 text-sm font-semibold text-[#1F1B16]">{CONTACT_SECTION_LABELS[key]}</span><button type="button" onClick={() => updateSection(key, { enabled: !content[key].enabled } as never)} className={`rounded-full px-3 py-1 text-[10px] font-bold ${content[key].enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>{content[key].enabled ? "Hiển thị" : "Đã ẩn"}</button><ItemActions index={index} total={content.sectionOrder.length} onMove={(direction) => moveSection(index, direction)} onRemove={() => updateSection(key, { enabled: false } as never)} /></div>)}</div>}

      {activeTab === "hero" && <div className="space-y-6"><SectionHeader section="hero" title="Hero liên hệ" /><div className="grid gap-4 md:grid-cols-2"><label><span className={labelClass}>Badge</span><input className={fieldClass} value={content.hero.eyebrow} onChange={(e) => updateSection("hero", { eyebrow: e.target.value })} /></label><label><span className={labelClass}>Tiêu đề H1</span><input className={fieldClass} value={content.hero.title} onChange={(e) => updateSection("hero", { title: e.target.value })} /></label><label className="md:col-span-2"><span className={labelClass}>Mô tả</span><textarea rows={3} className={fieldClass} value={content.hero.description} onChange={(e) => updateSection("hero", { description: e.target.value })} /></label><div><PreviewImage src={content.hero.image} alt="Hero preview" /><button type="button" onClick={() => setMediaPath("hero.image")} className="rounded-xl bg-[#1F1B16] px-3 py-2 text-xs font-bold text-white">Chọn ảnh từ Media Library</button></div><label><span className={labelClass}>Alt ảnh</span><input className={fieldClass} value={content.hero.imageAlt} onChange={(e) => updateSection("hero", { imageAlt: e.target.value })} /></label>{(["primaryCta", "secondaryCta"] as const).map((cta) => <React.Fragment key={cta}><label><span className={labelClass}>{cta === "primaryCta" ? "Nút chính" : "Nút phụ"}</span><input className={fieldClass} value={content.hero[cta].label} onChange={(e) => updateSection("hero", { [cta]: { ...content.hero[cta], label: e.target.value } })} /></label><label><span className={labelClass}>URL</span><input className={fieldClass} value={content.hero[cta].url} onChange={(e) => updateSection("hero", { [cta]: { ...content.hero[cta], url: e.target.value } })} /></label></React.Fragment>)}<label><span className={labelClass}>Dòng hotline</span><input className={fieldClass} value={content.hero.hotlineLine} onChange={(e) => updateSection("hero", { hotlineLine: e.target.value })} /></label><label><span className={labelClass}>Dòng phản hồi</span><input className={fieldClass} value={content.hero.responseLine} onChange={(e) => updateSection("hero", { responseLine: e.target.value })} /></label></div><div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-bold">Thẻ thông tin nhanh ({content.hero.quickInfo.length})</h4><button type="button" onClick={() => addItem("hero", "quickInfo", { id: createContactItemId("quick"), label: "Thông tin", value: "Nội dung", icon: "BadgeCheck", isActive: true })} className="rounded-lg bg-[#B88746] px-3 py-2 text-xs font-bold text-white"><Plus size={14} className="inline" /> Thêm thẻ</button></div>{content.hero.quickInfo.map((item, index) => <div key={item.id} className="grid gap-3 rounded-xl border border-[#E8DCCB] p-3 md:grid-cols-[1fr_1fr_180px_auto]"><input className={fieldClass} value={item.label} onChange={(e) => updateItem("hero", "quickInfo", index, { label: e.target.value })} /><input className={fieldClass} value={item.value} onChange={(e) => updateItem("hero", "quickInfo", index, { value: e.target.value })} /><IconSelect value={item.icon} onChange={(icon) => updateItem("hero", "quickInfo", index, { icon })} /><ItemActions index={index} total={content.hero.quickInfo.length} onMove={(d) => moveItem("hero", "quickInfo", index, d)} onRemove={() => removeItem("hero", "quickInfo", index, "thẻ thông tin")} /></div>)}</div></div>}

      {activeTab === "commitments" && <div className="space-y-6"><SectionHeader section="commitments" title="Cam kết với khách hàng" /><CommonHeadingFields section="commitments" /><div className="flex justify-end"><button type="button" onClick={() => addItem("commitments", "items", { id: createContactItemId("commitment"), title: "Cam kết mới", description: "Mô tả cam kết", icon: "ShieldCheck", isActive: true })} className="rounded-xl bg-[#B88746] px-3 py-2 text-xs font-bold text-white"><Plus size={14} className="inline" /> Thêm cam kết</button></div>{content.commitments.items.map((item, index) => <div key={item.id} className="grid gap-3 rounded-xl border border-[#E8DCCB] p-4 md:grid-cols-2"><label><span className={labelClass}>Tiêu đề</span><input className={fieldClass} value={item.title} onChange={(e) => updateItem("commitments", "items", index, { title: e.target.value })} /></label><div><span className={labelClass}>Icon</span><IconSelect value={item.icon} onChange={(icon) => updateItem("commitments", "items", index, { icon })} /></div><label className="md:col-span-2"><span className={labelClass}>Mô tả</span><textarea className={fieldClass} value={item.description} onChange={(e) => updateItem("commitments", "items", index, { description: e.target.value })} /></label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.isActive} onChange={(e) => updateItem("commitments", "items", index, { isActive: e.target.checked })} />Hiển thị</label><div className="flex justify-end"><ItemActions index={index} total={content.commitments.items.length} onMove={(d) => moveItem("commitments", "items", index, d)} onRemove={() => removeItem("commitments", "items", index, "cam kết")} /></div></div>)}</div>}

      {activeTab === "introduction" && <div className="space-y-6"><SectionHeader section="introduction" title="Giới thiệu đội ngũ tư vấn" /><div className="grid gap-4 md:grid-cols-2"><label><span className={labelClass}>Label</span><input className={fieldClass} value={content.introduction.label} onChange={(e) => updateSection("introduction", { label: e.target.value })} /></label><label><span className={labelClass}>Tiêu đề</span><input className={fieldClass} value={content.introduction.title} onChange={(e) => updateSection("introduction", { title: e.target.value })} /></label></div><div><div className="mb-2 flex justify-between"><h4 className="text-sm font-bold">Các đoạn nội dung</h4><button type="button" onClick={() => updateSection("introduction", { paragraphs: [...content.introduction.paragraphs, ""] })} className="text-xs font-bold text-[#B88746]">+ Thêm đoạn</button></div>{content.introduction.paragraphs.map((paragraph, index) => <div key={index} className="mb-2 flex gap-2"><textarea className={fieldClass} value={paragraph} onChange={(e) => { const list = [...content.introduction.paragraphs]; list[index] = e.target.value; updateSection("introduction", { paragraphs: list }); }} /><button type="button" onClick={() => updateSection("introduction", { paragraphs: content.introduction.paragraphs.filter((_, i) => i !== index) })} className="text-red-600"><Trash2 size={16} /></button></div>)}</div><div className="grid gap-6 lg:grid-cols-2"><div><div className="mb-2 flex justify-between"><h4 className="text-sm font-bold">Ảnh ({content.introduction.images.length})</h4><button type="button" onClick={() => addItem("introduction", "images", { id: createContactItemId("intro-image"), url: "", alt: "", isActive: true })} className="text-xs font-bold text-[#B88746]">+ Thêm ảnh</button></div>{content.introduction.images.map((image, index) => <div key={image.id} className="mb-3 rounded-xl border border-[#E8DCCB] p-3"><PreviewImage src={image.url} alt={image.alt || "Preview"} /><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input className={fieldClass} placeholder="Alt ảnh" value={image.alt} onChange={(e) => updateItem("introduction", "images", index, { alt: e.target.value })} /><button type="button" onClick={() => setMediaPath(`introduction.images.${index}.url`)} className="rounded-xl bg-[#1F1B16] px-3 text-xs font-bold text-white">Chọn ảnh</button></div><div className="mt-2 flex justify-end"><ItemActions index={index} total={content.introduction.images.length} onMove={(d) => moveItem("introduction", "images", index, d)} onRemove={() => removeItem("introduction", "images", index, "ảnh")} /></div></div>)}</div><div><div className="mb-2 flex justify-between"><h4 className="text-sm font-bold">Điểm nổi bật ({content.introduction.bullets.length})</h4><button type="button" onClick={() => addItem("introduction", "bullets", { id: createContactItemId("intro-bullet"), text: "Điểm nổi bật mới", isActive: true })} className="text-xs font-bold text-[#B88746]">+ Thêm bullet</button></div>{content.introduction.bullets.map((item, index) => <div key={item.id} className="mb-2 flex gap-2"><input className={fieldClass} value={item.text} onChange={(e) => updateItem("introduction", "bullets", index, { text: e.target.value })} /><ItemActions index={index} total={content.introduction.bullets.length} onMove={(d) => moveItem("introduction", "bullets", index, d)} onRemove={() => removeItem("introduction", "bullets", index, "bullet")} /></div>)}</div></div><div className="grid gap-4 md:grid-cols-2"><label><span className={labelClass}>CTA</span><input className={fieldClass} value={content.introduction.cta.label} onChange={(e) => updateSection("introduction", { cta: { ...content.introduction.cta, label: e.target.value } })} /></label><label><span className={labelClass}>URL CTA</span><input className={fieldClass} value={content.introduction.cta.url} onChange={(e) => updateSection("introduction", { cta: { ...content.introduction.cta, url: e.target.value } })} /></label></div></div>}

      {activeTab === "salesTeam" && <div className="space-y-6"><SectionHeader section="salesTeam" title="Đội ngũ Sale public" /><CommonHeadingFields section="salesTeam" /><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Chỉ nhập thông tin nhân sự đã được phép công khai. Danh sách rỗng sẽ tự ẩn ngoài trang.</div><div className="flex justify-end"><button type="button" onClick={() => addItem("salesTeam", "items", { id: createContactItemId("sale"), name: "", title: "", avatar: "", avatarAlt: "", description: "", responsibility: "", phone: "", email: "", zaloUrl: "", facebookUrl: "", tags: [], isActive: true })} className="rounded-xl bg-[#B88746] px-3 py-2 text-xs font-bold text-white"><Plus size={14} className="inline" /> Thêm thành viên</button></div>{content.salesTeam.items.length === 0 && <div className="rounded-xl border border-dashed border-[#E8DCCB] p-8 text-center text-xs text-[#8C7A6B]">Chưa có nhân sự public. Section sẽ không hiển thị.</div>}{content.salesTeam.items.map((member, index) => <div key={member.id} className="rounded-2xl border border-[#E8DCCB] p-4"><div className="grid gap-5 lg:grid-cols-[220px_1fr]"><div><PreviewImage src={member.avatar} alt={member.avatarAlt || member.name || "Avatar"} /><button type="button" onClick={() => setMediaPath(`salesTeam.items.${index}.avatar`)} className="w-full rounded-xl bg-[#1F1B16] px-3 py-2 text-xs font-bold text-white"><ImageIcon size={14} className="inline" /> Chọn avatar</button></div><div className="grid gap-3 md:grid-cols-2"><label><span className={labelClass}>Họ tên *</span><input className={fieldClass} value={member.name} onChange={(e) => updateItem("salesTeam", "items", index, { name: e.target.value })} /></label><label><span className={labelClass}>Chức danh</span><input className={fieldClass} value={member.title} onChange={(e) => updateItem("salesTeam", "items", index, { title: e.target.value })} /></label><label><span className={labelClass}>Khu vực/dự án phụ trách</span><input className={fieldClass} value={member.responsibility} onChange={(e) => updateItem("salesTeam", "items", index, { responsibility: e.target.value })} /></label><label><span className={labelClass}>Alt ảnh</span><input className={fieldClass} value={member.avatarAlt} onChange={(e) => updateItem("salesTeam", "items", index, { avatarAlt: e.target.value })} /></label><label><span className={labelClass}>Điện thoại</span><input className={fieldClass} value={member.phone} onChange={(e) => updateItem("salesTeam", "items", index, { phone: e.target.value })} /></label><label><span className={labelClass}>Email</span><input type="email" className={fieldClass} value={member.email} onChange={(e) => updateItem("salesTeam", "items", index, { email: e.target.value })} /></label><label><span className={labelClass}>Zalo URL</span><input className={fieldClass} value={member.zaloUrl} onChange={(e) => updateItem("salesTeam", "items", index, { zaloUrl: e.target.value })} /></label><label><span className={labelClass}>Facebook URL</span><input className={fieldClass} value={member.facebookUrl} onChange={(e) => updateItem("salesTeam", "items", index, { facebookUrl: e.target.value })} /></label><label className="md:col-span-2"><span className={labelClass}>Mô tả ngắn</span><textarea className={fieldClass} value={member.description} onChange={(e) => updateItem("salesTeam", "items", index, { description: e.target.value })} /></label><label className="md:col-span-2"><span className={labelClass}>Chuyên môn/tag, phân cách bằng dấu phẩy</span><input className={fieldClass} value={member.tags.join(", ")} onChange={(e) => updateItem("salesTeam", "items", index, { tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label></div></div><div className="mt-4 flex items-center justify-between"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={member.isActive} onChange={(e) => updateItem("salesTeam", "items", index, { isActive: e.target.checked })} />Công khai thành viên</label><ItemActions index={index} total={content.salesTeam.items.length} onMove={(d) => moveItem("salesTeam", "items", index, d)} onRemove={() => removeItem("salesTeam", "items", index, "thành viên")} /></div></div>)}</div>}

      {activeTab === "achievements" && <div className="space-y-6"><SectionHeader section="achievements" title="Năng lực & thành tích" /><CommonHeadingFields section="achievements" /><div className="grid gap-6 lg:grid-cols-2"><div className="space-y-3"><div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={content.achievements.metricsEnabled} onChange={(e) => updateSection("achievements", { metricsEnabled: e.target.checked })} />Chỉ số ({content.achievements.metrics.length})</label><button type="button" onClick={() => addItem("achievements", "metrics", { id: createContactItemId("metric"), value: "", suffix: "", label: "", description: "", icon: "TrendingUp", isActive: true })} className="text-xs font-bold text-[#B88746]">+ Thêm</button></div>{content.achievements.metrics.map((metric, index) => <div key={metric.id} className="rounded-xl border border-[#E8DCCB] p-3"><div className="grid gap-2 sm:grid-cols-2"><input className={fieldClass} placeholder="Giá trị" value={metric.value} onChange={(e) => updateItem("achievements", "metrics", index, { value: e.target.value })} /><input className={fieldClass} placeholder="Hậu tố" value={metric.suffix} onChange={(e) => updateItem("achievements", "metrics", index, { suffix: e.target.value })} /><input className={fieldClass} placeholder="Nhãn" value={metric.label} onChange={(e) => updateItem("achievements", "metrics", index, { label: e.target.value })} /><IconSelect value={metric.icon} onChange={(icon) => updateItem("achievements", "metrics", index, { icon })} /><textarea className={`${fieldClass} sm:col-span-2`} placeholder="Mô tả" value={metric.description} onChange={(e) => updateItem("achievements", "metrics", index, { description: e.target.value })} /></div><div className="mt-2 flex justify-end"><ItemActions index={index} total={content.achievements.metrics.length} onMove={(d) => moveItem("achievements", "metrics", index, d)} onRemove={() => removeItem("achievements", "metrics", index, "chỉ số")} /></div></div>)}</div><div className="space-y-3"><div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={content.achievements.milestonesEnabled} onChange={(e) => updateSection("achievements", { milestonesEnabled: e.target.checked })} />Dấu mốc ({content.achievements.milestones.length})</label><button type="button" onClick={() => addItem("achievements", "milestones", { id: createContactItemId("milestone"), year: "", title: "", description: "", image: "", imageAlt: "", referenceUrl: "", isActive: true })} className="text-xs font-bold text-[#B88746]">+ Thêm</button></div>{content.achievements.milestones.map((item, index) => <div key={item.id} className="rounded-xl border border-[#E8DCCB] p-3"><PreviewImage src={item.image} alt={item.imageAlt || item.title || "Dấu mốc"} /><button type="button" onClick={() => setMediaPath(`achievements.milestones.${index}.image`)} className="mb-3 rounded-lg bg-[#1F1B16] px-3 py-2 text-xs font-bold text-white">Chọn ảnh/logo</button><div className="grid gap-2 sm:grid-cols-2"><input className={fieldClass} placeholder="Năm" value={item.year} onChange={(e) => updateItem("achievements", "milestones", index, { year: e.target.value })} /><input className={fieldClass} placeholder="Tiêu đề" value={item.title} onChange={(e) => updateItem("achievements", "milestones", index, { title: e.target.value })} /><textarea className={`${fieldClass} sm:col-span-2`} placeholder="Mô tả" value={item.description} onChange={(e) => updateItem("achievements", "milestones", index, { description: e.target.value })} /><input className={`${fieldClass} sm:col-span-2`} placeholder="Link tham khảo" value={item.referenceUrl} onChange={(e) => updateItem("achievements", "milestones", index, { referenceUrl: e.target.value })} /></div><div className="mt-2 flex justify-end"><ItemActions index={index} total={content.achievements.milestones.length} onMove={(d) => moveItem("achievements", "milestones", index, d)} onRemove={() => removeItem("achievements", "milestones", index, "dấu mốc")} /></div></div>)}</div></div></div>}

      {activeTab === "contactForm" && <div className="space-y-6"><SectionHeader section="contactForm" title="Form liên hệ & thông tin văn phòng" /><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">Form tiếp tục dùng GlobalContactForm và leadSourcePosition = contact_page_form. Các trường trống sẽ dùng thông tin doanh nghiệp chung.</div><div className="grid gap-4 md:grid-cols-2">{([['label','Label'],['title','Tiêu đề form'],['officeTitle','Tiêu đề văn phòng'],['hotline','Hotline override'],['email','Email override'],['address','Địa chỉ override'],['workingHours','Giờ làm việc'],['mapUrl','Google Maps URL'],['mapEmbedUrl','Google Maps embed URL'],['directionsLabel','Nhãn chỉ đường'],['directionsUrl','URL chỉ đường'],['mapImageAlt','Alt ảnh bản đồ']] as const).map(([field,label]) => <label key={field}><span className={labelClass}>{label}</span><input className={fieldClass} value={content.contactForm[field]} onChange={(e) => updateSection("contactForm", { [field]: e.target.value })} /></label>)}<label className="md:col-span-2"><span className={labelClass}>Mô tả form</span><textarea rows={3} className={fieldClass} value={content.contactForm.description} onChange={(e) => updateSection("contactForm", { description: e.target.value })} /></label><div className="md:col-span-2"><PreviewImage src={content.contactForm.mapImage} alt={content.contactForm.mapImageAlt} /><button type="button" onClick={() => setMediaPath("contactForm.mapImage")} className="rounded-xl bg-[#1F1B16] px-3 py-2 text-xs font-bold text-white">Chọn ảnh bản đồ</button></div></div></div>}

      {activeTab === "departments" && <div className="space-y-6"><SectionHeader section="departments" title="Bộ phận hỗ trợ" /><CommonHeadingFields section="departments" /><div className="flex justify-end"><button type="button" onClick={() => addItem("departments", "items", { id: createContactItemId("department"), name: "", description: "", phone: "", email: "", workingHours: "", icon: "Headphones", isActive: true })} className="rounded-xl bg-[#B88746] px-3 py-2 text-xs font-bold text-white"><Plus size={14} className="inline" /> Thêm phòng ban</button></div>{content.departments.items.map((item, index) => <div key={item.id} className="grid gap-3 rounded-xl border border-[#E8DCCB] p-4 md:grid-cols-2"><input className={fieldClass} placeholder="Tên phòng ban" value={item.name} onChange={(e) => updateItem("departments", "items", index, { name: e.target.value })} /><IconSelect value={item.icon} onChange={(icon) => updateItem("departments", "items", index, { icon })} /><input className={fieldClass} placeholder="Điện thoại" value={item.phone} onChange={(e) => updateItem("departments", "items", index, { phone: e.target.value })} /><input className={fieldClass} placeholder="Email" value={item.email} onChange={(e) => updateItem("departments", "items", index, { email: e.target.value })} /><input className={fieldClass} placeholder="Giờ làm việc" value={item.workingHours} onChange={(e) => updateItem("departments", "items", index, { workingHours: e.target.value })} /><textarea className={fieldClass} placeholder="Mô tả" value={item.description} onChange={(e) => updateItem("departments", "items", index, { description: e.target.value })} /><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.isActive} onChange={(e) => updateItem("departments", "items", index, { isActive: e.target.checked })} />Hiển thị</label><div className="flex justify-end"><ItemActions index={index} total={content.departments.items.length} onMove={(d) => moveItem("departments", "items", index, d)} onRemove={() => removeItem("departments", "items", index, "phòng ban")} /></div></div>)}</div>}

      {activeTab === "faqs" && <div className="space-y-6"><SectionHeader section="faqs" title="Câu hỏi thường gặp" /><CommonHeadingFields section="faqs" /><div className="flex justify-end"><button type="button" onClick={() => addItem("faqs", "items", { id: createContactItemId("faq"), question: "", answer: "", isActive: true })} className="rounded-xl bg-[#B88746] px-3 py-2 text-xs font-bold text-white"><Plus size={14} className="inline" /> Thêm câu hỏi</button></div>{content.faqs.items.map((item, index) => <div key={item.id} className="rounded-xl border border-[#E8DCCB] p-4"><input className={fieldClass} placeholder="Câu hỏi" value={item.question} onChange={(e) => updateItem("faqs", "items", index, { question: e.target.value })} /><textarea rows={3} className={`${fieldClass} mt-3`} placeholder="Câu trả lời" value={item.answer} onChange={(e) => updateItem("faqs", "items", index, { answer: e.target.value })} /><div className="mt-3 flex items-center justify-between"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.isActive} onChange={(e) => updateItem("faqs", "items", index, { isActive: e.target.checked })} />Hiển thị</label><ItemActions index={index} total={content.faqs.items.length} onMove={(d) => moveItem("faqs", "items", index, d)} onRemove={() => removeItem("faqs", "items", index, "FAQ")} /></div></div>)}</div>}

      {activeTab === "ctaSeo" && <div className="space-y-8"><SectionHeader section="cta" title="CTA cuối trang" /><div className="grid gap-4 md:grid-cols-2">{([['label','Label'],['title','Tiêu đề'],['imageAlt','Alt ảnh']] as const).map(([field,label]) => <label key={field}><span className={labelClass}>{label}</span><input className={fieldClass} value={content.cta[field]} onChange={(e) => updateSection("cta", { [field]: e.target.value })} /></label>)}<label className="md:col-span-2"><span className={labelClass}>Mô tả</span><textarea className={fieldClass} value={content.cta.description} onChange={(e) => updateSection("cta", { description: e.target.value })} /></label><div className="md:col-span-2"><PreviewImage src={content.cta.image} alt={content.cta.imageAlt} /><button type="button" onClick={() => setMediaPath("cta.image")} className="rounded-xl bg-[#1F1B16] px-3 py-2 text-xs font-bold text-white">Chọn ảnh CTA</button></div>{(["primaryCta", "secondaryCta"] as const).map((cta) => <React.Fragment key={cta}><input className={fieldClass} placeholder="Nhãn nút" value={content.cta[cta].label} onChange={(e) => updateSection("cta", { [cta]: { ...content.cta[cta], label: e.target.value } })} /><input className={fieldClass} placeholder="URL nút" value={content.cta[cta].url} onChange={(e) => updateSection("cta", { [cta]: { ...content.cta[cta], url: e.target.value } })} /></React.Fragment>)}</div><div className="border-t border-[#E8DCCB] pt-6"><h3 className="text-lg font-semibold text-[#1F1B16]">SEO trang liên hệ</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{([['title','Meta title'],['keywords','Keywords'],['ogTitle','OG title'],['ogImage','OG image URL']] as const).map(([field,label]) => <label key={field}><span className={labelClass}>{label}</span><input className={fieldClass} value={content.seo[field]} onChange={(e) => setContent((previous) => ({ ...previous, seo: { ...previous.seo, [field]: e.target.value } }))} /></label>)}{([['description','Meta description'],['ogDescription','OG description']] as const).map(([field,label]) => <label key={field} className="md:col-span-2"><span className={labelClass}>{label}</span><textarea className={fieldClass} value={content.seo[field]} onChange={(e) => setContent((previous) => ({ ...previous, seo: { ...previous.seo, [field]: e.target.value } }))} /></label>)}<button type="button" onClick={() => setMediaPath("seo.ogImage")} className="w-fit rounded-xl bg-[#1F1B16] px-3 py-2 text-xs font-bold text-white">Chọn OG image</button></div></div></div>}
    </div>

    {mediaPath && <MediaSelectModal isOpen onClose={() => setMediaPath(null)} onSelect={applyMedia} />}
  </div>;
}
