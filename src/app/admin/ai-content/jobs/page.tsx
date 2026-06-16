'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiContentService } from '@/services/aiContentService';
import { AiJob } from '@/types/aiContent';
import { 
  History, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AiJobsHistoryPage() {
  const { hasRole } = useAuth();
  const isWritable = hasRole(['super_admin', 'admin', 'marketing']);

  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 15;

  // Fetch jobs history
  const { data: jobsResponse, isLoading: isJobsLoading } = useQuery({
    queryKey: ['admin-ai-jobs-history', statusFilter, page],
    queryFn: async () => {
      const response = await aiContentService.getAiJobs({
        status: statusFilter,
        page,
        per_page: perPage
      });
      return response;
    }
  });

  const jobs = jobsResponse?.data || [];
  const meta = jobsResponse?.meta;

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'single_article': return 'Bài viết đơn';
      case 'article_with_image': return 'Bài viết + Ảnh';
      case 'bulk_item': return 'Bài hàng loạt';
      case 'regenerate_image': return 'Sinh lại ảnh';
      default: return type;
    }
  };

  const getJobTypeClass = (type: string) => {
    switch (type) {
      case 'single_article': return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'article_with_image': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'bulk_item': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'regenerate_image': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'queued': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'failed': return 'bg-red-50 text-red-700 border border-red-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'queued': return 'Hàng đợi';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Thành công';
      case 'failed': return 'Thất bại';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatCost = (cost: number | null | undefined) => {
    if (cost === null || cost === undefined) return '—';
    // Format to 6 decimals to display micro costs properly
    return `$${cost.toFixed(6)}`;
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Bạn không có quyền truy cập trang lịch sử tác vụ.
      </div>
    );
  }

  // Calculate totals if we have some data
  const totalCost = jobs.reduce((sum, job) => sum + (job.estimated_cost || 0), 0);
  const totalTokens = jobs.reduce((sum, job) => sum + (job.tokens_input || 0) + (job.tokens_output || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
          <History className="w-8 h-8 text-[#B88746]" />
          Lịch sử tác vụ AI (AI Jobs Log)
        </h1>
        <p className="text-sm text-[#8C7A6B]">Xem nhật ký chạy tác vụ sinh bài viết, sinh ảnh, chi phí API và tài nguyên sử dụng</p>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider block">Tổng số tác vụ hiển thị</span>
            <h4 className="text-2xl font-heading font-bold text-[#1F1B16] mt-0.5">{meta?.total || jobs.length}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider block">Tổng lượng Token sử dụng (Trang này)</span>
            <h4 className="text-2xl font-heading font-bold text-[#1F1B16] mt-0.5">{totalTokens.toLocaleString('vi-VN')}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider block">Ước tính Chi phí API (Trang này)</span>
            <h4 className="text-2xl font-heading font-bold text-[#1F1B16] mt-0.5">{formatCost(totalCost)}</h4>
          </div>
        </div>
      </div>

      {/* Filter and Content Card */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#FBF8F2] pb-4">
          <h3 className="font-heading font-semibold text-base text-[#1F1B16]">Danh sách Nhật ký tác vụ</h3>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8C7A6B]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // reset page
              }}
              className="px-4 py-2 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] text-xs font-semibold focus:outline-none focus:border-[#B88746]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="processing">Đang chạy (Processing)</option>
              <option value="completed">Thành công (Completed)</option>
              <option value="failed">Thất bại (Failed)</option>
              <option value="cancelled">Đã hủy (Cancelled)</option>
            </select>
          </div>
        </div>

        {isJobsLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
            <p className="text-xs text-[#8C7A6B]">Đang tải nhật ký tác vụ...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <History className="w-12 h-12 text-[#E8DCCB] mx-auto" />
            <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Không tìm thấy nhật ký tác vụ nào</h3>
            <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">Chưa có hoạt động AI nào khớp với bộ lọc tìm kiếm hiện tại.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E8DCCB] text-[#8C7A6B]">
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Loại tác vụ</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Từ khóa / Chi tiết</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-right">Tokens (In / Out)</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-right">Chi phí</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Người chạy</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-[#FBF8F2] hover:bg-[#FBF8F2]/40 transition-all text-xs">
                      <td className="py-3.5 px-4 font-semibold text-gray-500">#{job.id}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getJobTypeClass(job.type)}`}>
                          {getJobTypeLabel(job.type)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-[#1F1B16] truncate" title={job.input_keywords}>
                          {job.input_keywords}
                        </div>
                        {job.error_message && (
                          <div className="text-[10px] text-red-600 mt-1 max-w-[200px] break-words line-clamp-2" title={job.error_message}>
                            ⚠️ Lỗi: {job.error_message}
                          </div>
                        )}
                        <span className="block text-[9px] text-[#8C7A6B] mt-1">
                          Chạy: {job.created_at ? new Date(job.created_at).toLocaleString('vi-VN') : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(job.status)}`}>
                          {job.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-amber-600 shrink-0" />}
                          {job.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                          {job.status === 'failed' && <XCircle className="w-3 h-3 text-red-600 shrink-0" />}
                          {getStatusText(job.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#8C7A6B]">
                        {job.tokens_input !== null && job.tokens_output !== null ? (
                          <>
                            <span className="text-gray-400">{job.tokens_input}</span>
                            {' / '}
                            <span className="text-[#B88746] font-semibold">{job.tokens_output}</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#1F1B16]">
                        {formatCost(job.estimated_cost)}
                      </td>
                      <td className="py-3.5 px-4 text-[#8C7A6B] font-semibold">{job.created_by_name || 'System'}</td>
                      <td className="py-3.5 px-4">
                        {job.status === 'completed' && job.post_id && (
                          <Link 
                            href={`/admin/tin-tuc?edit=${job.post_id}`}
                            className="text-[#B88746] hover:underline inline-flex items-center gap-0.5 font-semibold"
                          >
                            Mở bài viết
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-[#FBF8F2] text-xs text-[#8C7A6B]">
                <span>Hiển thị trang {meta.current_page} trên tổng số {meta.last_page} trang ({meta.total} tác vụ)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="p-2 border border-[#E8DCCB] rounded-lg disabled:opacity-40 transition-all hover:bg-[#FBF8F2]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(meta.last_page, prev + 1))}
                    disabled={page === meta.last_page}
                    className="p-2 border border-[#E8DCCB] rounded-lg disabled:opacity-40 transition-all hover:bg-[#FBF8F2]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
