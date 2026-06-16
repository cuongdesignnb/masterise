'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Handshake,
  Plus,
  Edit,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminPartners() {
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);

  // Query
  const { data: partnersData, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const response = await api.get<Partner[]>('/partners');
      return response;
    },
  });

  // Open Form for Create
  const handleCreateOpen = () => {
    setEditingItem(null);
    setFormName('');
    setFormLogoUrl('');
    setFormWebsiteUrl('');
    setFormSortOrder(0);
    setFormIsActive(true);
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleEditOpen = (item: Partner) => {
    setEditingItem(item);
    setFormName(item.name || '');
    setFormLogoUrl(item.logo_url || '');
    setFormWebsiteUrl(item.website_url || '');
    setFormSortOrder(item.sort_order || 0);
    setFormIsActive(item.is_active ?? true);
    setIsFormOpen(true);
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formName,
        logo_url: formLogoUrl,
        website_url: formWebsiteUrl,
        sort_order: Number(formSortOrder),
        is_active: formIsActive,
      };

      if (editingItem) {
        return api.put(`/partners/${editingItem.id}`, payload);
      } else {
        return api.post('/partners', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      setIsFormOpen(false);
      alert(editingItem ? 'Đã cập nhật đối tác thành công!' : 'Đã tạo đối tác thành công!');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi lưu đối tác.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      alert('Đã xóa đối tác thành công.');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xóa đối tác.');
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tác này?')) {
      deleteMutation.mutate(id);
    }
  };

  const partners = partnersData?.data || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Đối tác</h1>
          <p className="text-sm text-[#8C7A6B]">Đối tác chiến lược trên trang chủ Masterise Homes</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm đối tác
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : partners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Chưa có đối tác nào. Hãy thêm đối tác mới.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Logo & Tên</th>
                  <th className="px-6 py-4">Website</th>
                  <th className="px-6 py-4">Thứ tự</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {partners.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-[#FBF8F2] border border-[#E8DCCB]/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.logo_url ? (
                            <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Handshake className="w-5 h-5 text-[#B88746]/40" />
                          )}
                        </div>
                        <span className="font-semibold text-[#1F1B16]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.website_url ? (
                        <a
                          href={item.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#B88746] hover:underline text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {item.website_url.replace(/^https?:\/\//, '').slice(0, 30)}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-[#1F1B16]">{item.sort_order}</span>
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
                        title="Sửa đối tác"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center"
                        title="Xóa đối tác"
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
                    {editingItem ? 'Sửa đối tác' : 'Thêm đối tác mới'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">Điền thông tin đối tác chiến lược</p>
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
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên đối tác *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="Tên công ty đối tác"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">URL logo</label>
                  <input
                    type="text"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="https://example.com/logo.png"
                  />
                  {formLogoUrl && (
                    <div className="mt-2 w-24 h-16 rounded-xl border border-[#E8DCCB] overflow-hidden bg-[#FBF8F2] flex items-center justify-center">
                      <img src={formLogoUrl} alt="Preview" className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">URL website</label>
                  <input
                    type="text"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="https://partner-website.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Thứ tự sắp xếp</label>
                    <input
                      type="number"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    />
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
