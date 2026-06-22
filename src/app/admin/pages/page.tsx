'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pageService, StaticPage } from '@/services/pageService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/admin/Toast';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  Search,
  Globe,
  Loader2,
  Calendar,
  User,
  ShieldAlert
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

// Helper to slugify vietnamese text
function slugify(text: string): string {
  let slug = text.toLowerCase();
  // Map Vietnamese letters to English letters
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
  slug = slug.replace(/[íìỉĩị]/g, 'i');
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
  slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
  slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
  slug = slug.replace(/đ/g, 'd');
  // Remove special characters, symbols
  slug = slug.replace(/[^a-z0-9 -]/g, '');
  // Replace spaces and repeat hyphens
  slug = slug.replace(/\s+/g, '-');
  slug = slug.replace(/-+/g, '-');
  return slug.trim().replace(/^-+|-+$/g, '');
}

export default function AdminPages() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StaticPage | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'content' | 'seo'>('content');

  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published');
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto slug generation
  useEffect(() => {
    if (!editingItem && !isSlugManuallyEdited) {
      setFormSlug(slugify(formTitle));
    }
  }, [formTitle, editingItem, isSlugManuallyEdited]);

  // Fetch list query
  const { data: pagesResponse, isLoading } = useQuery({
    queryKey: ['admin-pages-list', pageNumber, q, statusFilter],
    queryFn: () => pageService.getPages({
      page: pageNumber,
      per_page: 10,
      q,
      status: statusFilter === 'all' ? undefined : statusFilter
    }),
  });

  const pages = pagesResponse?.data || [];
  const meta = pagesResponse?.meta || { current_page: 1, last_page: 1, total: 0 };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formTitle,
        slug: formSlug,
        content: formContent,
        status: formStatus,
        seo_title: seoTitle || undefined,
        seo_description: seoDesc || undefined,
        seo_keywords: seoKeywords || undefined,
      };

      if (editingItem) {
        return pageService.updatePage(editingItem.id, payload);
      } else {
        return pageService.createPage(payload);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages-list'] });
      toast.success(editingItem ? 'Cập nhật chuyên trang thành công!' : 'Tạo chuyên trang mới thành công!');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu chuyên trang.');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => pageService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages-list'] });
      toast.success('Đã xóa chuyên trang thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi xóa chuyên trang.');
    }
  });

  const handleCreateOpen = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormSlug('');
    setFormContent('');
    setFormStatus('published');
    setSeoTitle('');
    setSeoDesc('');
    setSeoKeywords('');
    setIsSlugManuallyEdited(false);
    setActiveFormTab('content');
    setIsFormOpen(true);
  };

  const handleEditOpen = (item: StaticPage) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormContent(item.content || '');
    setFormStatus(item.status);
    setSeoTitle(item.seo_meta?.title || '');
    setSeoDesc(item.seo_meta?.description || '');
    setSeoKeywords(item.seo_meta?.keywords || '');
    setIsSlugManuallyEdited(true);
    setActiveFormTab('content');
    setIsFormOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chuyên trang "${title}"? Thao tác này sẽ xóa vĩnh viễn trang và cấu hình SEO tương ứng.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Chuyên trang</h1>
          <p className="text-sm text-[#8C7A6B]">Tạo các trang điều khoản, chính sách bảo mật, chính sách thanh toán, v.v.</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo Chuyên trang Mới
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C7A6B]" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề hoặc nội dung..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPageNumber(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:border-[#B88746]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageNumber(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs font-semibold focus:outline-none"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="published">Đã xuất bản (Published)</option>
            <option value="draft">Bản nháp (Draft)</option>
          </select>
        </div>
      </div>

      {/* Main Pages Table */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#B88746] animate-spin" />
            <span className="text-xs text-[#8C7A6B]">Đang tải danh sách chuyên trang...</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FBF8F2] flex items-center justify-center mx-auto text-[#B88746]">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#1F1B16]">Không tìm thấy chuyên trang nào</h4>
            <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">Bạn chưa tạo chuyên trang nào hoặc bộ lọc không khớp với kết quả nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB]/60 text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                  <th className="px-6 py-4">Tiêu đề Chuyên trang</th>
                  <th className="px-6 py-4">Đường dẫn (Slug)</th>
                  <th className="px-6 py-4">Người tạo</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/30 text-sm text-[#1F1B16]">
                {pages.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1F1B16]">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#8C7A6B]">
                      /chuyen-trang/{item.slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#B88746]" />
                        {item.creator?.name || 'Hệ thống'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'published' && (
                          <a
                            href={`/chuyen-trang/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors"
                            title="Xem trang thực tế"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditOpen(item)}
                          className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Xóa trang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="bg-[#FBF8F2] border-t border-[#E8DCCB] px-6 py-4 flex items-center justify-between text-xs font-semibold">
                <span className="text-[#8C7A6B]">Hiển thị trang {meta.current_page}/{meta.last_page} (Tổng {meta.total} trang)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg hover:bg-white transition-all disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    disabled={pageNumber >= meta.last_page}
                    onClick={() => setPageNumber(p => Math.min(meta.last_page, p + 1))}
                    className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg hover:bg-white transition-all disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal (Full Slide-over style for luxury space) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-white h-full flex flex-col shadow-2xl z-10"
            >
              {/* Form Header */}
              <div className="px-6 py-4 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    {editingItem ? `Chỉnh sửa: ${editingItem.title}` : 'Tạo Chuyên trang Mới'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">Thiết kế nội dung trang tĩnh và cấu hình chuẩn SEO</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-[#E8DCCB]/60 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-[#1F1B16]" />
                </button>
              </div>

              {/* Form Tab selectors */}
              <div className="flex bg-[#FBF8F2] border-b border-[#E8DCCB] px-6 select-none gap-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('content')}
                  className={`flex items-center gap-1.5 px-4 py-3 font-semibold border-b-2 transition-all ${
                    activeFormTab === 'content'
                      ? 'border-[#B88746] text-[#B88746]'
                      : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Nội dung trang
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('seo')}
                  className={`flex items-center gap-1.5 px-4 py-3 font-semibold border-b-2 transition-all ${
                    activeFormTab === 'seo'
                      ? 'border-[#B88746] text-[#B88746]'
                      : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Cấu hình SEO Meta
                </button>
              </div>

              {/* Form Body - scrollable area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* TAB 1: CONTENT */}
                {activeFormTab === 'content' && (
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Tiêu đề trang <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full px-4 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:border-[#B88746] font-semibold text-[#1F1B16]"
                          placeholder="Ví dụ: Chính sách Bảo mật"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Đường dẫn tĩnh (Slug) <span className="text-red-500">*</span></label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#E8DCCB] bg-[#E8DCCB]/20 text-xs text-[#8C7A6B] font-mono">
                            /chuyen-trang/
                          </span>
                          <input
                            type="text"
                            required
                            value={formSlug}
                            onChange={(e) => {
                              setFormSlug(e.target.value);
                              setIsSlugManuallyEdited(true);
                            }}
                            className="flex-1 px-4 py-2.5 border border-[#E8DCCB] rounded-r-xl bg-[#FBF8F2] text-sm focus:outline-none focus:border-[#B88746] font-mono text-xs"
                            placeholder="chinh-sach-bao-mat"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status & Options */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Trạng thái trang</label>
                      <div className="flex gap-4">
                        {[
                          { value: 'published', label: 'Xuất bản công khai (Published)', desc: 'Mọi người đều có thể truy cập qua URL.' },
                          { value: 'draft', label: 'Lưu nháp (Draft)', desc: 'Chỉ ban quản trị mới có thể xem trước nội dung.' }
                        ].map((opt) => (
                          <label key={opt.value} className="flex-1 border border-[#E8DCCB] rounded-xl p-3 bg-[#FBF8F2]/60 hover:bg-[#FBF8F2] transition-colors cursor-pointer flex items-start gap-3">
                            <input
                              type="radio"
                              name="page_status"
                              checked={formStatus === opt.value}
                              onChange={() => setFormStatus(opt.value as any)}
                              className="mt-1 accent-[#B88746]"
                            />
                            <div>
                              <span className="text-sm font-semibold text-[#1F1B16] block">{opt.label}</span>
                              <span className="text-[11px] text-[#8C7A6B]">{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rich text Editor */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Nội dung trang</label>
                      <div className="border border-[#E8DCCB] rounded-xl overflow-hidden bg-[#FBF8F2] min-h-[400px]">
                        <RichTextEditor
                          value={formContent}
                          onChange={setFormContent}
                          placeholder="Thiết kế nội dung chi tiết của trang (dùng thanh công cụ phía trên để định dạng chữ, chèn hình ảnh từ Thư viện Media, chèn link...)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SEO META */}
                {activeFormTab === 'seo' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 text-xs">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <h5 className="font-bold">Cấu hình SEO Meta</h5>
                        <p className="mt-0.5 text-amber-700 leading-relaxed">
                          Hệ thống sẽ tự động điền tiêu đề và mô tả SEO mặc định nếu bạn để trống. Điền thủ công ở đây giúp bạn tinh chỉnh từ khóa chuẩn xác cho Google Search, tối ưu thứ hạng hiển thị.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Thẻ tiêu đề SEO (SEO Title)</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full px-4 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:border-[#B88746]"
                          placeholder={formTitle || "Nhập tiêu đề trang hiển thị trên Google..."}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Thẻ mô tả SEO (SEO Description)</label>
                        <textarea
                          rows={4}
                          value={seoDesc}
                          onChange={(e) => setSeoDesc(e.target.value)}
                          className="w-full px-4 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:border-[#B88746] resize-none"
                          placeholder="Mô tả tóm tắt nội dung trang dưới 160 ký tự..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider mb-2">Từ khóa SEO (SEO Keywords)</label>
                        <input
                          type="text"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          className="w-full px-4 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:border-[#B88746]"
                          placeholder="Ví dụ: chinh sach bao mat, dieu khoan su dung, masterise homes"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t border-[#E8DCCB] flex justify-end gap-3 bg-[#FBF8F2] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DCCB] hover:bg-[#E8DCCB]/20 rounded-xl text-xs font-bold transition-all text-[#1F1B16]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !formTitle || !formSlug}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu Chuyên trang'
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
