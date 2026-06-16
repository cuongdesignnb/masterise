'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { AiContentBatch, AiJob } from '@/types/aiContent';
import { PostCategory, User } from '@/types/api';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Loader2, 
  Trash2, 
  Play, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ExternalLink, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function AiBulkPage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const isWritable = hasRole(['super_admin', 'admin', 'marketing']);

  // UI States
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Create Form States
  const [batchTitle, setBatchTitle] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [authorId, setAuthorId] = useState<number | ''>('');
  const [enableImage, setEnableImage] = useState(true);
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageQuality, setImageQuality] = useState('standard');

  // Schedule Batch Form States
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleInterval, setScheduleInterval] = useState(120); // default 2 hours
  const [postsPerSlot, setPostsPerSlot] = useState(1);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);

  // Fetch settings defaults
  const { data: settingsResponse } = useQuery({
    queryKey: ['admin-ai-settings-defaults-bulk'],
    queryFn: aiContentService.getAiSettings,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-post-categories'],
    queryFn: async () => {
      const res = await api.get<PostCategory[]>('/post-categories');
      return res.data;
    },
  });

  // Fetch users (if admin)
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const res = await api.get<User[]>('/users?per_page=100');
      return res.data;
    },
    enabled: hasRole(['super_admin', 'admin']),
  });

  // Fetch batches list
  const { data: batchesResponse, isLoading: isBatchesLoading } = useQuery({
    queryKey: ['admin-ai-batches', activeTab],
    queryFn: async () => aiContentService.getBatches(),
    enabled: activeTab === 'list',
  });

  const settings = settingsResponse?.data;
  const batches = batchesResponse?.data || [];

  // Setup defaults when settings are loaded
  useEffect(() => {
    if (settings) {
      setCategoryId(settings.ai_default_category_id || '');
      setAuthorId(settings.ai_default_author_id || user?.id || '');
      setEnableImage(settings.ai_enable_image_generation);
      setImageSize(settings.ai_default_image_size || '1024x1024');
      setImageQuality(settings.ai_default_image_quality || 'standard');
    }
  }, [settings, user]);

  // Batch details polling state
  const [batchDetail, setBatchDetail] = useState<{ batch: AiContentBatch; jobs: AiJob[] } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Poll batch details helper
  const fetchBatchDetail = async (id: number) => {
    try {
      const res = await aiContentService.getBatchDetail(id);
      if (res.data) {
        setBatchDetail(res.data);
        
        // Stop polling if completed / failed / cancelled
        const status = res.data.batch.status;
        if (['completed', 'failed', 'cancelled', 'partially_failed'].includes(status)) {
          stopPolling();
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết chiến dịch:', err);
      stopPolling();
    }
  };

  const startPolling = (id: number) => {
    stopPolling();
    fetchBatchDetail(id);
    pollingInterval.current = setInterval(() => {
      fetchBatchDetail(id);
    }, 4000); // Poll every 4 seconds
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  useEffect(() => {
    if (selectedBatchId) {
      setIsDetailLoading(true);
      fetchBatchDetail(selectedBatchId).finally(() => {
        setIsDetailLoading(false);
      });
      // Start polling
      startPolling(selectedBatchId);
    } else {
      setBatchDetail(null);
      stopPolling();
    }
    return () => stopPolling();
  }, [selectedBatchId]);

  // Create Bulk Batch Mutation
  const createBatchMutation = useMutation({
    mutationFn: () => {
      return aiContentService.createBulkBatch({
        title: batchTitle,
        keywords: keywordsText,
        default_category_id: Number(categoryId),
        default_author_id: authorId ? Number(authorId) : null,
        enable_image_generation: enableImage,
        image_size: enableImage ? imageSize : undefined,
        image_quality: enableImage ? imageQuality : undefined,
      });
    },
    onSuccess: (res) => {
      alert('Đã khởi tạo chiến dịch viết bài hàng loạt thành công! Tiến trình đang được xử lý ngầm.');
      // Switch view to detail
      if (res.data?.id) {
        setSelectedBatchId(res.data.id);
        // Clear form
        setBatchTitle('');
        setKeywordsText('');
      } else {
        setActiveTab('list');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-ai-batches'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi tạo chiến dịch hàng loạt. Vui lòng kiểm tra lại quota hoặc API.');
    }
  });

  // Cancel Batch Mutation
  const cancelBatchMutation = useMutation({
    mutationFn: (id: number) => aiContentService.cancelBatch(id),
    onSuccess: (res, id) => {
      alert(res.message || 'Đã gửi yêu cầu hủy chiến dịch.');
      fetchBatchDetail(id);
      queryClient.invalidateQueries({ queryKey: ['admin-ai-batches'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi hủy chiến dịch.');
    }
  });

  // Schedule Batch Mutation
  const scheduleBatchMutation = useMutation({
    mutationFn: () => {
      if (!selectedBatchId) throw new Error('No batch selected');
      return aiContentService.scheduleBatch(selectedBatchId, {
        schedule_start_at: scheduleStart,
        schedule_interval_minutes: scheduleInterval,
        posts_per_slot: postsPerSlot,
      });
    },
    onSuccess: () => {
      alert('Đã lên lịch đăng bài viết hàng loạt thành công!');
      setIsSchedulingOpen(false);
      if (selectedBatchId) fetchBatchDetail(selectedBatchId);
      queryClient.invalidateQueries({ queryKey: ['admin-ai-batches'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi đặt lịch đăng bài.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTitle) {
      alert('Vui lòng nhập tên chiến dịch!');
      return;
    }
    if (!keywordsText.trim()) {
      alert('Vui lòng nhập danh sách từ khóa!');
      return;
    }
    if (!categoryId) {
      alert('Vui lòng chọn chuyên mục mặc định!');
      return;
    }
    createBatchMutation.mutate();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleStart) {
      alert('Vui lòng chọn thời gian bắt đầu đăng!');
      return;
    }
    scheduleBatchMutation.mutate();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'queued': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'partially_failed': return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'failed': return 'bg-red-50 text-red-700 border border-red-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'queued': return 'Chờ chạy';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Đã xong';
      case 'partially_failed': return 'Lỗi một phần';
      case 'failed': return 'Thất bại';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Bạn không có quyền truy cập chức năng viết bài hàng loạt.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
          <Layers className="w-8 h-8 text-[#B88746]" />
          Quản lý Chiến dịch viết bài hàng loạt
        </h1>
        <p className="text-sm text-[#8C7A6B]">Sinh nhiều bài viết tự động theo lô từ danh sách từ khóa và lên lịch đăng bài hàng loạt</p>
      </div>

      {selectedBatchId ? (
        /* ==================== BATCH DETAIL VIEW ==================== */
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedBatchId(null);
              setActiveTab('list');
            }}
            className="inline-flex items-center gap-2 text-[#B88746] hover:text-[#1F1B16] font-semibold text-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>

          {isDetailLoading || !batchDetail ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
              <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
              <p className="text-xs text-[#8C7A6B]">Đang tải chi tiết chiến dịch...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Progress details & Job lists */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
                  {/* Title & Status */}
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#FBF8F2] pb-4">
                    <div>
                      <span className="text-[10px] text-[#8C7A6B] uppercase font-semibold tracking-wider">Chi tiết chiến dịch</span>
                      <h3 className="text-xl font-heading font-bold text-[#1F1B16] mt-0.5">{batchDetail.batch.title}</h3>
                      <p className="text-xs text-[#8C7A6B] mt-1">
                        Khởi tạo lúc: {new Date(batchDetail.batch.created_at || '').toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(batchDetail.batch.status)}`}>
                        {getStatusText(batchDetail.batch.status)}
                      </span>
                      {['queued', 'processing'].includes(batchDetail.batch.status) && (
                        <button
                          onClick={() => cancelBatchMutation.mutate(batchDetail.batch.id)}
                          disabled={cancelBatchMutation.isPending}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-200 transition-all disabled:opacity-50"
                        >
                          Hủy chiến dịch
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar widget */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-[#1F1B16]">Tiến độ sinh bài viết</span>
                      <span className="font-heading font-bold text-[#B88746]">{batchDetail.batch.progress_percent}%</span>
                    </div>

                    <div className="w-full bg-[#FBF8F2] border border-[#E8DCCB] rounded-full h-3.5 overflow-hidden">
                      <div 
                        className="bg-[#B88746] h-full transition-all duration-500" 
                        style={{ width: `${batchDetail.batch.progress_percent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-[#FBF8F2] border border-[#E8DCCB]/60 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider block">Tổng số từ khóa</span>
                        <span className="text-xl font-heading font-bold text-[#1F1B16]">{batchDetail.batch.keywords_count}</span>
                      </div>
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">Thành công (nháp)</span>
                        <span className="text-xl font-heading font-bold text-emerald-800">{batchDetail.batch.generated_count}</span>
                      </div>
                      <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider block">Thất bại</span>
                        <span className="text-xl font-heading font-bold text-red-800">{batchDetail.batch.failed_count}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job lists Table */}
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4">
                  <h4 className="font-heading font-semibold text-base text-[#1F1B16]">Danh sách chi tiết bài viết (Jobs)</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8DCCB]">
                          <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Từ khóa / Tiêu đề</th>
                          <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Trạng thái</th>
                          <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider text-right">Tùy chọn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchDetail.jobs.map((job) => (
                          <tr key={job.id} className="border-b border-[#FBF8F2] hover:bg-[#FBF8F2]/40 transition-all">
                            <td className="py-3.5 px-4 font-medium text-[#1F1B16]">
                              <div>
                                {job.input_keywords}
                                {job.error_message && (
                                  <p className="text-xs text-red-600 mt-1 max-w-md break-words">
                                    ⚠️ Lỗi: {job.error_message}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                job.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                job.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                                job.status === 'failed' ? 'bg-red-50 text-red-700' :
                                job.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {job.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-amber-600 shrink-0" />}
                                {job.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                                {job.status === 'failed' && <XCircle className="w-3 h-3 text-red-600 shrink-0" />}
                                {getStatusText(job.status)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {job.status === 'completed' && job.post_id && (
                                <Link 
                                  href={`/admin/tin-tuc?edit=${job.post_id}`}
                                  className="text-[#B88746] hover:underline inline-flex items-center gap-1 font-semibold text-xs"
                                >
                                  Mở Editor
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Details parameters & Scheduling form */}
              <div className="space-y-6">
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4">
                  <h4 className="font-heading font-semibold text-base text-[#1F1B16] border-b border-[#FBF8F2] pb-3">Thông số lô bài viết</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8C7A6B]">Chuyên mục mặc định:</span>
                      <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C7A6B]">Tác giả mặc định:</span>
                      <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.author?.name || 'N/A'}</span>
                    </div>
                    {batchDetail.batch.schedule_mode && (
                      <>
                        <div className="border-t border-[#FBF8F2] my-2 pt-2" />
                        <div className="flex justify-between">
                          <span className="text-[#8C7A6B]">Chế độ đặt lịch:</span>
                          <span className="font-semibold text-[#B88746] capitalize">{batchDetail.batch.schedule_mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A6B]">Bắt đầu từ:</span>
                          <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.schedule_start_at}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A6B]">Khoảng giãn cách:</span>
                          <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.schedule_interval_minutes} phút</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Scheduling form (only if there are generated draft posts) */}
                {batchDetail.batch.generated_count > 0 && (
                  <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4">
                    <button
                      type="button"
                      onClick={() => setIsSchedulingOpen(!isSchedulingOpen)}
                      className="w-full flex justify-between items-center text-left font-heading font-semibold text-base text-[#1F1B16] border-b border-[#FBF8F2] pb-3"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#B88746]" />
                        Đặt lịch bài viết trong lô
                      </span>
                      <ChevronRight className={`w-5 h-5 text-[#8C7A6B] transition-transform ${isSchedulingOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isSchedulingOpen && (
                      <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2 animate-fadeIn">
                        <p className="text-xs text-[#8C7A6B]">
                          Phân phối lịch đăng bài viết của lô này tự động cách đều nhau theo thời gian cài đặt.
                        </p>

                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Bắt đầu từ thời điểm</label>
                          <input 
                            type="datetime-local" 
                            value={scheduleStart}
                            onChange={(e) => setScheduleStart(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Khoảng giãn cách (phút)</label>
                          <select
                            value={scheduleInterval}
                            onChange={(e) => setScheduleInterval(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                          >
                            <option value={30}>30 phút (Nhanh)</option>
                            <option value={60}>1 tiếng</option>
                            <option value={120}>2 tiếng</option>
                            <option value={240}>4 tiếng</option>
                            <option value={720}>12 tiếng</option>
                            <option value={1440}>1 ngày (24 tiếng)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Số bài đăng mỗi lượt</label>
                          <input 
                            type="number" 
                            value={postsPerSlot}
                            onChange={(e) => setPostsPerSlot(Number(e.target.value))}
                            min={1}
                            max={5}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={scheduleBatchMutation.isPending}
                          className="w-full bg-[#B88746] hover:bg-[#1F1B16] text-white py-3 rounded-xl font-semibold shadow transition-all flex justify-center items-center gap-1.5 text-sm"
                        >
                          {scheduleBatchMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang đặt lịch...
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              Áp dụng lịch đăng bài
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== FORM OR LIST SWITCHER ==================== */
        <div className="space-y-6">
          <div className="flex border-b border-[#E8DCCB] gap-4">
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-4 px-2 font-heading font-medium text-sm transition-all border-b-2 ${
                activeTab === 'create' ? 'border-[#B88746] text-[#B88746] font-semibold' : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
              }`}
            >
              Tạo chiến dịch mới
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-4 px-2 font-heading font-medium text-sm transition-all border-b-2 ${
                activeTab === 'list' ? 'border-[#B88746] text-[#B88746] font-semibold' : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
              }`}
            >
              Lịch sử chiến dịch hàng loạt
            </button>
          </div>

          {activeTab === 'create' ? (
            /* Tab: Create Campaign Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Tên chiến dịch lô bài viết</label>
                    <input 
                      type="text" 
                      value={batchTitle}
                      onChange={(e) => setBatchTitle(e.target.value)}
                      placeholder="Ví dụ: Chiến dịch giới thiệu dự án Masterise The Global City - Tháng 6"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">
                      Danh sách từ khóa bài viết (Mỗi từ khóa 1 dòng)
                    </label>
                    <textarea 
                      value={keywordsText}
                      onChange={(e) => setKeywordsText(e.target.value)}
                      rows={8}
                      placeholder="Nhập danh sách từ khóa viết bài tại đây.&#10;Ví dụ:&#10;Vị trí dự án The Global City ở đâu&#10;Tiện ích Masterise Homes Global City có gì đặc biệt&#10;Bảng giá bán shophouse The Global City 2026"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all font-mono text-sm leading-relaxed"
                    />
                    <span className="text-[10px] text-[#8C7A6B] block mt-1">
                      Giới hạn tối đa {settings?.ai_max_articles_per_batch || 20} từ khóa cho mỗi lô. Vui lòng nhập mỗi dòng tương ứng một tiêu đề bài viết.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Chuyên mục mặc định</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                      >
                        <option value="">-- Chọn chuyên mục --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Tác giả mặc định</label>
                      {hasRole(['super_admin', 'admin']) ? (
                        <select
                          value={authorId}
                          onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                        >
                          <option value="">-- Chọn tác giả --</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={user?.name || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] opacity-80 cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#FBF8F2] flex justify-end">
                    <button
                      type="submit"
                      disabled={createBatchMutation.isPending}
                      className="bg-[#B88746] hover:bg-[#1F1B16] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-base disabled:opacity-50"
                    >
                      {createBatchMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang khởi tạo hàng đợi...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Khởi chạy hàng loạt
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#FBF8F2] pb-4">
                    <h3 className="font-heading font-semibold text-base text-[#1F1B16]">Cài đặt ảnh minh họa lô</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={enableImage}
                        onChange={(e) => setEnableImage(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88746]"></div>
                    </label>
                  </div>

                  {enableImage ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Kích thước ảnh đại diện</label>
                        <select
                          value={imageSize}
                          onChange={(e) => setImageSize(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                        >
                          <option value="1024x1024">Hình vuông (1024x1024)</option>
                          <option value="1792x1024">Chữ nhật ngang (1792x1024)</option>
                          <option value="1024x1792">Chữ nhật đứng (1024x1792)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Chất lượng ảnh</label>
                        <select
                          value={imageQuality}
                          onChange={(e) => setImageQuality(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                        >
                          <option value="standard">Tiêu chuẩn (Standard)</option>
                          <option value="hd">Độ phân giải cao (HD)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C7A6B]">Tất cả bài viết trong lô sẽ bỏ qua bước sinh ảnh để tăng tốc thời gian tạo bài.</p>
                  )}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Lưu ý về tiến trình xử lý (Queue)
                  </div>
                  <p className="text-amber-700 leading-relaxed">
                    Tác vụ hàng loạt được đưa vào hàng đợi bất đồng bộ (Queue) của Laravel để không làm đơ giao diện.
                  </p>
                  <p className="text-amber-700 leading-relaxed font-semibold">
                    Ở môi trường local, bạn cần đảm bảo Docker Container mh_php đang chạy queue worker bằng câu lệnh:
                  </p>
                  <code className="block p-2 bg-black/5 text-[#E8DCCB] rounded font-mono text-[10px] break-all select-all">
                    docker exec -it mh_php php artisan queue:work --queue=default --tries=3 --timeout=180
                  </code>
                </div>
              </div>
            </div>
          ) : (
            /* Tab: History Lists batches */
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 animate-fadeIn">
              {isBatchesLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                  <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
                  <p className="text-xs text-[#8C7A6B]">Đang tải danh sách chiến dịch...</p>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Layers className="w-12 h-12 text-[#E8DCCB] mx-auto" />
                  <h4 className="font-medium text-[#1F1B16]">Chưa có chiến dịch nào được tạo</h4>
                  <p className="text-xs text-[#8C7A6B]">Tạo chiến dịch viết bài hàng loạt đầu tiên ở tab bên cạnh.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8DCCB]">
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Tên chiến dịch</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Quy mô</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Trạng thái</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Tiến độ</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider text-right">Lựa chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch) => (
                        <tr key={batch.id} className="border-b border-[#FBF8F2] hover:bg-[#FBF8F2]/40 transition-all">
                          <td className="py-4 px-4 font-medium text-[#1F1B16]">
                            <div>
                              <span className="font-semibold">{batch.title}</span>
                              <span className="block text-[10px] text-[#8C7A6B] mt-1">
                                {batch.created_at ? new Date(batch.created_at).toLocaleString('vi-VN') : ''}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#8C7A6B] font-semibold">{batch.keywords_count} bài viết</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(batch.status)}`}>
                              {getStatusText(batch.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                                <div className="bg-[#B88746] h-full" style={{ width: `${batch.progress_percent || 0}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-[#8C7A6B]">{batch.progress_percent || 0}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setSelectedBatchId(batch.id)}
                              className="text-[#B88746] hover:text-[#1F1B16] font-semibold text-xs inline-flex items-center"
                            >
                              Xem tiến độ
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
