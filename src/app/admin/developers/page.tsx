'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin,
  Globe,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Developer {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  hotline: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  projects_count?: number;
  created_at: string;
}

export default function AdminDevelopers() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formHotline, setFormHotline] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Query developers
  const { data: developersData, isLoading } = useQuery({
    queryKey: ['admin-developers', search, statusFilter, page],
    queryFn: async () => {
      let url = `/developers?q=${search}&page=${page}&per_page=10`;
      if (statusFilter !== '') {
        url += `&is_active=${statusFilter === 'active'}`;
      }
      const response = await api.get<Developer[]>(url);
      return response;
    },
  });

  const developers = developersData?.data || [];
  const meta = developersData?.meta;

  // Open Create Modal
  const handleCreateOpen = () => {
    setEditingDeveloper(null);
    setFormName('');
    setFormSlug('');
    setFormLogo('');
    setFormDescription('');
    setFormWebsite('');
    setFormHotline('');
    setFormEmail('');
    setFormAddress('');
    setFormIsActive(true);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleEditOpen = (dev: Developer) => {
    setEditingDeveloper(dev);
    setFormName(dev.name);
    setFormSlug(dev.slug);
    setFormLogo(dev.logo || '');
    setFormDescription(dev.description || '');
    setFormWebsite(dev.website || '');
    setFormHotline(dev.hotline || '');
    setFormEmail(dev.email || '');
    setFormAddress(dev.address || '');
    setFormIsActive(dev.is_active);
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveDeveloperMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formName,
        slug: formSlug || undefined,
        logo: formLogo || null,
        description: formDescription || null,
        website: formWebsite || null,
        hotline: formHotline || null,
        email: formEmail || null,
        address: formAddress || null,
        is_active: formIsActive,
      };

      if (editingDeveloper) {
        return api.put(`/developers/${editingDeveloper.id}`, payload);
      } else {
        return api.post('/developers', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-developers'] });
      setIsFormOpen(false);
      toast.success(editingDeveloper ? 'Đã cập nhật thông tin chủ đầu tư!' : 'Đã thêm chủ đầu tư mới!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi lưu thông tin chủ đầu tư.');
    }
  });

  // Delete Mutation
  const deleteDeveloperMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/developers/${id}`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-developers'] });
      toast.success(response.message || 'Đã xóa chủ đầu tư thành công.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể xóa chủ đầu tư (có thể do đang liên kết với dự án).');
    }
  });

  const handleDeleteDeveloper = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chủ đầu tư "${name}"? Thao tác này sẽ bị chặn nếu chủ đầu tư có các dự án đi kèm.`)) {
      deleteDeveloperMutation.mutate(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning('Vui lòng nhập tên chủ đầu tư.');
      return;
    }
    saveDeveloperMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Chủ đầu tư</h1>
          <p className="text-sm text-[#8C7A6B]">Xem, cấu hình và cập nhật danh sách chủ đầu tư bất động sản cao cấp trong hệ thống</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm chủ đầu tư mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, địa chỉ, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746] bg-[#FBF8F2]/30 text-[#1F1B16] placeholder-[#8C7A6B]/60"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none bg-white text-[#1F1B16] min-w-[150px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Khóa/Ẩn</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-12 text-center">
          <div className="w-10 h-10 border-4 border-[#B88746] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#8C7A6B]">Đang tải danh sách chủ đầu tư...</p>
        </div>
      ) : developers.length === 0 ? (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-12 text-center">
          <Award className="w-12 h-12 text-[#8C7A6B]/40 mx-auto mb-4" />
          <h3 className="font-heading font-medium text-[#1F1B16] text-lg mb-1">Không tìm thấy chủ đầu tư nào</h3>
          <p className="text-sm text-[#8C7A6B] max-w-md mx-auto">Vui lòng điều chỉnh điều kiện lọc hoặc thêm chủ đầu tư mới để quản lý.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Chủ đầu tư</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Địa chỉ & Website</th>
                  <th className="px-6 py-4 text-center">Dự án</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/50 text-sm text-[#1F1B16]">
                {developers.map((dev) => (
                  <tr key={dev.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#FBF8F2] border border-[#E8DCCB] overflow-hidden flex items-center justify-center shrink-0">
                          {dev.logo ? (
                            <img src={dev.logo} alt={dev.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Award className="w-6 h-6 text-[#B88746]" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base text-[#1F1B16]">{dev.name}</h4>
                          <span className="text-xs text-[#8C7A6B] font-mono">{dev.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {dev.hotline && (
                        <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B]">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{dev.hotline}</span>
                        </div>
                      )}
                      {dev.email && (
                        <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B]">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{dev.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {dev.address && (
                        <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B] max-w-[250px]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{dev.address}</span>
                        </div>
                      )}
                      {dev.website && (
                        <a 
                          href={dev.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#B88746] hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[180px]">{dev.website.replace(/^https?:\/\//i, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FBF8F2] border border-[#E8DCCB] text-[#B88746] rounded-full text-xs font-semibold">
                        <Building className="w-3.5 h-3.5" />
                        {dev.projects_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {dev.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(dev)}
                          className="p-1.5 bg-[#FBF8F2] border border-[#E8DCCB] text-[#8C7A6B] hover:text-[#B88746] rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeveloper(dev.id, dev.name)}
                          className="p-1.5 bg-red-50 border border-red-150 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="bg-[#FBF8F2] border-t border-[#E8DCCB] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[#8C7A6B]">
                Hiển thị trang {meta.current_page}/{meta.last_page} (Tổng {meta.total} chủ đầu tư)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-white border border-[#E8DCCB] rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FBF8F2]"
                >
                  Trước
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-white border border-[#E8DCCB] rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FBF8F2]"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Drawer / Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E8DCCB]"
            >
              {/* Drawer Header */}
              <div className="h-20 border-b border-[#E8DCCB] flex items-center justify-between px-6 bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    {editingDeveloper ? 'Cập nhật Chủ đầu tư' : 'Thêm Chủ đầu tư'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">Cấu hình thông tin đại diện của chủ đầu tư</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 border border-[#E8DCCB] rounded-lg hover:bg-white text-[#8C7A6B] hover:text-[#1F1B16] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable Form) */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Tên chủ đầu tư <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Masterise Homes, Vinhomes..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Slug (Đường dẫn tĩnh)
                  </label>
                  <input
                    type="text"
                    placeholder="Để trống để tự động sinh theo tên"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746] font-mono text-xs"
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="VD: /uploads/logos/masterise.png"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746] text-xs font-mono"
                  />
                  <p className="text-xxs text-[#8C7A6B]/80 mt-1">Upload logo trong Thư viện Media trước rồi copy link dán vào đây.</p>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="VD: https://masterise-homes.net.vn"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                  />
                </div>

                {/* Hotline & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                      Hotline
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 028 3915 9159"
                      value={formHotline}
                      onChange={(e) => setFormHotline(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="VD: contact@masterise.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Địa chỉ văn phòng
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Tòa nhà Masterise, Quận 1, TPHCM"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Mô tả / Giới thiệu
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Giới thiệu sơ lược lịch sử, thành tựu của chủ đầu tư..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746] resize-none"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1B16]">
                      Trạng thái hiển thị
                    </label>
                    <span className="text-xxs text-[#8C7A6B]">Cho phép hiển thị trên các bộ lọc và dropdown dự án</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formIsActive ? 'bg-[#B88746]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="h-20 border-t border-[#E8DCCB] flex items-center justify-end gap-3 px-6 bg-[#FBF8F2]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-[#E8DCCB] bg-white text-sm font-semibold rounded-xl text-[#8C7A6B] hover:text-[#1F1B16] hover:bg-gray-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={saveDeveloperMutation.isPending}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {saveDeveloperMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingDeveloper ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
