'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { aiContentService } from '@/services/aiContentService';
import { AiSettingsPublic } from '@/types/aiContent';
import { useToast } from '@/components/admin/Toast';
import { PostCategory, User } from '@/types/api';
import {
  Wrench,
  Key,
  Cpu,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Save,
  Globe,
  User as UserIcon,
  Folder
} from 'lucide-react';

const TEXT_MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini - \u1ed5n \u0111\u1ecbnh, ti\u1ebft ki\u1ec7m' },
  { value: 'gpt-4o', label: 'gpt-4o - ch\u1ea5t l\u01b0\u1ee3ng cao' },
  { value: 'gpt-5-mini', label: 'gpt-5-mini - model m\u1edbi' },
  { value: 'gpt-5', label: 'gpt-5 - ch\u1ea5t l\u01b0\u1ee3ng cao' },
];

const IMAGE_MODEL_OPTIONS = [
  { value: 'gpt-image-1', label: 'gpt-image-1 - khuy\u1ebfn ngh\u1ecb' },
  { value: 'dall-e-3', label: 'dall-e-3 - legacy' },
  { value: 'dall-e-2', label: 'dall-e-2 - c\u0169, ch\u1ec9 n\u00ean d\u00f9ng 1024x1024' },
];

function normalizeImageOptionsForModel(model: string, current: Partial<AiSettingsPublic>): Partial<AiSettingsPublic> {
  if (model.startsWith('gpt-image')) {
    const size = current.ai_default_image_size;
    const quality = current.ai_default_image_quality;
    return {
      ...current,
      ai_image_model: model,
      ai_default_image_size: size && ['1024x1024', '1536x1024', '1024x1536', 'auto'].includes(size) ? size : '1536x1024',
      ai_default_image_quality: quality && ['low', 'medium', 'high', 'auto'].includes(quality) ? quality : 'medium',
    };
  }

  if (model === 'dall-e-3') {
    const size = current.ai_default_image_size;
    const quality = current.ai_default_image_quality;
    return {
      ...current,
      ai_image_model: model,
      ai_default_image_size: size && ['1024x1024', '1792x1024', '1024x1792'].includes(size) ? size : '1792x1024',
      ai_default_image_quality: quality && ['standard', 'hd'].includes(quality) ? quality : 'standard',
    };
  }

  return {
    ...current,
    ai_image_model: model,
    ai_default_image_size: '1024x1024',
    ai_default_image_quality: 'standard',
  };
}

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

export default function AiSettingsPage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const toast = useToast();

  const isWritable = hasRole(['super_admin', 'admin']);

  // API key is write-only after saving.
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Test connection state
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Fetch AI settings
  const { data: settingsResponse, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['admin-ai-settings'],
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

  // Fetch users (only for admin/super_admin)
  const { data: users = [], error: usersError } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const res = await api.get<User[]>('/users?per_page=100');
      return res.data;
    },
    enabled: isWritable,
  });

  // Form states
  const [formData, setFormData] = useState<Partial<AiSettingsPublic>>({});

  useEffect(() => {
    if (settingsResponse?.data) {
      setFormData(settingsResponse.data);
      setApiKeyInput('');
    }
  }, [settingsResponse]);

  // Save Settings Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: Partial<AiSettingsPublic>) => {
      const dataToSave = { ...payload };
      if (apiKeyInput.trim()) {
        dataToSave.ai_openai_api_key = apiKeyInput;
      }
      return aiContentService.updateAiSettings(dataToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-settings'] });
      toast.success('Đã lưu cấu hình AI thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi lưu cấu hình. Vui lòng kiểm tra lại.');
    }
  });

  // Test Connection Mutation
  const testConnectionMutation = useMutation({
    mutationFn: () => {
      const payload: { ai_openai_api_key?: string; ai_text_model?: string } = {
        ai_text_model: formData.ai_text_model || 'gpt-4o-mini',
      };
      if (apiKeyInput.trim()) {
        payload.ai_openai_api_key = apiKeyInput;
      }
      return aiContentService.testAiConnection(payload);
    },
    onMutate: () => {
      setTestStatus('testing');
      setTestMessage(`Đang kiểm tra model ${formData.ai_text_model || 'gpt-4o-mini'}...`);
    },
    onSuccess: (res) => {
      setTestStatus('success');
      setTestMessage(res.message || 'Kết nối thành công! API hoạt động bình thường.');
    },
    onError: (err: any) => {
      setTestStatus('error');
      setTestMessage(err.message || 'Kết nối thất bại. Vui lòng kiểm tra lại API Key và model đang chọn.');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;

    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      val = parseInt(value, 10);
    }

    setFormData(prev => {
      if (name === 'ai_image_model') {
        return normalizeImageOptionsForModel(String(val), prev);
      }

      return {
        ...prev,
        [name]: val
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWritable) return;
    saveMutation.mutate(formData);
  };

  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-[#B88746] animate-spin" />
        <p className="text-sm text-[#8C7A6B]">Äang táº£i cáº¥u hÃ¬nh AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16] flex items-center gap-3">
            <Wrench className="w-8 h-8 text-[#B88746]" />
            Cáº¥u hÃ¬nh AI Content Automation
          </h1>
          <p className="text-sm text-[#8C7A6B]">Quáº£n lÃ½ thÃ´ng tin káº¿t ná»‘i API OpenAI, cáº¥u hÃ¬nh model vÃ  cÃ¡c thÃ´ng sá»‘ viáº¿t bÃ i máº·c Ä‘á»‹nh</p>
        </div>
      </div>

      {!isWritable && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Cháº¿ Ä‘á»™ Xem (Chá»‰ Ä‘á»c)</h4>
            <p className="text-xs text-amber-700 mt-1">TÃ i khoáº£n Marketing chá»‰ cÃ³ quyá»n xem cáº¥u hÃ¬nh. Chá»‰ Super Admin hoáº·c Admin há»‡ thá»‘ng má»›i cÃ³ thá»ƒ chá»‰nh sá»­a thÃ´ng tin API Key vÃ  Model.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Connection settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: API Credentials */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#FBF8F2] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Káº¿t ná»‘i OpenAI API</h3>
                <p className="text-xs text-[#8C7A6B]">Cung cáº¥p mÃ£ káº¿t ná»‘i OpenAI API Ä‘á»ƒ kÃ­ch hoáº¡t cÃ¡c tÃ­nh nÄƒng AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">NhÃ  cung cáº¥p AI</label>
                <select
                  name="ai_provider"
                  value={formData.ai_provider || 'openai'}
                  onChange={handleInputChange}
                  disabled={true} // Locked to openai
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] opacity-80"
                >
                  <option value="openai">OpenAI (ChatGPT / DALL-E)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">OpenAI API Key</label>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    disabled={!isWritable}
                    placeholder={formData.api_key_configured ? 'Nhập API key mới nếu muốn thay đổi' : 'Nhập sk-...'}
                    className={`w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all ${!isWritable ? 'opacity-85 cursor-not-allowed' : ''}`}
                  />
                  <p className="text-[11px] leading-relaxed text-[#8C7A6B]">
                    Vì lý do bảo mật, hệ thống không hiển thị lại API key đã lưu. Nếu key bị lộ, hãy tạo key mới trong OpenAI Dashboard rồi dán lại vào đây.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => testConnectionMutation.mutate()}
                  disabled={testConnectionMutation.isPending || (!isWritable && !formData.api_key_configured)}
                  className="border border-[#B88746] text-[#B88746] hover:bg-[#B88746]/10 px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {testConnectionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Äang kiá»ƒm tra...
                    </>
                  ) : (
                    'Kiá»ƒm tra káº¿t ná»‘i API'
                  )}
                </button>

                {formData.api_key_configured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ÄÃ£ cáº¥u hÃ¬nh API Key trong há»‡ thá»‘ng
                  </span>
                )}
              </div>

              {testStatus !== 'idle' && (
                <div className={`mt-4 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  testStatus === 'testing' ? 'bg-[#FBF8F2] border-[#E8DCCB] text-[#8C7A6B]' :
                  testStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {testStatus === 'testing' && <Loader2 className="w-5 h-5 text-[#B88746] animate-spin shrink-0 mt-0.5" />}
                  {testStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                  {testStatus === 'error' && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-semibold">
                      {testStatus === 'testing' ? 'Äang kiá»ƒm tra...' :
                       testStatus === 'success' ? 'Káº¿t ná»‘i thÃ nh cÃ´ng!' :
                       'Lá»—i káº¿t ná»‘i API'}
                    </span>
                    <p className="text-xs mt-1 text-inherit">{testMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Model Settings & Fallbacks */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#FBF8F2] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Cáº¥u hÃ¬nh Model AI</h3>
                <p className="text-xs text-[#8C7A6B]">TÃ¹y chá»n Model Ä‘á»ƒ sinh vÄƒn báº£n vÃ  áº£nh Ä‘áº¡i diá»‡n bÃ i viáº¿t</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Model viáº¿t bÃ i (Máº·c Ä‘á»‹nh)</label>
                <select
                  name="ai_text_model"
                  value={formData.ai_text_model || 'gpt-4o-mini'}
                  onChange={handleInputChange}
                  disabled={!isWritable}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                >
                  {TEXT_MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">Test kết nối sẽ dùng đúng model đang chọn tại đây.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Model sinh áº£nh (Máº·c Ä‘á»‹nh)</label>
                <select
                  name="ai_image_model"
                  value={formData.ai_image_model || 'gpt-image-1'}
                  onChange={handleInputChange}
                  disabled={!isWritable}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                >
                  {IMAGE_MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">Kích thước và chất lượng ảnh phía dưới sẽ tự đổi theo model này.</span>
              </div>
            </div>

            {/* Fallback settings */}
            <div className="border-t border-[#FBF8F2] pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-sm font-semibold text-[#1F1B16]">KÃ­ch hoáº¡t Model dá»± phÃ²ng (Fallback)</label>
                  <p className="text-xs text-[#8C7A6B]">T\u1ef1 \u0111\u1ed9ng chuyá»ƒn Ä‘á»•i sang model khÃ¡c khi model máº·c Ä‘á»‹nh bá»‹ quÃ¡ táº£i hoáº·c chÆ°a Ä‘Æ°á»£c cáº¥p quyá»n</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="ai_enable_model_fallback"
                    checked={formData.ai_enable_model_fallback || false}
                    onChange={handleInputChange}
                    disabled={!isWritable}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88746]"></div>
                </label>
              </div>

              {formData.ai_enable_model_fallback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-[#FBF8F2] border border-[#E8DCCB] transition-all animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Model viáº¿t bÃ i dá»± phÃ²ng</label>
                    <input
                      type="text"
                      name="ai_fallback_text_model"
                      value={formData.ai_fallback_text_model || ''}
                      onChange={handleInputChange}
                      disabled={!isWritable}
                      placeholder="gpt-4o-mini"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-white text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Model sinh áº£nh dá»± phÃ²ng</label>
                    <input
                      type="text"
                      name="ai_fallback_image_model"
                      value={formData.ai_fallback_image_model || ''}
                      onChange={handleInputChange}
                      disabled={!isWritable}
                      placeholder="dall-e-3"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-white text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Generation Defaults */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#FBF8F2] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Cáº¥u hÃ¬nh sinh bÃ i viáº¿t máº·c Ä‘á»‹nh</h3>
                <p className="text-xs text-[#8C7A6B]">CÃ¡c tÃ¹y chá»‰nh máº·c Ä‘á»‹nh khi gá»­i yÃªu cáº§u viáº¿t bÃ i</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">NgÃ´n ngá»¯ máº·c Ä‘á»‹nh</label>
                <select
                  name="ai_default_language"
                  value={formData.ai_default_language || 'vi'}
                  onChange={handleInputChange}
                  disabled={!isWritable}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                >
                  <option value="vi">Tiáº¿ng Viá»‡t (vi)</option>
                  <option value="en">Tiáº¿ng Anh (en)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Äá»™ dÃ i bÃ i viáº¿t máº·c Ä‘á»‹nh</label>
                <select
                  name="ai_default_article_length"
                  value={formData.ai_default_article_length || '1200-1800 words'}
                  onChange={handleInputChange}
                  disabled={!isWritable}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                >
                  <option value="600-800 words">Ngáº¯n (600 - 800 tá»«)</option>
                  <option value="800-1200 words">Vá»«a (800 - 1200 tá»«)</option>
                  <option value="1200-1800 words">DÃ i chuáº©n SEO (1200 - 1800 tá»«)</option>
                  <option value="1800-2500 words">ChuyÃªn sÃ¢u (1800 - 2500 tá»«)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">TÃªn tráº¡ng thÃ¡i khi táº¡o</label>
                <select
                  name="ai_default_post_status"
                  value={formData.ai_default_post_status || 'draft'}
                  onChange={handleInputChange}
                  disabled={true} // Locked to draft
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] opacity-80"
                >
                  <option value="draft">Báº£n nhÃ¡p (draft)</option>
                </select>
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">Táº¥t cáº£ bÃ i viáº¿t sinh bá»Ÿi AI máº·c Ä‘á»‹nh á»Ÿ dáº¡ng Báº£n nhÃ¡p Ä‘á»ƒ biÃªn táº­p láº¡i</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Giá»ng Ä‘iá»‡u vÄƒn phong máº·c Ä‘á»‹nh</label>
              <input
                type="text"
                name="ai_default_tone"
                value={formData.ai_default_tone || ''}
                onChange={handleInputChange}
                disabled={!isWritable}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746] transition-all"
              />
            </div>

            <div className="border-t border-[#FBF8F2] pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-sm font-semibold text-[#1F1B16]">T\u1ef1 \u0111\u1ed9ng sinh áº£nh minh há»a</label>
                  <p className="text-xs text-[#8C7A6B]">T\u1ef1 \u0111\u1ed9ng gá»i OpenAI Image API Ä‘á»ƒ sinh áº£nh minh há»a cho bÃ i viáº¿t</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="ai_enable_image_generation"
                    checked={formData.ai_enable_image_generation || false}
                    onChange={handleInputChange}
                    disabled={!isWritable}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88746]"></div>
                </label>
              </div>

              {formData.ai_enable_image_generation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-[#FBF8F2] border border-[#E8DCCB] animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">KÃ­ch thÆ°á»›c áº£nh Ä‘áº¡i diá»‡n</label>
                    <select
                      name="ai_default_image_size"
                      value={formData.ai_default_image_size || (formData.ai_image_model?.startsWith('gpt-image') ? '1536x1024' : '1024x1024')}
                      onChange={handleInputChange}
                      disabled={!isWritable}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-white text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                    >
                      {imageSizeOptions(formData.ai_image_model || 'gpt-image-1').map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Cháº¥t lÆ°á»£ng áº£nh</label>
                    <select
                      name="ai_default_image_quality"
                      value={formData.ai_default_image_quality || (formData.ai_image_model?.startsWith('gpt-image') ? 'medium' : 'standard')}
                      onChange={handleInputChange}
                      disabled={!isWritable}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-white text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                    >
                      {imageQualityOptions(formData.ai_image_model || 'gpt-image-1').map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Limits & Defaults assignments */}
        <div className="space-y-6">
          {/* Card: Default Categorization */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#FBF8F2] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">PhÃ¢n má»¥c & TÃ¡c giáº£</h3>
                <p className="text-xs text-[#8C7A6B]">GÃ¡n máº·c Ä‘á»‹nh khi viáº¿t bÃ i tá»± Ä‘á»™ng</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">ChuyÃªn má»¥c máº·c Ä‘á»‹nh</label>
                <select
                  name="ai_default_category_id"
                  value={formData.ai_default_category_id || ''}
                  onChange={handleInputChange}
                  disabled={!isWritable}
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
                {isWritable && !usersError ? (
                  <select
                    name="ai_default_author_id"
                    value={formData.ai_default_author_id || ''}
                    onChange={handleInputChange}
                    disabled={!isWritable}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                  >
                    <option value="">-- Chá»n tÃ¡c giáº£ --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="number"
                      name="ai_default_author_id"
                      value={formData.ai_default_author_id || ''}
                      onChange={handleInputChange}
                      disabled={!isWritable}
                      placeholder="ID tÃ¡c giáº£ (vÃ­ dá»¥: 1)"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                    />
                    <span className="text-[10px] text-[#8C7A6B] mt-1 block">TÃ i khoáº£n cá»§a báº¡n khÃ´ng Ä‘Æ°á»£c phÃ¢n quyá»n táº£i danh sÃ¡ch thÃ nh viÃªn. Vui lÃ²ng nháº­p ID thá»§ cÃ´ng.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">MÃºi giá» Ä‘áº·t lá»‹ch Ä‘Äƒng</label>
                <input
                  type="text"
                  name="ai_schedule_timezone"
                  value={formData.ai_schedule_timezone || 'Asia/Ho_Chi_Minh'}
                  disabled={true}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] opacity-80"
                />
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">Locked: <code>Asia/Ho_Chi_Minh</code></span>
              </div>
            </div>
          </div>

          {/* Card: System Limits */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#FBF8F2] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Giá»›i háº¡n há»‡ thá»‘ng</h3>
                <p className="text-xs text-[#8C7A6B]">TrÃ¡nh láº¡m dá»¥ng tÃ i nguyÃªn hoáº·c chi phÃ­ API</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Sá»‘ bÃ i tá»‘i Ä‘a trong 1 Batch</label>
                <input
                  type="number"
                  name="ai_max_articles_per_batch"
                  value={formData.ai_max_articles_per_batch || 20}
                  onChange={handleInputChange}
                  disabled={!isWritable}
                  min={1}
                  max={50}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                />
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">Tá»‘i Ä‘a 50 bÃ i viáº¿t/batch</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Sá»‘ Jobs cháº¡y tá»‘i Ä‘a trong 1 giá»</label>
                <input
                  type="number"
                  name="ai_max_jobs_per_hour"
                  value={formData.ai_max_jobs_per_hour || 30}
                  onChange={handleInputChange}
                  disabled={!isWritable}
                  min={1}
                  max={100}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:border-[#B88746]"
                />
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">Tá»‘i Ä‘a 100 tÃ¡c vá»¥/giá» Ä‘á»ƒ trÃ¡nh rate-limit API</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {isWritable && (
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full bg-[#B88746] hover:bg-[#1F1B16] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Äang lÆ°u cáº¥u hÃ¬nh...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  LÆ°u cáº¥u hÃ¬nh
                </>
              )}
            </button>
          )}

          {formData.last_scheduler_run_at && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
              <div className="font-semibold text-gray-700">Tráº¡ng thÃ¡i Scheduler:</div>
              <div>Láº§n cháº¡y gáº§n nháº¥t: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#B88746]">{formData.last_scheduler_run_at}</code></div>
              <p className="text-[10px] text-gray-500 mt-1">Há»‡ thá»‘ng láº­p lá»‹ch tá»± Ä‘á»™ng kÃ­ch hoáº¡t má»—i phÃºt Ä‘á»ƒ kiá»ƒm tra vÃ  Ä‘Äƒng cÃ¡c bÃ i viáº¿t Ä‘Ã£ háº¹n giá».</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
