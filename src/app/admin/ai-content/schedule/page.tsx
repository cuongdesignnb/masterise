'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { Post } from '@/types/api';
import { 
  Clock, 
  Calendar, 
  Globe, 
  AlertTriangle, 
  Loader2, 
  Play, 
  Edit, 
  CheckCircle2, 
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function AiSchedulePage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const isWritable = hasRole(['super_admin', 'admin', 'marketing']);

  const [page, setPage] = useState(1);
  const perPage = 10;

  // Reschedule state
  const [reschedulingPost, setReschedulingPost] = useState<Post | null>(null);
  const [newScheduleTime, setNewScheduleTime] = useState('');

  // Fetch scheduled posts
  const { data: postsResponse, isLoading: isPostsLoading } = useQuery({
    queryKey: ['admin-scheduled-posts', page],
    queryFn: async () => {
      // Fetching from default posts endpoint filtering by status
      const response = await api.get<Post[]>(`/posts?status=scheduled&page=${page}&per_page=${perPage}`);
      return response;
    }
  });

  // Fetch AI settings (for last_scheduler_run_at status)
  const { data: settingsResponse, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-ai-schedule-settings'],
    queryFn: aiContentService.getAiSettings,
  });

  const posts = postsResponse?.data || [];
  const meta = postsResponse?.meta;
  const settings = settingsResponse?.data;

  // Check if scheduler is active (run in last 10 minutes)
  const [schedulerWarning, setSchedulerWarning] = useState(false);
  
  useEffect(() => {
    if (settings?.last_scheduler_run_at) {
      const lastRun = new Date(settings.last_scheduler_run_at);
      const diffMs = new Date().getTime() - lastRun.getTime();
      const diffMins = diffMs / (1000 * 60);
      
      // If diff is greater than 10 mins or negative (timezone discrepancy), warn
      setSchedulerWarning(diffMins > 10 || diffMins < -10);
    } else {
      // If never run, warn
      setSchedulerWarning(true);
    }
  }, [settings]);

  // Manual cron trigger mutation
  const triggerPublishDueMutation = useMutation({
    mutationFn: () => aiContentService.publishDuePosts(),
    onSuccess: (res) => {
      alert(`Đã kích hoạt quét thủ công! Kết quả: ${res.message || 'Thành công.'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-posts'] });
      refetchSettings();
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi chạy bộ quét đăng bài.');
    }
  });

  // Publish Now Mutation
  const publishMutation = useMutation({
    mutationFn: (id: number) => aiContentService.publishPostNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-posts'] });
      alert('Đã xuất bản bài viết thành công!');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xuất bản bài viết.');
    }
  });

  // Reschedule Post Mutation
  const rescheduleMutation = useMutation({
    mutationFn: (payload: { id: number; scheduled_at: string }) => 
      aiContentService.schedulePost(payload.id, { scheduled_at: payload.scheduled_at }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-posts'] });
      alert('Đã cập nhật lại lịch đăng bài viết thành công!');
      setReschedulingPost(null);
      setNewScheduleTime('');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi đổi lịch đăng bài.');
    }
  });

  // Cancel Schedule (revert to draft) Mutation
  const cancelScheduleMutation = useMutation({
    mutationFn: (post: Post) => {
      // Revert status to draft using general post update endpoint
      return api.put(`/posts/${post.id}`, {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        thumbnail: post.thumbnail,
        status: 'draft',
        post_category_id: post.post_category_id,
        // Remove scheduled date
        scheduled_at: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-posts'] });
      alert('Đã hủy lịch đăng bài. Bài viết đã được trả lại trạng thái Bản nháp.');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi hủy lịch đăng.');
    }
  });

  const handlePublishNow = (post: Post) => {
    if (confirm(`Bạn có chắc chắn muốn xuất bản bài viết "${post.title}" ngay lập tức?`)) {
      publishMutation.mutate(post.id);
    }
  };

  const handleCancelSchedule = (post: Post) => {
    if (confirm(`Bạn có chắc chắn muốn hủy lịch đăng và đưa bài viết "${post.title}" về trạng thái Bản nháp không?`)) {
      cancelScheduleMutation.mutate(post);
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingPost || !newScheduleTime) return;
    rescheduleMutation.mutate({
      id: reschedulingPost.id,
      scheduled_at: newScheduleTime
    });
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Bạn không có quyền truy cập chức năng lập lịch.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
            <Clock className="w-8 h-8 text-[#B88746]" />
            Lịch trình đăng bài viết
          </h1>
          <p className="text-sm text-[#8C7A6B]">Quản lý danh sách các bài viết đang chờ xuất bản tự động theo lịch hẹn giờ</p>
        </div>

        {/* Manual Publish Due trigger */}
        <button
          onClick={() => triggerPublishDueMutation.mutate()}
          disabled={triggerPublishDueMutation.isPending}
          className="border border-[#B88746] text-[#B88746] hover:bg-[#B88746]/10 px-5 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 text-sm shrink-0 disabled:opacity-50 self-start sm:self-center"
        >
          {triggerPublishDueMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Kích hoạt Đăng bài ngay
        </button>
      </div>

      {/* Scheduler status alert */}
      {schedulerWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Cảnh báo: Bộ lập lịch tự động (Cron Job) chưa hoạt động</h4>
            <p className="text-xs text-amber-700 mt-1">
              Hệ thống phát hiện lần quét lịch trình gần nhất đã quá 10 phút trước hoặc chưa bao giờ được chạy.
              Bài viết của bạn có thể sẽ không được tự động công khai đúng giờ nếu thiếu Cron Job trên máy chủ.
            </p>
            <div className="text-xs text-amber-700 mt-2">
              Lần cuối bộ quét hoạt động: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-[#B88746]">
                {settings?.last_scheduler_run_at || 'Chưa bao giờ hoạt động'}
              </code>
            </div>
            <p className="text-[10px] text-amber-600 mt-2">
              * Môi trường production: Đảm bảo đã khai báo cron job chạy lệnh <code>php artisan schedule:run</code> mỗi phút.
              <br />
              * Môi trường local: Bạn có thể kích hoạt bằng cách bấm nút <strong>"Kích hoạt Đăng bài ngay"</strong> phía trên để xuất bản các bài viết đã đến giờ đăng.
            </p>
          </div>
        </div>
      )}

      {/* Main Scheduled Timeline List */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-lg text-[#1F1B16] border-b border-[#FBF8F2] pb-4 mb-6">
          Trục thời gian đăng bài (Timeline)
        </h3>

        {isPostsLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
            <p className="text-xs text-[#8C7A6B]">Đang tải danh sách bài viết...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Calendar className="w-12 h-12 text-[#E8DCCB] mx-auto" />
            <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Không có bài viết nào đang xếp lịch</h3>
            <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">Tất cả các bài viết của bạn đều đã được xuất bản hoặc đang ở trạng thái bản nháp.</p>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DCCB]">
            {posts.map((post) => (
              <div key={post.id} className="relative pl-12 group">
                {/* Timeline dot */}
                <div className="absolute left-4 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-[#B88746] shadow-[0_0_0_3px_rgba(184,135,70,0.15)] group-hover:scale-110 transition-all z-10" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#FBF8F2]/40 hover:bg-[#FBF8F2]/80 border border-[#E8DCCB]/60 rounded-2xl transition-all">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-[#E8DCCB]/60 flex items-center justify-center">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B88746] bg-[#B88746]/10 px-2.5 py-0.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('vi-VN') : ''}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">
                          🏷️ {post.category?.name || 'Tin tức'}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-[#1F1B16] text-base group-hover:text-[#B88746] transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#8C7A6B]">Tác giả: {post.author?.name || 'Admin'}</p>
                    </div>
                  </div>

                  {/* Actions on scheduled posts */}
                  <div className="flex flex-wrap items-center gap-3 self-end md:self-center shrink-0">
                    <Link
                      href={`/admin/tin-tuc?edit=${post.id}`}
                      className="p-2 border border-[#E8DCCB] text-[#8C7A6B] hover:text-[#1F1B16] hover:bg-white rounded-xl transition-all"
                      title="Sửa bài viết"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setReschedulingPost(post)}
                      className="px-3 py-2 bg-white border border-[#E8DCCB] text-[#1F1B16] text-xs font-semibold rounded-xl hover:border-[#B88746] hover:text-[#B88746] transition-all"
                    >
                      Đổi giờ
                    </button>

                    <button
                      onClick={() => handlePublishNow(post)}
                      className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Đăng ngay
                    </button>

                    <button
                      onClick={() => handleCancelSchedule(post)}
                      className="px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all"
                    >
                      Hủy lịch
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-[#FBF8F2] text-xs text-[#8C7A6B] pl-12">
                <span>Hiển thị trang {meta.current_page} trên tổng số {meta.last_page} trang ({meta.total} bài chờ đăng)</span>
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

      {/* Rescheduling Modal */}
      {reschedulingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white border border-[#E8DCCB] max-w-md w-full mx-4 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#FBF8F2] pb-3">
              <h3 className="font-heading font-semibold text-lg text-[#1F1B16] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B88746]" />
                Thay đổi thời gian đăng bài
              </h3>
              <button 
                onClick={() => {
                  setReschedulingPost(null);
                  setNewScheduleTime('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider">Tiêu đề bài viết</span>
                <p className="font-semibold text-sm text-[#1F1B16] line-clamp-2">{reschedulingPost.title}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">
                  Lịch trình xuất bản cũ
                </label>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 font-semibold">
                  {reschedulingPost.scheduled_at ? new Date(reschedulingPost.scheduled_at).toLocaleString('vi-VN') : ''}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">
                  Lịch trình xuất bản mới
                </label>
                <input
                  type="datetime-local"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#FBF8F2]">
                <button
                  type="button"
                  onClick={() => {
                    setReschedulingPost(null);
                    setNewScheduleTime('');
                  }}
                  className="px-5 py-2.5 border border-[#E8DCCB] text-[#8C7A6B] rounded-xl font-semibold hover:bg-gray-50 text-xs transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={rescheduleMutation.isPending}
                  className="bg-[#B88746] hover:bg-[#1F1B16] text-white px-5 py-2.5 rounded-xl font-semibold shadow transition-all flex items-center gap-1.5 text-xs"
                >
                  {rescheduleMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật thời gian'
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
