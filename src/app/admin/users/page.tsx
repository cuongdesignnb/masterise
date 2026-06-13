'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Shield, 
  Lock, 
  UserCheck, 
  UserX,
  Mail,
  Phone
} from 'lucide-react';

interface ExtendedUser extends User {
  role_names: string[];
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('sale');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'suspended'>('active');

  // Query users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, statusFilter, page],
    queryFn: async () => {
      let url = `/users?q=${search}&page=${page}&per_page=12`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get<ExtendedUser[]>(url);
      return response;
    },
  });

  const users = usersData?.data || [];
  const meta = usersData?.meta;

  const rolesList = [
    { key: 'super_admin', label: 'Super Admin' },
    { key: 'admin', label: 'Admin' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'sale_manager', label: 'Sales Manager' },
    { key: 'sale', label: 'Sales Consultant' },
    { key: 'customer', label: 'Khách hàng (Customer)' },
  ];

  // Open Create Modal
  const handleCreateOpen = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('sale');
    setFormStatus('active');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleEditOpen = (u: ExtendedUser) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phone || '');
    setFormPassword('');
    setFormRole(u.role_names[0] || 'sale');
    setFormStatus(u.status);
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveUserMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        status: formStatus,
      };

      if (formPassword) {
        payload.password = formPassword;
      }

      if (editingUser) {
        return api.put(`/users/${editingUser.id}`, payload);
      } else {
        payload.password = formPassword || '123456'; // Default password if empty
        return api.post('/users', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsFormOpen(false);
      alert(editingUser ? 'Đã cập nhật thông tin thành viên!' : 'Đã tạo tài khoản thành viên mới!');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi lưu thông tin người dùng.');
    }
  });

  // Delete/Suspend Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/users/${id}`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert(response.message || 'Đã xóa thành viên thành công.');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xóa thành viên.');
    }
  });

  const handleDeleteUser = (id: number, name: string) => {
    if (id === currentUser?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}"? Nếu người dùng có lịch sử leads/lịch hẹn, tài khoản sẽ được Khóa thay vì xóa cứng.`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'admin':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'marketing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sale_manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'sale':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Thành viên</h1>
          <p className="text-sm text-[#8C7A6B]">Quản lý nhân viên nội bộ, phân quyền vai trò và giám sát tài khoản khách hàng</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm thành viên mới
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
            placeholder="Tìm theo tên, email, sđt..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-9 pr-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          >
            <option value="">Tất cả vai trò</option>
            {rolesList.map(r => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Chưa kích hoạt</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Không tìm thấy thành viên nào khớp bộ lọc.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Tên thành viên</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Vai trò (Role)</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {users.map((u) => {
                  const roleName = u.role_names?.[0] || 'customer';
                  const roleLabel = rolesList.find(r => r.key === roleName)?.label || 'Customer';
                  
                  return (
                    <tr key={u.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center font-bold text-base border border-[#B88746]/20">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-semibold text-[#1F1B16]">{u.name}</span>
                            {u.id === currentUser?.id && (
                              <span className="text-[9px] bg-[#B88746]/10 text-[#B88746] px-1.5 py-0.5 rounded font-extrabold uppercase">
                                Tài khoản của bạn
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-0.5">
                        <div className="text-[#1F1B16] flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#8C7A6B]" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="text-[#8C7A6B] flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#8C7A6B]" /> {u.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadge(roleName)}`}>
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                          u.status === 'inactive' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {u.status === 'active' ? 'Hoạt động' :
                           u.status === 'inactive' ? 'Chưa kích hoạt' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#8C7A6B]">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleEditOpen(u)}
                          className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors inline-flex items-center"
                          title="Sửa thành viên"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={u.id === currentUser?.id}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center disabled:opacity-30"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="bg-[#FBF8F2] border-t border-[#E8DCCB] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[#8C7A6B]">
                Hiển thị trang {page} / {meta.last_page} (Tổng số {meta.total} thành viên)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-xl text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50 transition-colors"
                >
                  Trước
                </button>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-xl text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full flex flex-col z-10 shadow-2xl border-l border-[#E8DCCB] text-[#1F1B16] font-body"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    {editingUser ? `Sửa tài khoản: ${editingUser.name}` : 'Thêm thành viên nhân sự mới'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Tạo tài khoản và gán vai trò quyền hạn cho nhân sự
                  </p>
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
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="example@masterise.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder="Ví dụ: 0987654321"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
                    {editingUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu đăng nhập *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    placeholder={editingUser ? 'Nhập mật khẩu mới...' : 'Mật khẩu bảo mật tối thiểu 6 ký tự'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Vai trò hệ thống *</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    >
                      {rolesList.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trạng thái tài khoản *</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="inactive">Chưa kích hoạt (Inactive)</option>
                      <option value="suspended">Khóa tài khoản (Suspended)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DCCB] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => saveUserMutation.mutate()}
                  disabled={saveUserMutation.isPending || !formName || !formEmail || !formPhone}
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {saveUserMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Lưu tài khoản
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
