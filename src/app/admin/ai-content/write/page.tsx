'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { PostCategory, User } from '@/types/api';
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Settings, 
  PenTool, 
  Image as ImageIcon, 
  User as UserIcon, 
  FolderOpen, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function AiWritePage() {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const isWritable = hasRole(['super_admin', 'admin', 'marketing']);

  // Local Form States
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [authorId, setAuthorId] = useState<number | ''>('');
  const [tone, setTone] = useState('');
  const [articleLength, setArticleLength] = useState('');
  const [enableImage, setEnableImage] = useState(true);
  const [imageSize, setImageSize] = useState('');
  const [imageQuality, setImageQuality] = useState('');

  // Generation status UI
  const [genStep, setGenStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch settings for defaults
  const { data: settingsResponse, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['admin-ai-settings-defaults'],
    queryFn: aiContentService.getAiSettings,
  });

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ['admin-post-categories'],
    queryFn: async () => api.get<PostCategory[]>('/post-categories'),
  });

  // Fetch users (if admin)
  const { data: usersResponse } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => api.get<{ data: User[] }>('/users?per_page=100'),
    enabled: hasRole(['super_admin', 'admin']),
  });

  const settings = settingsResponse?.data;
  const categories = categoriesResponse?.data || [];
  const users = usersResponse?.data?.data || [];

  // Initialize form defaults when settings load
  useEffect(() => {
    if (settings) {
      setCategoryId(settings.ai_default_category_id || '');
      setAuthorId(settings.ai_default_author_id || user?.id || '');
      setTone(settings.ai_default_tone || '');
      setArticleLength(settings.ai_default_article_length || '1200-1800 words');
      setEnableImage(settings.ai_enable_image_generation);
      setImageSize(settings.ai_default_image_size || '1024x1024');
      setImageQuality(settings.ai_default_image_quality || 'standard');
    }
  }, [settings, user]);

  // Loading phase messages
  const steps = [
    'Đang phân tích tiêu đề và từ khóa...',
    'Đang khởi tạo kết nối OpenAI API...',
    'Đang lập dàn ý bài viết chuẩn SEO...',
    'Đang viết nội dung chi tiết từng phần (Quá trình này có thể mất 15-30 giây)...',
    'Đang tối ưu hóa thẻ heading H2/H3 và cấu trúc bài viết...',
    'Đang tạo prompt sinh ảnh đại diện phù hợp...',
    'Đang chạy OpenAI Image API sinh ảnh minh họa...',
    'Đang tải ảnh, giải mã base64 và lưu trữ cục bộ...',
    'Đang làm sạch và lọc thẻ HTML độc hại...',
    'Hoàn tất! Đang chuyển hướng sang Trình biên tập tin tức...'
  ];

  // Simulated stepper when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (genStep > 0 && genStep < steps.length - 1) {
      const duration = genStep === 3 ? 12000 : genStep === 6 ? 10000 : 2500;
      interval = setTimeout(() => {
        setGenStep(prev => prev + 1);
      }, duration);
    }
    return () => clearTimeout(interval);
  }, [genStep]);

  // Submit single generation mutation
  const generateMutation = useMutation({
    mutationFn: () => {
      setErrorMessage(null);
      setGenStep(1);
      return aiContentService.generateArticle({
        title,
        post_category_id: Number(categoryId),
        author_id: authorId ? Number(authorId) : null,
        tone: tone || undefined,
        article_length: articleLength || undefined,
        enable_image_generation: enableImage,
        image_size: enableImage ? imageSize : undefined,
        image_quality: enableImage ? imageQuality : undefined,
      });
    },
    onSuccess: (res) => {
      setGenStep(steps.length - 1);
      setTimeout(() => {
        if (res.data?.id) {
          router.push(`/admin/tin-tuc?edit=${res.data.id}`);
        } else {
          setErrorMessage('Tác vụ hoàn thành nhưng không nhận được ID bài viết.');
          setGenStep(0);
        }
      }, 1500);
    },
    onError: (err: any) => {
      console.error(err);
      setErrorMessage(err.message || err.details || 'Đã xảy ra lỗi trong quá trình xử lý của AI. Vui lòng kiểm tra lại cấu hình hoặc API key.');
      setGenStep(0);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Vui lòng nhập tiêu đề hoặc từ khóa bài viết!');
      return;
    }
    if (!categoryId) {
      alert('Vui lòng chọn chuyên mục bài viết!');
      return;
    }
    generateMutation.mutate();
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Bạn không có quyền truy cập chức năng này.
      </div>
    );
  }

  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-[#B88746] animate-spin" />
        <p className="text-sm text-[#8C7A6B]">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#B88746]" />
          Viết bài bằng AI
        </h1>
        <p className="text-sm text-[#8C7A6B]">Sinh một bài viết nháp duy nhất tức thì dựa trên tiêu đề hoặc từ khóa</p>
      </div>

      {/* Main Form & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Tiêu đề bài viết hoặc từ khóa</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Xu hướng bất động sản căn hộ hạng sang tại TP.HCM năm 2026"
                className="w-full px-4 py-4 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] text-lg transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-[#B88746]" />
                  Chuyên mục bài viết
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                  required
                >
                  <option value="">-- Chọn chuyên mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-[#B88746]" />
                  Tác giả bài viết
                </label>
                {hasRole(['super_admin', 'admin']) ? (
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
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
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] opacity-80"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-[#B88746]" />
                  Giọng điệu văn phong
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Ví dụ: Sang trọng, chuẩn SEO bất động sản"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Độ dài bài viết</label>
                <select
                  value={articleLength}
                  onChange={(e) => setArticleLength(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                >
                  <option value="600-800 words">Ngắn (600 - 800 từ)</option>
                  <option value="800-1200 words">Vừa (800 - 1200 từ)</option>
                  <option value="1200-1800 words">Dài chuẩn SEO (1200 - 1800 từ)</option>
                  <option value="1800-2500 words">Chuyên sâu (1800 - 2500 từ)</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#FBF8F2] flex justify-end">
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="bg-[#B88746] hover:bg-[#1F1B16] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-base disabled:opacity-50"
              >
                Sinh bài viết bằng AI
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar Options: Image Gen settings */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#FBF8F2] pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#B88746]" />
                <h3 className="font-heading font-semibold text-base text-[#1F1B16]">Ảnh minh họa AI</h3>
              </div>
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
                  <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Kích thước ảnh</label>
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
              <p className="text-xs text-[#8C7A6B]">Đã tắt tính năng tự động sinh ảnh. Bài viết được tạo ra sẽ không có ảnh đại diện mặc định.</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Lưu ý chi phí API
            </div>
            <p className="text-amber-700">Sinh bài viết & ảnh bằng các model OpenAI có phát sinh chi phí trực tiếp trên API Key của bạn. Vui lòng theo dõi lịch sử và cấu hình giới hạn trong phần Cấu hình AI.</p>
          </div>
        </div>
      </div>

      {/* Generation Overlay Dialog */}
      {genStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md">
          <div className="bg-[#1F1B16] text-[#E8DCCB] border border-[#B88746]/30 max-w-lg w-full mx-4 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#B88746]/10 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#B88746] animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#B88746] animate-bounce" />
            </div>

            <div className="space-y-2 w-full">
              <h3 className="font-heading font-semibold text-xl text-white">AI Đang Tạo Bài Viết</h3>
              <p className="text-xs text-[#8C7A6B]">Vui lòng giữ nguyên trình duyệt. Quá trình này diễn ra hoàn toàn tự động.</p>
            </div>

            {/* Step Indicators */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2.5 max-h-[160px] overflow-y-auto">
              {steps.map((stepMsg, idx) => {
                const isDone = idx < genStep;
                const isCurrent = idx === genStep;
                
                return (
                  <div key={idx} className={`flex items-center gap-2.5 text-xs transition-colors ${
                    isDone ? 'text-emerald-400 font-medium' :
                    isCurrent ? 'text-white font-semibold' :
                    'text-[#E8DCCB]/40'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#B88746] animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#E8DCCB]/20 shrink-0" />
                    )}
                    <span className="truncate">{stepMsg}</span>
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div 
                className="bg-[#B88746] h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${((genStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 mt-6">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Lỗi sinh bài viết</h4>
            <p className="text-xs text-red-700">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-red-800 underline hover:text-red-950 mt-1 block"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
