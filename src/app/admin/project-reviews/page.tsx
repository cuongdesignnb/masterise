'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, MessageSquare, Plus, Search, ShieldCheck, Star, Trash2, X, XCircle } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { formatApiError } from '@/lib/api';
import { projectService } from '@/services/projectService';
import { projectReviewAdminService } from '@/services/projectReviewAdminService';
import type { ProjectOption } from '@/types/api';
import type { AdminProjectReview } from '@/types/project-review';

type StatusFilter = 'all' | AdminProjectReview['moderation_status'];

export default function AdminProjectReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<AdminProjectReview[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [projectId, setProjectId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [rejecting, setRejecting] = useState<AdminProjectReview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectReviewAdminService.list({
        status: status === 'all' ? undefined : status,
        projectId: projectId ? Number(projectId) : undefined,
        search: search.trim() || undefined,
      });
      setReviews(response.data || []);
    } catch (error: unknown) {
      toast.error(formatApiError(error, 'Không thể tải danh sách đánh giá.'));
    } finally {
      setLoading(false);
    }
  }, [projectId, search, status, toast]);

  useEffect(() => { projectService.getProjectOptions().then(setProjects).catch(() => setProjects([])); }, []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    pending: reviews.filter((item) => item.moderation_status === 'pending').length,
    approved: reviews.filter((item) => item.moderation_status === 'approved').length,
    rejected: reviews.filter((item) => item.moderation_status === 'rejected').length,
  }), [reviews]);

  const approve = async (id: number) => {
    try { await projectReviewAdminService.approve(id); toast.success('Đã phê duyệt đánh giá.'); void load(); }
    catch (error: unknown) { toast.error(formatApiError(error)); }
  };
  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try { await projectReviewAdminService.delete(id); toast.success('Đã xóa đánh giá.'); void load(); }
    catch (error: unknown) { toast.error(formatApiError(error)); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 border-b border-[#E8DCCB] pb-5 sm:flex-row sm:items-end">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[#B88746]">Kiểm duyệt nội dung</p><h1 className="mt-1 text-2xl font-bold">Đánh giá dự án</h1><p className="mt-1 text-sm text-[#76695D]">Quản lý nguồn, trạng thái công khai và dấu vết phê duyệt.</p></div>
      <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B88746] px-4 py-2.5 text-sm font-bold text-white"><Plus className="size-4" /> Tạo đánh giá</button>
    </header>

    <div className="grid gap-3 sm:grid-cols-3">
      <Stat icon={Clock} label="Chờ duyệt" value={counts.pending} />
      <Stat icon={CheckCircle2} label="Đã duyệt" value={counts.approved} />
      <Stat icon={XCircle} label="Từ chối" value={counts.rejected} />
    </div>

    <div className="grid gap-3 rounded-2xl border border-[#E8DCCB] bg-white p-4 md:grid-cols-[1fr_220px_220px]">
      <label className="relative"><Search className="absolute left-3 top-3 size-4 text-[#8C7A6B]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên người đánh giá, nội dung hoặc dự án..." className="h-10 w-full rounded-xl border border-[#E8DCCB] pl-9 pr-3 text-sm" /></label>
      <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-10 rounded-xl border border-[#E8DCCB] px-3 text-sm"><option value="">Tất cả dự án</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="h-10 rounded-xl border border-[#E8DCCB] px-3 text-sm"><option value="all">Tất cả trạng thái</option><option value="pending">Chờ duyệt</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option></select>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-[#E8DCCB] bg-white">
      <table className="w-full min-w-[1040px] text-left text-sm"><thead className="bg-[#F7F1E8] text-xs uppercase text-[#76695D]"><tr><th className="p-4">Dự án / Người gửi</th><th>Nguồn</th><th>Đánh giá</th><th>Nội dung</th><th>Kiểm duyệt</th><th className="pr-4 text-right">Thao tác</th></tr></thead>
        <tbody className="divide-y divide-[#EFE5D7]">{loading ? <tr><td colSpan={6} className="p-10 text-center">Đang tải...</td></tr> : reviews.length === 0 ? <tr><td colSpan={6} className="p-10 text-center text-[#8C7A6B]">Chưa có dữ liệu.</td></tr> : reviews.map((review) => <tr key={review.id}>
          <td className="p-4"><strong className="block">{review.reviewer_name}</strong><span className="text-xs text-[#8C7A6B]">{review.reviewer_role || 'Không ghi vai trò'}</span><span className="mt-1 block text-xs font-semibold text-[#9A682F]">{review.project?.name || `Dự án #${review.project_id}`}</span></td>
          <td><span className="block">{review.source_type}</span>{review.is_verified && <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700"><ShieldCheck className="size-3.5" /> Đã xác minh</span>}</td>
          <td><span className="inline-flex items-center gap-1 font-bold text-[#9A682F]"><Star className="size-4 fill-current" /> {review.rating.toFixed(1)}</span><span className="mt-1 block text-xs text-[#8C7A6B]">{review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString('vi-VN') : '-'}</span></td>
          <td className="max-w-sm"><p className="line-clamp-3">{review.review_body}</p>{review.rejected_reason && <p className="mt-1 text-xs text-red-600">Lý do: {review.rejected_reason}</p>}</td>
          <td><StatusBadge review={review} /></td>
          <td className="pr-4 text-right">{review.moderation_status !== 'approved' && <button onClick={() => void approve(review.id)} className="px-2 py-1 font-bold text-emerald-700">Duyệt</button>}{review.moderation_status !== 'rejected' && <button onClick={() => setRejecting(review)} className="px-2 py-1 font-bold text-red-600">Từ chối</button>}<button onClick={() => void remove(review.id)} className="p-2 text-red-600" title="Xóa"><Trash2 className="size-4" /></button></td>
        </tr>)}</tbody>
      </table>
    </div>
    {showCreate && <CreateModal projects={projects} close={() => setShowCreate(false)} saved={() => { setShowCreate(false); void load(); }} />}
    {rejecting && <RejectModal review={rejecting} close={() => setRejecting(null)} saved={() => { setRejecting(null); void load(); }} />}
  </div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: number }) { return <div className="flex items-center gap-3 rounded-2xl border border-[#E8DCCB] bg-white p-4"><Icon className="size-5 text-[#B88746]" /><div><strong className="text-xl">{value}</strong><p className="text-xs text-[#8C7A6B]">{label}</p></div></div>; }
function StatusBadge({ review }: { review: AdminProjectReview }) { const value = review.moderation_status === 'approved' ? 'Đã duyệt' : review.moderation_status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'; return <div><span className="rounded-full bg-[#F1ECE5] px-2 py-1 text-xs font-semibold">{value}</span><p className="mt-2 text-xs text-[#8C7A6B]">{review.is_published ? 'Đang công khai' : 'Đang ẩn'}</p>{review.approved_at && <p className="text-xs text-[#8C7A6B]">Duyệt: {new Date(review.approved_at).toLocaleString('vi-VN')}</p>}</div>; }

function CreateModal({ projects, close, saved }: { projects: ProjectOption[]; close: () => void; saved: () => void }) {
  const toast = useToast();
  const [projectSearch, setProjectSearch] = useState('');
  const [form, setForm] = useState({ project_id: '', reviewer_name: '', reviewer_role: '', rating: 5, review_body: '', source_type: 'admin', is_verified: true, is_published: true });
  const filtered = projects.filter((project) => project.name.toLowerCase().includes(projectSearch.toLowerCase()));
  const submit = async (event: React.FormEvent) => { event.preventDefault(); try { await projectReviewAdminService.create({ ...form, project_id: Number(form.project_id) }); toast.success('Đã tạo đánh giá.'); saved(); } catch (error: unknown) { toast.error(formatApiError(error)); } };
  return <Modal title="Tạo đánh giá đã xác minh" close={close}><form onSubmit={submit} className="space-y-3"><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Tìm dự án..." className="w-full rounded-xl border p-3 text-sm" /><select required value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })} className="w-full rounded-xl border p-3 text-sm"><option value="">Chọn dự án</option>{filtered.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><input required value={form.reviewer_name} onChange={(event) => setForm({ ...form, reviewer_name: event.target.value })} placeholder="Tên công khai" className="w-full rounded-xl border p-3 text-sm" /><input value={form.reviewer_role} onChange={(event) => setForm({ ...form, reviewer_role: event.target.value })} placeholder="Vai trò" className="w-full rounded-xl border p-3 text-sm" /><select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} className="w-full rounded-xl border p-3 text-sm"><option value={5}>5 - Xuất sắc</option><option value={4}>4 - Rất tốt</option><option value={3}>3 - Khá tốt</option><option value={2}>2 - Trung bình</option><option value={1}>1 - Kém</option></select><textarea required minLength={5} value={form.review_body} onChange={(event) => setForm({ ...form, review_body: event.target.value })} rows={5} placeholder="Nội dung đánh giá" className="w-full rounded-xl border p-3 text-sm" /><button className="w-full rounded-xl bg-[#B88746] p-3 font-bold text-white">Tạo và phát hành</button></form></Modal>;
}

function RejectModal({ review, close, saved }: { review: AdminProjectReview; close: () => void; saved: () => void }) { const toast = useToast(); const [reason, setReason] = useState(''); const submit = async (event: React.FormEvent) => { event.preventDefault(); try { await projectReviewAdminService.reject(review.id, reason.trim()); toast.success('Đã từ chối đánh giá.'); saved(); } catch (error: unknown) { toast.error(formatApiError(error)); } }; return <Modal title={`Từ chối đánh giá của ${review.reviewer_name}`} close={close}><form onSubmit={submit} className="space-y-3"><textarea autoFocus required minLength={3} value={reason} onChange={(event) => setReason(event.target.value)} rows={5} placeholder="Nhập lý do từ chối..." className="w-full rounded-xl border p-3 text-sm" /><button className="w-full rounded-xl bg-red-600 p-3 font-bold text-white">Xác nhận từ chối</button></form></Modal>; }
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={close} title="Đóng"><X className="size-5" /></button></div>{children}</div></div>; }
