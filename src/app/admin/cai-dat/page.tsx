'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SystemSetting } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon, 
  HelpCircle, 
  Calendar, 
  Briefcase 
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';

// Interfaces for structured settings
interface SlideItem {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface DepartmentItem {
  name: string;
  phone: string;
  email: string;
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'homepage' | 'about' | 'contact'>('general');
  const [mediaTarget, setMediaTarget] = useState<{ type: 'logo' | 'slide'; index?: number } | null>(null);

  // Form States
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [hotline, setHotline] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [zaloUrl, setZaloUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const [aboutMission, setAboutMission] = useState('');
  const [aboutVision, setAboutVision] = useState('');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // Fetch settings list
  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get<SystemSetting[]>('/settings');
      return response.data;
    },
  });

  // Populate form states when settings load
  React.useEffect(() => {
    if (settingsList.length > 0) {
      const getVal = (key: string, type: 'string' | 'json' = 'string') => {
        const item = settingsList.find(s => s.key === key);
        if (!item || !item.value) return type === 'json' ? [] : '';
        if (type === 'json') {
          try {
            return JSON.parse(item.value);
          } catch (e) {
            return [];
          }
        }
        return item.value;
      };

      setCompanyName(getVal('company_name'));
      setCompanyAddress(getVal('company_address'));
      setHotline(getVal('hotline'));
      setEmail(getVal('email'));
      setLogoUrl(getVal('logo_url'));

      const social = getVal('social_links', 'json');
      setFacebookUrl(social?.facebook || '');
      setYoutubeUrl(social?.youtube || '');
      setZaloUrl(social?.zalo || '');
      setInstagramUrl(social?.instagram || '');
      setLinkedinUrl(social?.linkedin || '');

      setSlides(getVal('homepage_slides', 'json') || []);
      setFaqs(getVal('homepage_faq', 'json') || []);

      setAboutMission(getVal('about_mission'));
      setAboutVision(getVal('about_vision'));
      setTimeline(getVal('about_timeline', 'json') || []);

      setDepartments(getVal('contact_departments', 'json') || []);
    }
  }, [settingsList]);

  // Bulk update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        settings: [
          { key: 'company_name', value: companyName, type: 'string' },
          { key: 'company_address', value: companyAddress, type: 'string' },
          { key: 'hotline', value: hotline, type: 'string' },
          { key: 'email', value: email, type: 'string' },
          { key: 'logo_url', value: logoUrl, type: 'string' },
          { 
            key: 'social_links', 
            value: { facebook: facebookUrl, youtube: youtubeUrl, zalo: zaloUrl, instagram: instagramUrl, linkedin: linkedinUrl }, 
            type: 'json' 
          },
          { key: 'homepage_slides', value: slides, type: 'json' },
          { key: 'homepage_faq', value: faqs, type: 'json' },
          { key: 'about_mission', value: aboutMission, type: 'string' },
          { key: 'about_vision', value: aboutVision, type: 'string' },
          { key: 'about_timeline', value: timeline, type: 'json' },
          { key: 'contact_departments', value: departments, type: 'json' }
        ]
      };

      return api.put('/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      alert('Đã lưu tất cả các cấu hình cài đặt thành công!');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi cập nhật cài đặt.');
    }
  });

  // Media selector callback
  const handleMediaSelected = (url: string | string[]) => {
    if (!mediaTarget) return;
    if (mediaTarget.type === 'logo') {
      setLogoUrl(url as string);
    } else if (mediaTarget.type === 'slide' && mediaTarget.index !== undefined) {
      const idx = mediaTarget.index;
      setSlides(prev => prev.map((s, i) => i === idx ? { ...s, image: url as string } : s));
    }
  };

  // List Builders functions
  const addSlide = () => {
    setSlides([...slides, { title: '', subtitle: '', image: '', link: '' }]);
  };

  const removeSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const handleSlideChange = (idx: number, field: keyof SlideItem, val: string) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleFaqChange = (idx: number, field: keyof FaqItem, val: string) => {
    setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };

  const addTimeline = () => {
    setTimeline([...timeline, { year: '', title: '', description: '' }]);
  };

  const removeTimeline = (idx: number) => {
    setTimeline(timeline.filter((_, i) => i !== idx));
  };

  const handleTimelineChange = (idx: number, field: keyof TimelineItem, val: string) => {
    setTimeline(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };

  const addDepartment = () => {
    setDepartments([...departments, { name: '', phone: '', email: '' }]);
  };

  const removeDepartment = (idx: number) => {
    setDepartments(departments.filter((_, i) => i !== idx));
  };

  const handleDepartmentChange = (idx: number, field: keyof DepartmentItem, val: string) => {
    setDepartments(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Cài đặt hệ thống</h1>
          <p className="text-sm text-[#8C7A6B]">Quản lý thông tin doanh nghiệp, banner trang chủ, lịch sử phát triển và các phòng ban liên hệ</p>
        </div>
        <button
          onClick={() => updateSettingsMutation.mutate()}
          disabled={updateSettingsMutation.isPending}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateSettingsMutation.isPending ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-1.5 text-xs overflow-x-auto select-none gap-1 shrink-0">
        {[
          { id: 'general', label: 'Thông tin chung & MXH', icon: Settings },
          { id: 'homepage', label: 'Cấu hình Trang chủ', icon: ImageIcon },
          { id: 'about', label: 'Cấu hình Giới thiệu', icon: Calendar },
          { id: 'contact', label: 'Cấu hình Liên hệ', icon: Briefcase }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#B88746] shadow-sm'
                  : 'text-[#8C7A6B] hover:text-[#1F1B16] hover:bg-white/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Form Card */}
      {isLoading ? (
        <div className="p-20 text-center bg-white border border-[#E8DCCB] rounded-2xl flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-3 border-[#B88746] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#8C7A6B]">Đang tải cấu hình cài đặt...</span>
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: General & Contact Info */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B88746]" />
                Thông tin doanh nghiệp chính
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên công ty *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Ví dụ: Công ty Cổ phần Masterise Homes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Số hotline (Tổng đài) *</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Ví dụ: 028 39159159"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ trụ sở *</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Địa chỉ trụ sở chính..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Email liên hệ chung *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="info@masterisehomes.com"
                  />
                </div>
              </div>

              {/* Logo Company */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#8C7A6B]">Logo công ty</label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-16 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] overflow-hidden flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Company Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#B88746]/40" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs focus:outline-none"
                      placeholder="URL logo công ty"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaTarget({ type: 'logo' })}
                      className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Chọn logo từ Thư viện
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 pt-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#B88746]" />
                Kênh Mạng xã hội (Social Media)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trang Facebook (URL)</label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Kênh Youtube (URL)</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tài khoản Zalo (URL/Sđt)</label>
                  <input
                    type="text"
                    value={zaloUrl}
                    onChange={(e) => setZaloUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://zalo.me/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Instagram (URL)</label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">LinkedIn (URL)</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Homepage Config */}
          {activeTab === 'homepage' && (
            <div className="space-y-8">
              
              {/* Homepage Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                  <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#B88746]" />
                    Banner Hero Slider (Trang chủ)
                  </h3>
                  <button
                    type="button"
                    onClick={addSlide}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Banner Slide
                  </button>
                </div>

                {slides.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                    Chưa có banner nào. Hãy nhấn nút để thêm slide.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slides.map((slide, idx) => (
                      <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 grid grid-cols-1 md:grid-cols-12 gap-4 relative group">
                        
                        {/* Slide Image selection */}
                        <div className="md:col-span-3 space-y-2">
                          <div className="aspect-video w-full rounded-lg border border-[#E8DCCB] bg-white overflow-hidden flex items-center justify-center relative">
                            {slide.image ? (
                              <img src={slide.image} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-[#B88746]/40" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setMediaTarget({ type: 'slide', index: idx })}
                            className="w-full px-2 py-1 bg-white hover:bg-gray-100 border border-[#E8DCCB] text-[10px] font-bold rounded text-center transition-colors"
                          >
                            Chọn ảnh Banner
                          </button>
                        </div>

                        {/* Slide Info */}
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-0.5">Tiêu đề Banner</label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Tiêu đề chính lớn..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-0.5">Mô tả phụ</label>
                            <input
                              type="text"
                              value={slide.subtitle}
                              onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Dòng chữ phụ phía trên..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-0.5">Link liên kết nút (URL)</label>
                            <input
                              type="text"
                              value={slide.link}
                              onChange={(e) => handleSlideChange(idx, 'link', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Ví dụ: /du-an/the-global-city"
                            />
                          </div>
                        </div>

                        {/* Action delete */}
                        <div className="md:col-span-1 flex items-center justify-end md:justify-center">
                          <button
                            type="button"
                            onClick={() => removeSlide(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa banner slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQs Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2 pt-4">
                  <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#B88746]" />
                    Câu hỏi thường gặp FAQs (Trang chủ)
                  </h3>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Câu hỏi
                  </button>
                </div>

                {faqs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                    Chưa có câu hỏi nào. Nhấn để tạo mới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <div>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white font-semibold focus:outline-none"
                              placeholder="Câu hỏi: Ví dụ: Masterise Homes là ai?"
                            />
                          </div>
                          <div>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Câu trả lời cụ thể..."
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: About Us Config */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B88746]" />
                Tầm nhìn & Sứ mệnh (Vision & Mission)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Sứ mệnh (Mission)</label>
                  <textarea
                    value={aboutMission}
                    onChange={(e) => setAboutMission(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Nhập sứ mệnh của công ty..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tầm nhìn (Vision)</label>
                  <textarea
                    value={aboutVision}
                    onChange={(e) => setAboutVision(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Nhập tầm nhìn dài hạn..."
                  />
                </div>
              </div>

              {/* About Timeline list builder */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                  <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#B88746]" />
                    Dòng lịch sử cột mốc (Timeline)
                  </h3>
                  <button
                    type="button"
                    onClick={addTimeline}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Cột mốc
                  </button>
                </div>

                {timeline.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                    Chưa có cột mốc thời gian nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((time, idx) => (
                      <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-1">
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Năm</label>
                            <input
                              type="text"
                              value={time.year}
                              onChange={(e) => handleTimelineChange(idx, 'year', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                              placeholder="Ví dụ: 2020"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Tiêu đề cột mốc</label>
                            <input
                              type="text"
                              value={time.title}
                              onChange={(e) => handleTimelineChange(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-semibold"
                              placeholder="Ví dụ: Thành lập Masterise Homes..."
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Chi tiết mô tả</label>
                            <textarea
                              value={time.description}
                              onChange={(e) => handleTimelineChange(idx, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Nội dung cụ thể cột mốc lịch sử..."
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTimeline(idx)}
                          className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Contact Departments */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#B88746]" />
                  Các phòng ban hỗ trợ (Contact Departments)
                </h3>
                <button
                  type="button"
                  onClick={addDepartment}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm Phòng ban
                </button>
              </div>

              {departments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                  Chưa có phòng ban liên hệ nào được định nghĩa.
                </div>
              ) : (
                <div className="space-y-3">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Tên phòng ban</label>
                          <input
                            type="text"
                            value={dept.name}
                            onChange={(e) => handleDepartmentChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-semibold"
                            placeholder="Ví dụ: Phòng Kinh doanh"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Hotline phòng ban</label>
                          <input
                            type="text"
                            value={dept.phone}
                            onChange={(e) => handleDepartmentChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                            placeholder="Ví dụ: 090 1234567"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Email phòng ban</label>
                          <input
                            type="email"
                            value={dept.email}
                            onChange={(e) => handleDepartmentChange(idx, 'email', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                            placeholder="sales@masterisehomes.com"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDepartment(idx)}
                        className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Media Select Modal Wrapper */}
      <AnimatePresence>
        {mediaTarget !== null && (
          <MediaSelectModal
            isOpen={mediaTarget !== null}
            onClose={() => setMediaTarget(null)}
            onSelect={handleMediaSelected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
