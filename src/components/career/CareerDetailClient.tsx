'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react';
import Header from '@/components/Header'; import Footer from '@/components/Footer'; import MobileTabBar from '@/components/MobileTabBar';
import CareerApplicationForm from './CareerApplicationForm'; import type { CareerJob, CareerOptions } from '@/types/career';

const date = (value?: string | null) => value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : 'Không giới hạn';
const blocks: Array<[keyof CareerJob, string]> = [['description','Tổng quan công việc'],['responsibilities','Trách nhiệm'],['requirements','Yêu cầu'],['benefits','Quyền lợi'],['working_time','Thời gian làm việc'],['additional_information','Thông tin bổ sung']];

export default function CareerDetailClient({ job, related, applicationRules }: { job: CareerJob; related: CareerJob[]; applicationRules?: CareerOptions['application_rules'] }) {
  const [open, setOpen] = useState(false);
  const salary = job.salary_text || 'Thỏa thuận';
  return <><Header /><MobileTabBar /><main className="bg-[#FBF8F2] pb-32 lg:pb-0">
    <section className="relative overflow-hidden border-b border-[#E7D9C6] bg-[#EEE5D8]">
      {job.banner_image && <img src={job.banner_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
      <div className="relative mx-auto max-w-[1344px] px-4 py-10 sm:px-8 lg:py-16"><Link href="/tuyen-dung" className="inline-flex items-center gap-2 text-sm text-[#6E6258]"><ArrowLeft className="size-4" /> Danh sách tuyển dụng</Link><div className="mt-8 max-w-4xl">{job.is_featured && <span className="rounded-full bg-[#B88746] px-3 py-1 text-xs font-bold uppercase text-white">Vị trí nổi bật</span>}<h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{job.title}</h1><p className="mt-4 max-w-3xl text-lg leading-7 text-[#62574D]">{job.short_description}</p><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm"><span className="flex gap-2"><BriefcaseBusiness className="size-4 text-[#B88746]" />{job.department}</span><span className="flex gap-2"><MapPin className="size-4 text-[#B88746]" />{job.location}</span><span className="flex gap-2"><Clock3 className="size-4 text-[#B88746]" />{job.employment_type_label}</span></div></div></div>
    </section>
    <div className="mx-auto grid max-w-[1344px] gap-7 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <article className="min-w-0 rounded-lg border border-[#E7D9C6] bg-white p-5 sm:p-8">{blocks.map(([key,title]) => job[key] ? <section key={key} className="border-b border-[#EEE5D8] py-6 first:pt-0 last:border-0"><h2 className="mb-4 text-2xl font-semibold">{title}</h2><div className="prose prose-neutral max-w-none text-[#51483F]" dangerouslySetInnerHTML={{ __html: String(job[key]) }} /></section> : null)}<section className="py-6"><h2 className="mb-3 text-2xl font-semibold">Địa điểm làm việc</h2><p className="flex gap-2 text-[#51483F]"><MapPin className="mt-1 size-5 shrink-0 text-[#B88746]" />{job.location}</p></section></article>
      <aside><div className="sticky top-24 rounded-lg border border-[#E1D1BA] bg-[#FFFCF7] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-[#B88746]">Thông tin vị trí</p><div className="mt-5 grid gap-4 text-sm"><Fact icon={CalendarDays} label="Hạn ứng tuyển" value={date(job.application_deadline)} /><Fact icon={MapPin} label="Địa điểm" value={job.location} /><Fact icon={Clock3} label="Loại hình" value={job.employment_type_label} /><Fact icon={UsersRound} label="Số lượng" value={`${job.vacancies} vị trí`} /><Fact icon={BriefcaseBusiness} label="Mức lương" value={salary} /></div><button disabled={!job.accepting_applications} onClick={() => setOpen(true)} className="mt-6 w-full rounded-md bg-[#B88746] px-5 py-3 font-semibold text-white disabled:bg-[#A89D91]">{job.accepting_applications ? 'Ứng tuyển ngay' : 'Đã ngừng nhận hồ sơ'}</button></div></aside>
    </div>
    {!!related.length && <section className="border-t border-[#E7D9C6] bg-white"><div className="mx-auto max-w-[1344px] px-4 py-12 sm:px-8"><h2 className="text-3xl font-semibold">Vị trí liên quan</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{related.slice(0,3).map(item => <Link key={item.id} href={`/tuyen-dung/${item.slug}`} className="rounded-md border border-[#E7D9C6] p-5 hover:shadow-md"><p className="text-sm font-semibold text-[#B88746]">{item.department}</p><h3 className="mt-2 text-lg font-semibold">{item.title}</h3><p className="mt-3 flex gap-2 text-sm text-[#6E6258]"><MapPin className="size-4" />{item.location}</p></Link>)}</div></div></section>}
    {job.accepting_applications && <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#E7D9C6] bg-white/95 p-3 backdrop-blur lg:hidden"><button onClick={() => setOpen(true)} className="w-full rounded-md bg-[#B88746] py-3 font-semibold text-white">Ứng tuyển ngay</button></div>}
  </main><Footer /><CareerApplicationForm job={job} open={open} onClose={() => setOpen(false)} rules={applicationRules} /></>;
}
function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-[#B88746]" /><div><span className="block text-xs text-[#817469]">{label}</span><strong className="font-semibold">{value}</strong></div></div>; }
