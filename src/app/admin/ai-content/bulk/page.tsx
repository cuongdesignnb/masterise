'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { AiContentBatch, AiJob } from '@/types/aiContent';
import { useToast } from '@/components/admin/Toast';
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

function imageSizeOptions(model?: string) {
  if ((model || '').startsWith('gpt-image')) {
    return [
      { value: '1024x1024', label: 'H\u00ecnh vu\u00f4ng (1024x1024)' },
      { value: '1536x1024', label: 'Ch\u1eef nh\u1eadt ngang (1536x1024)' },
      { value: '1024x1536', label: 'Ch\u1eef nh\u1eadt \u0111\u1ee9ng (1024x1536)' },
      { value: 'auto', label: 'T\u1ef1 \u0111\u1ed9ng' },
    ];
  }

  if (model === 'dall-e-3') {
    return [
      { value: '1024x1024', label: 'H\u00ecnh vu\u00f4ng (1024x1024)' },
      { value: '1792x1024', label: 'Ch\u1eef nh\u1eadt ngang (1792x1024)' },
      { value: '1024x1792', label: 'Ch\u1eef nh\u1eadt \u0111\u1ee9ng (1024x1792)' },
    ];
  }

  return [{ value: '1024x1024', label: 'H\u00ecnh vu\u00f4ng (1024x1024)' }];
}

function imageQualityOptions(model?: string) {
  if ((model || '').startsWith('gpt-image')) {
    return [
      { value: 'low', label: 'Th\u1ea5p - ti\u1ebft ki\u1ec7m' },
      { value: 'medium', label: 'Trung b\u00ecnh - khuy\u1ebfn ngh\u1ecb' },
      { value: 'high', label: 'Cao' },
      { value: 'auto', label: 'T\u1ef1 \u0111\u1ed9ng' },
    ];
  }

  return [
    { value: 'standard', label: 'Ti\u00eau chu\u1ea9n (Standard)' },
    { value: 'hd', label: '\u0110\u1ed9 ph\u00e2n gi\u1ea3i cao (HD)' },
  ];
}

export default function AiBulkPage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const toast = useToast();
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
  const imageModel = settings?.ai_image_model || 'gpt-image-1';
  const batches = batchesResponse?.data || [];

  // Setup defaults when settings are loaded
  useEffect(() => {
    if (settings) {
      setCategoryId(settings.ai_default_category_id || '');
      setAuthorId(settings.ai_default_author_id || user?.id || '');
      setEnableImage(settings.ai_enable_image_generation);
      setImageSize(settings.ai_default_image_size || (imageModel.startsWith('gpt-image') ? '1536x1024' : '1024x1024'));
      setImageQuality(settings.ai_default_image_quality || (imageModel.startsWith('gpt-image') ? 'medium' : 'standard'));
    }
  }, [settings, user, imageModel]);

  useEffect(() => {
    const sizeOptions = imageSizeOptions(imageModel).map((option) => option.value);
    const qualityOptions = imageQualityOptions(imageModel).map((option) => option.value);

    if (imageSize && !sizeOptions.includes(imageSize)) {
      setImageSize(sizeOptions[0] || '1024x1024');
    }

    if (imageQuality && !qualityOptions.includes(imageQuality)) {
      setImageQuality(qualityOptions[0] || 'standard');
    }
  }, [imageModel, imageSize, imageQuality]);

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
      console.error('Lá»—i khi táº£i chi tiáº¿t chiáº¿n dá»‹ch:', err);
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
      toast.success('ÄÃ£ khá»Ÿi táº¡o chiáº¿n dá»‹ch viáº¿t bÃ i hÃ ng loáº¡t thÃ nh cÃ´ng! Tiáº¿n trÃ¬nh Ä‘ang Ä‘Æ°á»£c xá»­ lÃ½ ngáº§m.');
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
      toast.error(err.message || 'Lá»—i khi táº¡o chiáº¿n dá»‹ch hÃ ng loáº¡t. Vui lÃ²ng kiá»ƒm tra láº¡i quota hoáº·c API.');
    }
  });

  // Cancel Batch Mutation
  const cancelBatchMutation = useMutation({
    mutationFn: (id: number) => aiContentService.cancelBatch(id),
    onSuccess: (res, id) => {
      toast.success(res.message || 'ÄÃ£ gá»­i yÃªu cáº§u há»§y chiáº¿n dá»‹ch.');
      fetchBatchDetail(id);
      queryClient.invalidateQueries({ queryKey: ['admin-ai-batches'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lá»—i khi há»§y chiáº¿n dá»‹ch.');
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
      toast.success('ÄÃ£ lÃªn lá»‹ch Ä‘Äƒng bÃ i viáº¿t hÃ ng loáº¡t thÃ nh cÃ´ng!');
      setIsSchedulingOpen(false);
      if (selectedBatchId) fetchBatchDetail(selectedBatchId);
      queryClient.invalidateQueries({ queryKey: ['admin-ai-batches'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lá»—i khi Ä‘áº·t lá»‹ch Ä‘Äƒng bÃ i.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTitle) {
      toast.warning('Vui lÃ²ng nháº­p tÃªn chiáº¿n dá»‹ch!');
      return;
    }
    if (!keywordsText.trim()) {
      toast.warning('Vui lÃ²ng nháº­p danh sÃ¡ch tá»« khÃ³a!');
      return;
    }
    if (!categoryId) {
      toast.warning('Vui lÃ²ng chá»n chuyÃªn má»¥c máº·c Ä‘á»‹nh!');
      return;
    }
    createBatchMutation.mutate();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleStart) {
      toast.warning('Vui lÃ²ng chá»n thá»i gian báº¯t Ä‘áº§u Ä‘Äƒng!');
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
      case 'draft': return 'Báº£n nhÃ¡p';
      case 'queued': return 'Chá» cháº¡y';
      case 'processing': return 'Äang xá»­ lÃ½';
      case 'completed': return 'ÄÃ£ xong';
      case 'partially_failed': return 'Lá»—i má»™t pháº§n';
      case 'failed': return 'Tháº¥t báº¡i';
      case 'cancelled': return 'ÄÃ£ há»§y';
      default: return status;
    }
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p chá»©c nÄƒng viáº¿t bÃ i hÃ ng loáº¡t.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
          <Layers className="w-8 h-8 text-[#B88746]" />
          Quáº£n lÃ½ Chiáº¿n dá»‹ch viáº¿t bÃ i hÃ ng loáº¡t
        </h1>
        <p className="text-sm text-[#8C7A6B]">Sinh nhiá»u bÃ i viáº¿t tá»± Ä‘á»™ng theo lÃ´ tá»« danh sÃ¡ch tá»« khÃ³a vÃ  lÃªn lá»‹ch Ä‘Äƒng bÃ i hÃ ng loáº¡t</p>
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
            Quay láº¡i danh sÃ¡ch
          </button>

          {isDetailLoading || !batchDetail ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
              <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
              <p className="text-xs text-[#8C7A6B]">Äang táº£i chi tiáº¿t chiáº¿n dá»‹ch...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Progress details & Job lists */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
                  {/* Title & Status */}
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#FBF8F2] pb-4">
                    <div>
                      <span className="text-[10px] text-[#8C7A6B] uppercase font-semibold tracking-wider">Chi tiáº¿t chiáº¿n dá»‹ch</span>
                      <h3 className="text-xl font-heading font-bold text-[#1F1B16] mt-0.5">{batchDetail.batch.title}</h3>
                      <p className="text-xs text-[#8C7A6B] mt-1">
                        Khá»Ÿi táº¡o lÃºc: {new Date(batchDetail.batch.created_at || '').toLocaleString('vi-VN')}
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
                          Há»§y chiáº¿n dá»‹ch
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar widget */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-[#1F1B16]">Tiáº¿n Ä‘á»™ sinh bÃ i viáº¿t</span>
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
                        <span className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider block">Tá»•ng sá»‘ tá»« khÃ³a</span>
                        <span className="text-xl font-heading font-bold text-[#1F1B16]">{batchDetail.batch.keywords_count}</span>
                      </div>
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">ThÃ nh cÃ´ng (nhÃ¡p)</span>
                        <span className="text-xl font-heading font-bold text-emerald-800">{batchDetail.batch.generated_count}</span>
                      </div>
                      <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider block">Tháº¥t báº¡i</span>
                        <span className="text-xl font-heading font-bold text-red-800">{batchDetail.batch.failed_count}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job lists Table */}
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4">
                  <h4 className="font-heading font-semibold text-base text-[#1F1B16]">Danh sÃ¡ch chi tiáº¿t bÃ i viáº¿t (Jobs)</h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8DCCB]">
                          <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Tá»« khÃ³a / TiÃªu Ä‘á»</th>
                          <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Tráº¡ng thÃ¡i</th>
                          <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider text-right">TÃ¹y chá»n</th>
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
                                    âš ï¸ Lá»—i: {job.error_message}
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
                                  Má»Ÿ Editor
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
                  <h4 className="font-heading font-semibold text-base text-[#1F1B16] border-b border-[#FBF8F2] pb-3">ThÃ´ng sá»‘ lÃ´ bÃ i viáº¿t</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8C7A6B]">ChuyÃªn má»¥c máº·c Ä‘á»‹nh:</span>
                      <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C7A6B]">TÃ¡c giáº£ máº·c Ä‘á»‹nh:</span>
                      <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.author?.name || 'N/A'}</span>
                    </div>
                    {batchDetail.batch.schedule_mode && (
                      <>
                        <div className="border-t border-[#FBF8F2] my-2 pt-2" />
                        <div className="flex justify-between">
                          <span className="text-[#8C7A6B]">Cháº¿ Ä‘á»™ Ä‘áº·t lá»‹ch:</span>
                          <span className="font-semibold text-[#B88746] capitalize">{batchDetail.batch.schedule_mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A6B]">Báº¯t Ä‘áº§u tá»«:</span>
                          <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.schedule_start_at}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A6B]">Khoáº£ng giÃ£n cÃ¡ch:</span>
                          <span className="font-semibold text-[#1F1B16]">{batchDetail.batch.schedule_interval_minutes} phÃºt</span>
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
                        Äáº·t lá»‹ch bÃ i viáº¿t trong lÃ´
                      </span>
                      <ChevronRight className={`w-5 h-5 text-[#8C7A6B] transition-transform ${isSchedulingOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isSchedulingOpen && (
                      <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2 animate-fadeIn">
                        <p className="text-xs text-[#8C7A6B]">
                          PhÃ¢n phá»‘i lá»‹ch Ä‘Äƒng bÃ i viáº¿t cá»§a lÃ´ nÃ y tá»± Ä‘á»™ng cÃ¡ch Ä‘á»u nhau theo thá»i gian cÃ i Ä‘áº·t.
                        </p>

                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Báº¯t Ä‘áº§u tá»« thá»i Ä‘iá»ƒm</label>
                          <input
                            type="datetime-local"
                            value={scheduleStart}
                            onChange={(e) => setScheduleStart(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Khoáº£ng giÃ£n cÃ¡ch (phÃºt)</label>
                          <select
                            value={scheduleInterval}
                            onChange={(e) => setScheduleInterval(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                          >
                            <option value={30}>30 phÃºt (Nhanh)</option>
                            <option value={60}>1 tiáº¿ng</option>
                            <option value={120}>2 tiáº¿ng</option>
                            <option value={240}>4 tiáº¿ng</option>
                            <option value={720}>12 tiáº¿ng</option>
                            <option value={1440}>1 ngÃ y (24 tiáº¿ng)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Sá»‘ bÃ i Ä‘Äƒng má»—i lÆ°á»£t</label>
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
                              Äang Ä‘áº·t lá»‹ch...
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              Ãp dá»¥ng lá»‹ch Ä‘Äƒng bÃ i
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
              Táº¡o chiáº¿n dá»‹ch má»›i
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-4 px-2 font-heading font-medium text-sm transition-all border-b-2 ${
                activeTab === 'list' ? 'border-[#B88746] text-[#B88746] font-semibold' : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
              }`}
            >
              Lá»‹ch sá»­ chiáº¿n dá»‹ch hÃ ng loáº¡t
            </button>
          </div>

          {activeTab === 'create' ? (
            /* Tab: Create Campaign Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">TÃªn chiáº¿n dá»‹ch lÃ´ bÃ i viáº¿t</label>
                    <input
                      type="text"
                      value={batchTitle}
                      onChange={(e) => setBatchTitle(e.target.value)}
                      placeholder="VÃ­ dá»¥: Chiáº¿n dá»‹ch giá»›i thiá»‡u dá»± Ã¡n Masterise The Global City - ThÃ¡ng 6"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">
                      Danh sÃ¡ch tá»« khÃ³a bÃ i viáº¿t (Má»—i tá»« khÃ³a 1 dÃ²ng)
                    </label>
                    <textarea
                      value={keywordsText}
                      onChange={(e) => setKeywordsText(e.target.value)}
                      rows={8}
                      placeholder="Nháº­p danh sÃ¡ch tá»« khÃ³a viáº¿t bÃ i táº¡i Ä‘Ã¢y.&#10;VÃ­ dá»¥:&#10;Vá»‹ trÃ­ dá»± Ã¡n The Global City á»Ÿ Ä‘Ã¢u&#10;Tiá»‡n Ã­ch Masterise Homes Global City cÃ³ gÃ¬ Ä‘áº·c biá»‡t&#10;Báº£ng giÃ¡ bÃ¡n shophouse The Global City 2026"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all font-mono text-sm leading-relaxed"
                    />
                    <span className="text-[10px] text-[#8C7A6B] block mt-1">
                      Giá»›i háº¡n tá»‘i Ä‘a {settings?.ai_max_articles_per_batch || 20} tá»« khÃ³a cho má»—i lÃ´. Vui lÃ²ng nháº­p má»—i dÃ²ng tÆ°Æ¡ng á»©ng má»™t tiÃªu Ä‘á» bÃ i viáº¿t.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">ChuyÃªn má»¥c máº·c Ä‘á»‹nh</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                      >
                        <option value="">-- Chá»n chuyÃªn má»¥c --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">TÃ¡c giáº£ máº·c Ä‘á»‹nh</label>
                      {hasRole(['super_admin', 'admin']) ? (
                        <select
                          value={authorId}
                          onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                        >
                          <option value="">-- Chá»n tÃ¡c giáº£ --</option>
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
                          Äang khá»Ÿi táº¡o hÃ ng Ä‘á»£i...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Khá»Ÿi cháº¡y hÃ ng loáº¡t
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#FBF8F2] pb-4">
                    <h3 className="font-heading font-semibold text-base text-[#1F1B16]">CÃ i Ä‘áº·t áº£nh minh há»a lÃ´</h3>
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
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">KÃ­ch thÆ°á»›c áº£nh Ä‘áº¡i diá»‡n</label>
                        <select
                          value={imageSize}
                          onChange={(e) => setImageSize(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                        >                          {imageSizeOptions(imageModel).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Cháº¥t lÆ°á»£ng áº£nh</label>
                        <select
                          value={imageQuality}
                          onChange={(e) => setImageQuality(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                        >                          {imageQualityOptions(imageModel).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C7A6B]">Táº¥t cáº£ bÃ i viáº¿t trong lÃ´ sáº½ bá» qua bÆ°á»›c sinh áº£nh Ä‘á»ƒ tÄƒng tá»‘c thá»i gian táº¡o bÃ i.</p>
                  )}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    LÆ°u Ã½ vá» tiáº¿n trÃ¬nh xá»­ lÃ½ (Queue)
                  </div>
                  <p className="text-amber-700 leading-relaxed">
                    TÃ¡c vá»¥ hÃ ng loáº¡t Ä‘Æ°á»£c Ä‘Æ°a vÃ o hÃ ng Ä‘á»£i báº¥t Ä‘á»“ng bá»™ (Queue) cá»§a Laravel Ä‘á»ƒ khÃ´ng lÃ m Ä‘Æ¡ giao diá»‡n.
                  </p>
                  <p className="text-amber-700 leading-relaxed font-semibold">
                    á»ž mÃ´i trÆ°á»ng local, báº¡n cáº§n Ä‘áº£m báº£o Docker Container mh_php Ä‘ang cháº¡y queue worker báº±ng cÃ¢u lá»‡nh:
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
                  <p className="text-xs text-[#8C7A6B]">Äang táº£i danh sÃ¡ch chiáº¿n dá»‹ch...</p>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Layers className="w-12 h-12 text-[#E8DCCB] mx-auto" />
                  <h4 className="font-medium text-[#1F1B16]">ChÆ°a cÃ³ chiáº¿n dá»‹ch nÃ o Ä‘Æ°á»£c táº¡o</h4>
                  <p className="text-xs text-[#8C7A6B]">Táº¡o chiáº¿n dá»‹ch viáº¿t bÃ i hÃ ng loáº¡t Ä‘áº§u tiÃªn á»Ÿ tab bÃªn cáº¡nh.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8DCCB]">
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">TÃªn chiáº¿n dá»‹ch</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Quy mÃ´</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Tráº¡ng thÃ¡i</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider">Tiáº¿n Ä‘á»™</th>
                        <th className="py-3 px-4 font-semibold text-[#8C7A6B] text-xs uppercase tracking-wider text-right">Lá»±a chá»n</th>
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
                          <td className="py-4 px-4 text-[#8C7A6B] font-semibold">{batch.keywords_count} bÃ i viáº¿t</td>
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
                              Xem tiáº¿n Ä‘á»™
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
