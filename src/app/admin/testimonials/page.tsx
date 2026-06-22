'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  X,
  Star,
} from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar_url: string;
  rating: number;
  is_active: boolean;
}

export default function AdminTestimonials() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formIsActive, setFormIsActive] = useState(true);

  // Query
  const { data: testimonialsData, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const response = await api.get<Testimonial[]>('/testimonials');
      return response;
    },
  });

  // Open Form for Create
  const handleCreateOpen = () => {
    setEditingItem(null);
    setFormName('');
    setFormRole('');
    setFormContent('');
    setFormAvatarUrl('');
    setFormRating(5);
    setFormIsActive(true);
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleEditOpen = (item: Testimonial) => {
    setEditingItem(item);
    setFormName(item.name || '');
    setFormRole(item.role || '');
    setFormContent(item.content || '');
    setFormAvatarUrl(item.avatar_url || '');
    setFormRating(item.rating || 5);
    setFormIsActive(item.is_active ?? true);
    setIsFormOpen(true);
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formName,
        role: formRole,
        content: formContent,
        avatar_url: formAvatarUrl,
        rating: Number(formRating),
        is_active: formIsActive,
      };

      if (editingItem) {
        return api.put(`/testimonials/${editingItem.id}`, payload);
      } else {
        return api.post('/testimonials', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setIsFormOpen(false);
      toast.success(editingItem ? 'Đã cập nhật nhận xét thành công!' : 'Đã tạo nhận xét thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi lưu nhận xét.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast.success('Đã xóa nhận xét thành công.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi xóa nhận xét.');
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhận xét này?')) {
      deleteMutation.mutate(id);
    }
  };

  const testimonials = testimonialsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Nhận xét</h1>
          <p className="text-sm text-[#8C7A6B]">Nhận xét từ khách hàng trên trang chủ Masterise Homes</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm nhận xét
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Chưa có nhận xét nào. Hãy thêm nhận xét mới.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Nội dung</th>
                  <th className="px-6 py-4">Đánh giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {testimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FBF8F2] border border-[#E8DCCB]/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-[#B88746]/40" />
                          )}
                        </div>
                        <span className="font-semibold text-[#1F1B16]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#8C7A6B]">{item.role || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#8C7A6B] block max-w-xs truncate" title={item.content}>
                        {item.content}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= item.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {item.is_active ? 'Hoạt động' : 'Tắt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleEditOpen(item)}
                        className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors inline-flex items-center"
                        title="Sửa nhận xét"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center"
                        title="Xóa nhận xét"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Slide Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            />

            {/* Form Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl bg-white h-full flex flex-col z-10 shadow-2xl border-l border-[#E8DCCB] text-[#1F1B16]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    {editingItem ? 'Sửa nhận xét' : 'Thêm nhận xét mới'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">Điền thông tin nhận xét từ khách hàng</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-[#E8DCCB]/40 text-[#8C7A6B] hover:text-[#1F1B16] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Họ tên *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Vai trò</label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                      placeholder="Chủ căn hộ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung *</label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="Nhận xét của khách hàng..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">URL ảnh đại diện</label>
                  <input
                    type="text"
                    value={formAvatarUrl}
                    onChange={(e) => setFormAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {formAvatarUrl && (
                    <div className="mt-2 w-16 h-16 rounded-full border border-[#E8DCCB] overflow-hidden bg-[#FBF8F2]">
                      <img src={formAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Đánh giá *</label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    >
                      {[1, 2, 3, 4, 5].map((v) => (
                        <option key={v} value={v}>
                          {v} sao
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formIsActive ? 'bg-[#B88746]' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formIsActive ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm text-[#1F1B16]">{formIsActive ? 'Hoạt động' : 'Tắt'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#E8DCCB] bg-[#FBF8F2] flex justify-end gap-3">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 border border-[#E8DCCB] text-[#8C7A6B] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
