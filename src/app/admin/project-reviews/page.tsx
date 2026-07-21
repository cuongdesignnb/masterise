'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Filter, 
  Search, 
  Plus, 
  Clock, 
  ShieldCheck, 
  MessageSquare,
  Building2,
  X
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface ReviewItem {
  id: number;
  project_id: number;
  reviewer_name: string;
  reviewer_role: string;
  rating: number;
  review_body: string;
  reviewed_at: string;
  source_type: string;
  is_verified: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  is_published: boolean;
  rejected_reason?: string;
  project?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function AdminProjectReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Review Form State
  const [projectId, setProjectId] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('Cư dân / Chủ sở hữu');
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/admin/project-reviews?per_page=50`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/admin/project-reviews/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Đã phê duyệt đánh giá thành công!');
        fetchReviews();
      } else {
        toast.error('Phê duyệt thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Nhập lý do từ chối đánh giá:', 'Nội dung chưa đạt tiêu chuẩn');
    if (reason === null) return;

    try {
      const res = await fetch(`/api/v1/admin/project-reviews/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.warning('Đã từ chối đánh giá.');
        fetchReviews();
      }
    } catch (err) {
      toast.error('Lỗi kết nối.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      const res = await fetch(`/api/v1/admin/project-reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Đã xóa đánh giá.');
        fetchReviews();
      }
    } catch (err) {
      toast.error('Không thể xóa đánh giá.');
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !reviewerName || !reviewBody) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/project-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: parseInt(projectId, 10),
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
          rating: Number(rating),
          review_body: reviewBody,
          is_verified: true,
          is_published: true,
        }),
      });

      if (res.ok) {
        toast.success('Tạo đánh giá mới thành công!');
        setShowCreateModal(false);
        setReviewerName('');
        setReviewBody('');
        fetchReviews();
      } else {
        const json = await res.json();
        toast.error(json.message || 'Tạo đánh giá thất bại.');
      }
    } catch (err) {
      toast.error('Lỗi hệ thống.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = reviews.filter(r => r.moderation_status === 'pending').length;
  const approvedCount = reviews.filter(r => r.moderation_status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.moderation_status === 'rejected').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-amber-500" />
            Quản lý Đánh giá Dự án
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kiểm duyệt đánh giá từ người dùng và quản lý các nhận xét đã xác minh thực tế.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/10 transition"
        >
          <Plus className="w-4 h-4" />
          Tạo đánh giá xác minh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{reviews.length}</div>
            <div className="text-xs text-slate-400">Tổng đánh giá</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{pendingCount}</div>
            <div className="text-xs text-slate-400">Chờ duyệt</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{approvedCount}</div>
            <div className="text-xs text-slate-400">Đã phê duyệt</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{rejectedCount}</div>
            <div className="text-xs text-slate-400">Đã từ chối</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên người đánh giá hoặc nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
            className="bg-transparent border-none outline-none text-sm text-slate-200 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Dự án & Người đánh giá</th>
                <th className="px-6 py-4">Đánh giá sao</th>
                <th className="px-6 py-4">Nội dung nhận xét</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    Đang tải dữ liệu đánh giá...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    Chưa có đánh giá nào.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {r.reviewer_name}
                        {r.is_verified && (
                          <span title="Đã xác minh">
                            <ShieldCheck className="w-4 h-4 text-amber-400 inline" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.reviewer_role}</div>
                      {r.project && (
                        <div className="text-xs text-amber-500/80 flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {r.project.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{r.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="line-clamp-2 text-slate-300">{r.review_body}</p>
                      {r.rejected_reason && (
                        <p className="text-xs text-rose-400 mt-1 italic">
                          Lý do từ chối: {r.rejected_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.moderation_status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      )}
                      {r.moderation_status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                      {r.moderation_status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Từ chối
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {r.moderation_status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded text-xs font-medium transition"
                          title="Phê duyệt"
                        >
                          Duyệt
                        </button>
                      )}
                      {r.moderation_status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded text-xs font-medium transition"
                          title="Từ chối"
                        >
                          Từ chối
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition inline-block"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Tạo Đánh giá Xác minh Mới
            </h2>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ID Dự án *</label>
                <input
                  type="number"
                  placeholder="Nhập ID dự án (VD: 1)"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tên người đánh giá *</label>
                  <input
                    type="text"
                    placeholder="VD: Anh Minh"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Danh xưng / Vai trò</label>
                  <input
                    type="text"
                    placeholder="VD: Cư dân phân khu Masteri"
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Điểm số (1 - 5 sao)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value={5}>5.0 - Xất sắc</option>
                  <option value={4}>4.0 - Rất tốt</option>
                  <option value={3}>3.0 - Khá tốt</option>
                  <option value={2}>2.0 - Trung bình</option>
                  <option value={1}>1.0 - Kém</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nội dung nhận xét *</label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung đánh giá thực tế..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo & Phát hành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
