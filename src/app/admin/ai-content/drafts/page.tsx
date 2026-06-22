'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { Post } from '@/types/api';
import { useToast } from '@/components/admin/Toast';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  Globe, 
  Loader2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AiDraftsPage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const isWritable = hasRole(['super_admin', 'admin', 'marketing']);

  // Filters & Page state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Selected Post for Scheduling Modal
  const [schedulingPost, setSchedulingPost] = useState<Post | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');

  // Fetch AI Drafts
  const { data: draftsResponse, isLoading: isDraftsLoading } = useQuery({
    queryKey: ['admin-ai-drafts', search, page],
    queryFn: async () => {
      const response = await aiContentService.getAiDrafts({
        q: search,
        page,
        per_page: perPage
      });
      return response;
    },
  });

  const drafts = draftsResponse?.data || [];
  const meta = draftsResponse?.meta;

  // Publish Now Mutation
  const publishMutation = useMutation({
    mutationFn: (id: number) => aiContentService.publishPostNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-drafts'] });
      toast.success('Đã xuất bản bài viết thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi xuất bản bài viết.');
    }
  });

  // Schedule Post Mutation
  const scheduleMutation = useMutation({
    mutationFn: (payload: { id: number; scheduled_at: string }) => 
      aiContentService.schedulePost(payload.id, { scheduled_at: payload.scheduled_at }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-drafts'] });
      toast.success('Đã đặt lịch đăng bài viết thành công!');
      setSchedulingPost(null);
      setScheduledAt('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi đặt lịch đăng bài.');
    }
  });

  // Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-drafts'] });
      toast.success('Đã xóa bài viết thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi xóa bài viết.');
    }
  });

  const handlePublishNow = (post: Post) => {
    if (confirm(`Bạn có chắc chắn muốn xuất bản bài viết "${post.title}" ngay lập tức không?`)) {
      publishMutation.mutate(post.id);
    }
  };

  const handleDelete = (post: Post) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(post.id);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingPost || !scheduledAt) return;
    scheduleMutation.mutate({
      id: schedulingPost.id,
      scheduled_at: scheduledAt
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // reset to page 1 on search
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Bạn không có quyền xem trang này.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#B88746]" />
            Danh sách bài viết Nháp AI
          </h1>
          <p className="text-sm text-[#8C7A6B]">Tất cả bài viết được tự động tạo bởi AI và hiện đang lưu ở trạng thái bản nháp để biên tập</p>
        </div>
        
        <Link
          href="/admin/ai-content/write"
          className="bg-[#B88746] hover:bg-[#1F1B16] text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm shrink-0 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          Viết bài mới
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#8C7A6B] absolute left-4 top-3" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm bài viết nháp theo tiêu đề..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all text-sm"
          />
        </div>
      </div>

      {/* Drafts List Table */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6">
        {isDraftsLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
            <p className="text-xs text-[#8C7A6B]">Đang tải danh sách bài viết...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <FileText className="w-12 h-12 text-[#E8DCCB] mx-auto" />
            <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Không tìm thấy bài viết nháp nào</h3>
            <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">Bạn chưa tạo bài viết nào bằng AI hoặc tất cả các bài viết nháp đã được xuất bản / xếp lịch đăng bài.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E8DCCB] text-[#8C7A6B]">
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Ảnh & Tiêu đề bài viết</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Từ khóa nguồn</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Danh mục / Tác giả</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Thời gian tạo</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((post) => (
                    <tr key={post.id} className="border-b border-[#FBF8F2] hover:bg-[#FBF8F2]/40 transition-all">
                      <td className="py-4 px-4 font-medium text-[#1F1B16]">
                        <div className="flex items-center gap-3.5 max-w-md">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-[#E8DCCB]/60 flex items-center justify-center">
                            {post.thumbnail ? (
                              <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-[#1F1B16] line-clamp-2">{post.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#8C7A6B] text-xs font-mono font-medium">
                        {post.source_keyword || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 bg-[#B88746]/10 text-[#B88746] rounded text-[10px] font-semibold uppercase block w-fit">
                            {post.category?.name || 'Tin tức'}
                          </span>
                          <span className="text-xs text-[#8C7A6B] block">
                            👤 {post.author?.name || 'Admin'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#8C7A6B] font-semibold">
                        {post.created_at ? new Date(post.created_at).toLocaleString('vi-VN') : ''}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <Link 
                            href={`/admin/tin-tuc?edit=${post.id}`}
                            className="p-2 hover:bg-[#B88746]/10 text-[#B88746] rounded-xl transition-all"
                            title="Sửa bài viết trong Editor"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => handlePublishNow(post)}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all"
                            title="Xuất bản ngay lập tức"
                          >
                            <Globe className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSchedulingPost(post)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all"
                            title="Đặt lịch đăng bài"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(post)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-[#FBF8F2] text-xs text-[#8C7A6B]">
                <span>Hiển thị trang {meta.current_page} trên tổng số {meta.last_page} trang ({meta.total} bản nháp)</span>
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

      {/* Scheduling Modal */}
      {schedulingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white border border-[#E8DCCB] max-w-md w-full mx-4 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#FBF8F2] pb-3">
              <h3 className="font-heading font-semibold text-lg text-[#1F1B16] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B88746]" />
                Lên lịch đăng bài viết
              </h3>
              <button 
                onClick={() => {
                  setSchedulingPost(null);
                  setScheduledAt('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider">Tiêu đề bài viết</span>
                <p className="font-semibold text-sm text-[#1F1B16] line-clamp-2">{schedulingPost.title}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">
                  Thời gian xuất bản bài viết
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 text-[10px] text-amber-800 p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-amber-700">Múi giờ đăng bài tính theo Việt Nam (Asia/Ho_Chi_Minh). Scheduler của hệ thống sẽ tự động quét và kích hoạt công khai bài viết đúng giờ đã hẹn.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#FBF8F2]">
                <button
                  type="button"
                  onClick={() => {
                    setSchedulingPost(null);
                    setScheduledAt('');
                  }}
                  className="px-5 py-2.5 border border-[#E8DCCB] text-[#8C7A6B] rounded-xl font-semibold hover:bg-gray-50 text-xs transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="bg-[#B88746] hover:bg-[#1F1B16] text-white px-5 py-2.5 rounded-xl font-semibold shadow transition-all flex items-center gap-1.5 text-xs"
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang xếp lịch...
                    </>
                  ) : (
                    'Xác nhận lên lịch'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
