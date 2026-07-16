'use client';

import { useState } from 'react';
import { CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import { careerService } from '@/services/careerService';
import type { CareerJob } from '@/types/career';

type ApplicationRules = { cv_required: boolean; cv_max_mb: number; cv_extensions: string[]; privacy_policy_url: string };
const defaultRules: ApplicationRules = { cv_required: true, cv_max_mb: 10, cv_extensions: ['pdf', 'doc', 'docx'], privacy_policy_url: '/chuyen-trang/chinh-sach-bao-mat' };
export default function CareerApplicationForm({ job, open, onClose, rules = defaultRules }: { job?: CareerJob | null; open: boolean; onClose: () => void; rules?: ApplicationRules }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  if (!open) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = job ? await careerService.apply(job.id, form) : await careerService.applyGeneral(form);
      setCode(response.data.application_code);
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể gửi hồ sơ. Vui lòng thử lại.'); }
    finally { setSubmitting(false); }
  }

  return <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true">
    <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-lg bg-[#FFFCF7] shadow-2xl sm:rounded-lg">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DCCB] bg-[#FFFCF7] px-5 py-4">
        <div><p className="text-xs font-semibold uppercase text-[#B88746]">Ứng tuyển</p><h2 className="text-xl font-semibold text-[#1F1B16]">{job?.title || 'Gửi hồ sơ tự do'}</h2></div>
        <button onClick={onClose} className="grid size-10 place-items-center" aria-label="Đóng"><X /></button>
      </div>
      {code ? <div className="p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto mb-4 size-12 text-emerald-600" /><h3 className="text-2xl font-semibold">Hồ sơ đã được tiếp nhận</h3><p className="mt-2 text-[#6E6258]">Mã hồ sơ của bạn: <strong>{code}</strong></p><p className="mt-1 text-sm text-[#6E6258]">Email xác nhận đang được gửi. Việc gửi email không ảnh hưởng đến hồ sơ đã lưu.</p><button onClick={onClose} className="mt-6 rounded-md bg-[#B88746] px-6 py-3 font-semibold text-white">Quay lại danh sách</button></div> :
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
        <label className="text-sm font-medium">Họ và tên *<input required name="full_name" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium">Email *<input required type="email" name="email" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium">Số điện thoại *<input required name="phone" inputMode="tel" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium">Ngày có thể bắt đầu<input type="date" name="available_from" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium">LinkedIn<input type="url" name="linkedin_url" placeholder="https://" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium">Portfolio<input type="url" name="portfolio_url" placeholder="https://" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium sm:col-span-2">Mức lương mong muốn<input name="expected_salary" className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium sm:col-span-2">Kinh nghiệm nổi bật<textarea name="experience_summary" rows={3} className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="text-sm font-medium sm:col-span-2">Thư giới thiệu / lời nhắn<textarea name="cover_letter" rows={4} className="mt-1 w-full rounded-md border border-[#DCCDB9] bg-white px-3 py-3" /></label>
        <label className="rounded-md border border-dashed border-[#B88746] bg-[#F8F2E9] p-4 text-sm sm:col-span-2"><span className="flex items-center gap-2 font-semibold"><FileUp className="size-5" /> CV ({rules.cv_extensions.map(item => item.toUpperCase()).join(', ')} - tối đa {rules.cv_max_mb} MB){rules.cv_required ? ' *' : ''}</span><input required={rules.cv_required} type="file" name="cv" accept={rules.cv_extensions.map(item => `.${item}`).join(',')} className="mt-3 block w-full text-sm" /></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <label className="flex items-start gap-3 text-sm sm:col-span-2"><input required type="checkbox" name="consent" value="1" className="mt-1" /><span>Tôi đồng ý với <a className="font-semibold text-[#9A682F] underline" href={rules.privacy_policy_url} target="_blank">chính sách bảo mật</a> và cho phép xử lý thông tin ứng tuyển.</span></label>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
        <button disabled={submitting} className="flex items-center justify-center gap-2 rounded-md bg-[#B88746] px-6 py-3 font-semibold text-white disabled:opacity-60 sm:col-span-2">{submitting && <Loader2 className="size-4 animate-spin" />} Gửi hồ sơ</button>
      </form>}
    </div>
  </div>;
}
