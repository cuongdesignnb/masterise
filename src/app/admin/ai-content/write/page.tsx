'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { useToast } from '@/components/admin/Toast';
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

export default function AiWritePage() {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const toast = useToast();
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

  const settings = settingsResponse?.data;
  const imageModel = settings?.ai_image_model || 'gpt-image-1';

  // Initialize form defaults when settings load
  useEffect(() => {
    if (settings) {
      setCategoryId(settings.ai_default_category_id || '');
      setAuthorId(settings.ai_default_author_id || user?.id || '');
      setTone(settings.ai_default_tone || '');
      setArticleLength(settings.ai_default_article_length || '1200-1800 words');
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

  // Loading phase messages
  const steps = [
    'Äang phÃ¢n tÃ­ch tiÃªu Ä‘á» vÃ  tá»« khÃ³a...',
    'Äang khá»Ÿi táº¡o káº¿t ná»‘i OpenAI API...',
    'Äang láº­p dÃ n Ã½ bÃ i viáº¿t chuáº©n SEO...',
    'Äang viáº¿t ná»™i dung chi tiáº¿t tá»«ng pháº§n (QuÃ¡ trÃ¬nh nÃ y cÃ³ thá»ƒ máº¥t 15-30 giÃ¢y)...',
    'Äang tá»‘i Æ°u hÃ³a tháº» heading H2/H3 vÃ  cáº¥u trÃºc bÃ i viáº¿t...',
    'Äang táº¡o prompt sinh áº£nh Ä‘áº¡i diá»‡n phÃ¹ há»£p...',
    'Äang cháº¡y OpenAI Image API sinh áº£nh minh há»a...',
    'Äang táº£i áº£nh, giáº£i mÃ£ base64 vÃ  lÆ°u trá»¯ cá»¥c bá»™...',
    'Äang lÃ m sáº¡ch vÃ  lá»c tháº» HTML Ä‘á»™c háº¡i...',
    'HoÃ n táº¥t! Äang chuyá»ƒn hÆ°á»›ng sang TrÃ¬nh biÃªn táº­p tin tá»©c...'
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
          setErrorMessage('TÃ¡c vá»¥ hoÃ n thÃ nh nhÆ°ng khÃ´ng nháº­n Ä‘Æ°á»£c ID bÃ i viáº¿t.');
          setGenStep(0);
        }
      }, 1500);
    },
    onError: (err: any) => {
      console.error(err);
      setErrorMessage(err.message || err.details || 'ÄÃ£ xáº£y ra lá»—i trong quÃ¡ trÃ¬nh xá»­ lÃ½ cá»§a AI. Vui lÃ²ng kiá»ƒm tra láº¡i cáº¥u hÃ¬nh hoáº·c API key.');
      setGenStep(0);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.warning('Vui lÃ²ng nháº­p tiÃªu Ä‘á» hoáº·c tá»« khÃ³a bÃ i viáº¿t!');
      return;
    }
    if (!categoryId) {
      toast.warning('Vui lÃ²ng chá»n chuyÃªn má»¥c bÃ i viáº¿t!');
      return;
    }
    generateMutation.mutate();
  };

  if (!isWritable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p chá»©c nÄƒng nÃ y.
      </div>
    );
  }

  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-[#B88746] animate-spin" />
        <p className="text-sm text-[#8C7A6B]">Äang táº£i cáº¥u hÃ¬nh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#B88746]" />
          Viáº¿t bÃ i báº±ng AI
        </h1>
        <p className="text-sm text-[#8C7A6B]">Sinh má»™t bÃ i viáº¿t nhÃ¡p duy nháº¥t tá»©c thÃ¬ dá»±a trÃªn tiÃªu Ä‘á» hoáº·c tá»« khÃ³a</p>
      </div>

      {/* Main Form & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">TiÃªu Ä‘á» bÃ i viáº¿t hoáº·c tá»« khÃ³a</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VÃ­ dá»¥: Xu hÆ°á»›ng báº¥t Ä‘á»™ng sáº£n cÄƒn há»™ háº¡ng sang táº¡i TP.HCM nÄƒm 2026"
                className="w-full px-4 py-4 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] text-lg transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-[#B88746]" />
                  ChuyÃªn má»¥c bÃ i viáº¿t
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                  required
                >
                  <option value="">-- Chá»n chuyÃªn má»¥c --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-[#B88746]" />
                  TÃ¡c giáº£ bÃ i viáº¿t
                </label>
                {hasRole(['super_admin', 'admin']) ? (
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
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
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] opacity-80"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-[#B88746]" />
                  Giá»ng Ä‘iá»‡u vÄƒn phong
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="VÃ­ dá»¥: Sang trá»ng, chuáº©n SEO báº¥t Ä‘á»™ng sáº£n"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Äá»™ dÃ i bÃ i viáº¿t</label>
                <select
                  value={articleLength}
                  onChange={(e) => setArticleLength(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                >
                  <option value="600-800 words">Ngáº¯n (600 - 800 tá»«)</option>
                  <option value="800-1200 words">Vá»«a (800 - 1200 tá»«)</option>
                  <option value="1200-1800 words">DÃ i chuáº©n SEO (1200 - 1800 tá»«)</option>
                  <option value="1800-2500 words">ChuyÃªn sÃ¢u (1800 - 2500 tá»«)</option>
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
                Sinh bÃ i viáº¿t báº±ng AI
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
                <h3 className="font-heading font-semibold text-base text-[#1F1B16]">áº¢nh minh há»a AI</h3>
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
                  <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">KÃ­ch thÆ°á»›c áº£nh</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16]"
                  >                    {imageSizeOptions(imageModel).map((option) => (
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
                  >                    {imageQualityOptions(imageModel).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8C7A6B]">ÄÃ£ táº¯t tÃ­nh nÄƒng tá»± Ä‘á»™ng sinh áº£nh. BÃ i viáº¿t Ä‘Æ°á»£c táº¡o ra sáº½ khÃ´ng cÃ³ áº£nh Ä‘áº¡i diá»‡n máº·c Ä‘á»‹nh.</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              LÆ°u Ã½ chi phÃ­ API
            </div>
            <p className="text-amber-700">Sinh bÃ i viáº¿t & áº£nh báº±ng cÃ¡c model OpenAI cÃ³ phÃ¡t sinh chi phÃ­ trá»±c tiáº¿p trÃªn API Key cá»§a báº¡n. Vui lÃ²ng theo dÃµi lá»‹ch sá»­ vÃ  cáº¥u hÃ¬nh giá»›i háº¡n trong pháº§n Cáº¥u hÃ¬nh AI.</p>
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
              <h3 className="font-heading font-semibold text-xl text-white">AI Äang Táº¡o BÃ i Viáº¿t</h3>
              <p className="text-xs text-[#8C7A6B]">Vui lÃ²ng giá»¯ nguyÃªn trÃ¬nh duyá»‡t. QuÃ¡ trÃ¬nh nÃ y diá»…n ra hoÃ n toÃ n tá»± Ä‘á»™ng.</p>
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
            <h4 className="font-semibold text-sm">Lá»—i sinh bÃ i viáº¿t</h4>
            <p className="text-xs text-red-700">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-red-800 underline hover:text-red-950 mt-1 block"
            >
              ÄÃ³ng thÃ´ng bÃ¡o
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
