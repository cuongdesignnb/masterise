'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SeoMeta } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Edit, 
  X, 
  Check, 
  Image as ImageIcon,
  AlertCircle,
  Share2
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import { useToast } from '@/components/admin/Toast';

export default function AdminSeo() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activePath, setActivePath] = useState<string | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formOgTitle, setFormOgTitle] = useState('');
  const [formOgDescription, setFormOgDescription] = useState('');
  const [formOgImage, setFormOgImage] = useState('');

  const STATIC_PAGES = [
    { path: '/', name: 'Trang chủ (Homepage)', description: 'Trang chủ Masterise Homes' },
    { path: '/du-an', name: 'Danh sách Dự án', description: 'Trang hiển thị tất cả dự án đang mở bán, sắp mở bán' },
    { path: '/tin-tuc', name: 'Danh sách Tin tức', description: 'Trang tin tức, cẩm nang và hướng dẫn bất động sản' },
    { path: '/gioi-thieu', name: 'Giới thiệu Masterise', description: 'Trang giới thiệu lịch sử, sứ mệnh, ban quản trị' },
    { path: '/lien-he', name: 'Liên hệ', description: 'Trang thông tin liên hệ và form đăng ký tư vấn khách hàng' },
  ];

  // Fetch SEO details when a path is selected for editing
  const { data: seoDetails, isLoading } = useQuery({
    queryKey: ['seo-path-details', activePath],
    queryFn: async () => {
      if (!activePath) return null;
      const response = await api.get<SeoMeta>(`/seo/by-path?path=${encodeURIComponent(activePath)}`);
      return response.data;
    },
    enabled: !!activePath,
  });

  // Sync form state when query details are fetched
  React.useEffect(() => {
    if (seoDetails) {
      setFormTitle(seoDetails.title || '');
      setFormDescription(seoDetails.description || '');
      setFormKeywords(seoDetails.keywords || '');
      setFormOgTitle(seoDetails.og_title || '');
      setFormOgDescription(seoDetails.og_description || '');
      setFormOgImage(seoDetails.og_image || '');
    } else if (activePath && !isLoading) {
      // Clear form for fresh new config
      setFormTitle('');
      setFormDescription('');
      setFormKeywords('');
      setFormOgTitle('');
      setFormOgDescription('');
      setFormOgImage('');
    }
  }, [seoDetails, activePath, isLoading]);

  // Save SEO meta mutation
  const saveSeoMutation = useMutation({
    mutationFn: async () => {
      if (!activePath) return;
      return api.post('/seo', {
        path: activePath,
        title: formTitle,
        description: formDescription,
        keywords: formKeywords,
        og_title: formOgTitle || formTitle,
        og_description: formOgDescription || formDescription,
        og_image: formOgImage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-path-details', activePath] });
      setActivePath(null);
      toast.success('Đã cập nhật cấu hình SEO URL thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi lưu cấu hình SEO.');
    }
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Cấu hình SEO URL</h1>
        <p className="text-sm text-[#8C7A6B]">Tối ưu hóa các thẻ tiêu đề, mô tả và cấu hình hiển thị khi chia sẻ liên kết của các trang tĩnh</p>
      </div>

      {/* Pages List */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Tên trang</th>
                <th className="px-6 py-4">Đường dẫn (Path)</th>
                <th className="px-6 py-4">Mô tả chức năng</th>
                <th className="px-6 py-4 text-right">Cấu hình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
              {STATIC_PAGES.map((page) => (
                <tr key={page.path} className="hover:bg-[#FBF8F2]/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#1F1B16]">
                    {page.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#B88746]">
                    {page.path}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#8C7A6B]">
                    {page.description}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setActivePath(page.path)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#B88746] hover:bg-[#B88746] hover:text-white text-[#B88746] rounded-xl text-xs font-semibold transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Cấu hình SEO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO Edit Drawer */}
      <AnimatePresence>
        {activePath !== null && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePath(null)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white h-full flex flex-col z-10 shadow-2xl border-l border-[#E8DCCB] text-[#1F1B16] font-body"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    SEO Meta: {STATIC_PAGES.find(p => p.path === activePath)?.name}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Cấu hình thẻ tiêu đề, mô tả và hiển thị chia sẻ trên mạng xã hội cho URL: {activePath}
                  </p>
                </div>
                <button
                  onClick={() => setActivePath(null)}
                  className="p-1.5 hover:bg-[#E8DCCB]/40 text-[#8C7A6B] hover:text-[#1F1B16] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Fields */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {isLoading ? (
                  <div className="space-y-4 py-8 flex flex-col items-center justify-center">
                    <span className="w-8 h-8 border-3 border-[#B88746] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#8C7A6B]">Đang tải cấu hình SEO...</span>
                  </div>
                ) : (
                  <>
                    {/* Google Search Snippet Preview */}
                    <div className="border border-[#E8DCCB] rounded-2xl p-4 bg-[#FBF8F2]/60 space-y-3">
                      <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-[#B88746]" />
                        Xem trước trên Google Search
                      </h4>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 block font-sans truncate">
                          http://masterisehomes.com{activePath}
                        </span>
                        <span className="text-lg text-blue-800 font-sans hover:underline block font-semibold cursor-pointer truncate">
                          {formTitle || 'Vui lòng nhập tiêu đề SEO...'}
                        </span>
                        <span className="text-xs text-gray-700 leading-relaxed block line-clamp-2">
                          {formDescription || 'Vui lòng nhập mô tả SEO (Meta Description) để hiển thị tóm tắt nội dung của trang này trên bảng kết quả tìm kiếm của Google...'}
                        </span>
                      </div>
                    </div>

                    {/* Google/SEO Parameters */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">
                        Thẻ Meta tiêu chuẩn (Google, Bing)
                      </h4>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề SEO (Title Tag) *</label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Khuyên dùng 50 - 60 ký tự"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả SEO (Meta Description) *</label>
                        <textarea
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Khuyên dùng 150 - 160 ký tự để mô tả tối ưu"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Từ khóa SEO (Keywords)</label>
                        <input
                          type="text"
                          value={formKeywords}
                          onChange={(e) => setFormKeywords(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: masterise homes, bat dong san quan 2, the global city"
                        />
                      </div>
                    </div>

                    {/* Social Shares / Open Graph */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-1">
                        <Share2 className="w-4 h-4 text-[#B88746]" />
                        Hiển thị Chia sẻ mạng xã hội (Facebook, Zalo)
                      </h4>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề chia sẻ (OG Title)</label>
                        <input
                          type="text"
                          value={formOgTitle}
                          onChange={(e) => setFormOgTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Để trống sẽ tự động dùng Tiêu đề SEO phía trên..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả chia sẻ (OG Description)</label>
                        <textarea
                          value={formOgDescription}
                          onChange={(e) => setFormOgDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                          placeholder="Để trống sẽ tự động dùng Mô tả SEO phía trên..."
                        />
                      </div>

                      {/* OG Image Selection */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8C7A6B]">Ảnh hiển thị (OG Image)</label>
                        <div className="flex gap-4 items-center">
                          <div className="w-32 h-18 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] overflow-hidden flex items-center justify-center shrink-0">
                            {formOgImage ? (
                              <img src={formOgImage} alt="OG Image Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-[#B88746]/40" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={formOgImage}
                              onChange={(e) => setFormOgImage(e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs focus:outline-none"
                              placeholder="URL hình ảnh chia sẻ (tỷ lệ khuyên dùng 1200 x 630)"
                            />
                            <button
                              type="button"
                              onClick={() => setIsMediaOpen(true)}
                              className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              Chọn ảnh từ Media Library
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <button
                  type="button"
                  onClick={() => setActivePath(null)}
                  className="px-5 py-2.5 border border-[#E8DCCB] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => saveSeoMutation.mutate()}
                  disabled={saveSeoMutation.isPending || !formTitle || !formDescription}
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {saveSeoMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Lưu cấu hình SEO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Select Modal Wrapper */}
      <AnimatePresence>
        {isMediaOpen && (
          <MediaSelectModal
            isOpen={isMediaOpen}
            onClose={() => setIsMediaOpen(false)}
            onSelect={(url) => setFormOgImage(url as string)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
