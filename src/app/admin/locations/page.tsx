'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Building,
  Navigation,
  Compass,
  Map
} from 'lucide-react';

interface LocationItem {
  id: number;
  name: string;
  slug: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  description: string | null;
  projects_count?: number;
  created_at: string;
}

export default function AdminLocations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState('');
  const [formLongitude, setFormLongitude] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Query locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['admin-locations', search, provinceFilter, page],
    queryFn: async () => {
      let url = `/locations?q=${search}&page=${page}&per_page=10`;
      if (provinceFilter) {
        url += `&province=${provinceFilter}`;
      }
      const response = await api.get<LocationItem[]>(url);
      return response;
    },
  });

  const locations = locationsData?.data || [];
  const meta = locationsData?.meta;

  // Open Create Modal
  const handleCreateOpen = () => {
    setEditingLocation(null);
    setFormName('');
    setFormSlug('');
    setFormProvince('');
    setFormDistrict('');
    setFormWard('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
    setFormDescription('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleEditOpen = (loc: LocationItem) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormSlug(loc.slug);
    setFormProvince(loc.province || '');
    setFormDistrict(loc.district || '');
    setFormWard(loc.ward || '');
    setFormAddress(loc.address || '');
    setFormLatitude(loc.latitude ? String(loc.latitude) : '');
    setFormLongitude(loc.longitude ? String(loc.longitude) : '');
    setFormDescription(loc.description || '');
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveLocationMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formName,
        slug: formSlug || undefined,
        province: formProvince || null,
        district: formDistrict || null,
        ward: formWard || null,
        address: formAddress || null,
        latitude: formLatitude ? parseFloat(formLatitude) : null,
        longitude: formLongitude ? parseFloat(formLongitude) : null,
        description: formDescription || null,
      };

      if (editingLocation) {
        return api.put(`/locations/${editingLocation.id}`, payload);
      } else {
        return api.post('/locations', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      setIsFormOpen(false);
      toast.success(editingLocation ? 'Đã cập nhật thông tin vị trí!' : 'Đã thêm vị trí khu vực mới!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi lưu thông tin vị trí.');
    }
  });

  // Delete Mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/locations/${id}`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      toast.success(response.message || 'Đã xóa vị trí thành công.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể xóa vị trí khu vực (có thể do đang liên kết với dự án).');
    }
  });

  const handleDeleteLocation = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vị trí "${name}"? Thao tác này sẽ bị chặn nếu vị trí có các dự án đi kèm.`)) {
      deleteLocationMutation.mutate(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning('Vui lòng nhập tên vị trí/dự án khu vực.');
      return;
    }
    saveLocationMutation.mutate();
  };

  const provincesList = [
    'Thành phố Hồ Chí Minh',
    'Thành phố Hà Nội',
    'Tỉnh Bình Dương',
    'Tỉnh Đồng Nai',
    'Tỉnh Bà Rịa - Vũng Tàu',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Vị trí địa lý</h1>
          <p className="text-sm text-[#8C7A6B]">Xem, cấu hình và cập nhật danh sách vị trí, địa phương và khu vực của các dự án bất động sản</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm vị trí mới
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
            placeholder="Tìm theo tên, quận huyện, địa chỉ..."
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
            value={provinceFilter}
            onChange={(e) => {
              setProvinceFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none bg-white text-[#1F1B16] min-w-[200px]"
          >
            <option value="">Tất cả tỉnh thành</option>
            {provincesList.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-12 text-center">
          <div className="w-10 h-10 border-4 border-[#B88746] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#8C7A6B]">Đang tải danh sách vị trí...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-12 text-center">
          <MapPin className="w-12 h-12 text-[#8C7A6B]/40 mx-auto mb-4" />
          <h3 className="font-heading font-medium text-[#1F1B16] text-lg mb-1">Không tìm thấy vị trí nào</h3>
          <p className="text-sm text-[#8C7A6B] max-w-md mx-auto">Vui lòng điều chỉnh điều kiện lọc hoặc tạo vị trí mới.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Tên Vị Trí / Khu vực</th>
                  <th className="px-6 py-4">Hành chính</th>
                  <th className="px-6 py-4">Địa chỉ chi tiết</th>
                  <th className="px-6 py-4">Tọa độ GPS</th>
                  <th className="px-6 py-4 text-center">Dự án</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/50 text-sm text-[#1F1B16]">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-semibold text-base text-[#1F1B16] flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#B88746]" />
                          {loc.name}
                        </h4>
                        <span className="text-xs text-[#8C7A6B] font-mono pl-5">{loc.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <div className="font-medium">{loc.province || 'Chưa rõ tỉnh thành'}</div>
                      <div className="text-xs text-[#8C7A6B]">
                        {loc.district ? `${loc.district}` : ''}
                        {loc.ward ? `, ${loc.ward}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-[#8C7A6B] text-xs">
                      {loc.address || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {loc.latitude && loc.longitude ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B] font-mono">
                          <Compass className="w-3.5 h-3.5 text-[#B88746] shrink-0" />
                          <span>{parseFloat(String(loc.latitude)).toFixed(5)}, {parseFloat(String(loc.longitude)).toFixed(5)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#8C7A6B]/50 font-mono">Chưa cấu hình</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FBF8F2] border border-[#E8DCCB] text-[#B88746] rounded-full text-xs font-semibold">
                        <Building className="w-3.5 h-3.5" />
                        {loc.projects_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(loc)}
                          className="p-1.5 bg-[#FBF8F2] border border-[#E8DCCB] text-[#8C7A6B] hover:text-[#B88746] rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id, loc.name)}
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
                Hiển thị trang {meta.current_page}/{meta.last_page} (Tổng {meta.total} khu vực vị trí)
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
                    {editingLocation ? 'Cập nhật Vị trí' : 'Thêm Vị trí'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">Cấu hình khu vực địa lý cho các dự án</p>
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
                    Tên vị trí / khu vực <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Grand Marina Saigon, Masteri Centre Point..."
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

                {/* Province */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Tỉnh / Thành phố
                  </label>
                  <select
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746] bg-white text-[#1F1B16]"
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provincesList.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                {/* District & Ward */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                      Quận / Huyện
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Quận 1, Tp. Thủ Đức"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                      Phường / Xã
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Phường Bến Nghé"
                      value={formWard}
                      onChange={(e) => setFormWard(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Địa chỉ chi tiết (Số nhà, đường...)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Số 2 Tôn Đức Thắng"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746]"
                  />
                </div>

                {/* GPS Coordinates */}
                <div className="grid grid-cols-2 gap-4 bg-[#FBF8F2] border border-[#E8DCCB] p-3 rounded-xl">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1F1B16]">
                      <Navigation className="w-3 h-3 text-[#B88746]" /> Vĩ độ (Latitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="VD: 10.78216"
                      value={formLatitude}
                      onChange={(e) => setFormLatitude(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1F1B16]">
                      <Navigation className="w-3 h-3 text-[#B88746] rotate-90" /> Kinh độ (Longitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="VD: 106.70588"
                      value={formLongitude}
                      onChange={(e) => setFormLongitude(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Mô tả / Ghi chú khu vực
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả hạ tầng, kết nối giao thông, tiện ích vùng..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] focus:border-[#B88746] resize-none"
                  />
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
                  disabled={saveLocationMutation.isPending}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {saveLocationMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingLocation ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
