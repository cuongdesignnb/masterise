'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/admin/Toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Check, 
  X, 
  User, 
  Building, 
  MessageSquare, 
  Phone, 
  Mail,
  Search,
  Filter,
  CheckSquare,
  HelpCircle
} from 'lucide-react';

export default function AdminAppointments() {
  const queryClient = useQueryClient();
  const { hasRole, user: currentUser } = useAuth();
  const toast = useToast();
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  // Selected appointment for detail modal
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Fetch appointments list
  const { data: apptsData, isLoading } = useQuery({
    queryKey: ['admin-appointments', statusFilter, dateFilter, page],
    queryFn: async () => {
      let url = `/appointments?page=${page}&per_page=15`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (dateFilter) url += `&date=${dateFilter}`;
      const response = await api.get<Appointment[]>(url);
      return response;
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return api.patch(`/appointments/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      // Update selected appt if open
      if (selectedAppt && selectedAppt.id === variables.id) {
        setSelectedAppt(prev => prev ? { ...prev, status: variables.status as any } : null);
      }
      
      toast.success('Đã cập nhật trạng thái lịch hẹn thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  });

  const appointments = apptsData?.data || [];
  const meta = apptsData?.meta;

  // Local search filter (since API doesn't support q for appointments)
  const filteredAppointments = appointments.filter(appt => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const clientName = appt.user?.name?.toLowerCase() || '';
    const clientPhone = appt.user?.phone || '';
    const projectName = appt.project?.name?.toLowerCase() || '';
    const agentName = appt.agent?.name?.toLowerCase() || '';
    
    return clientName.includes(s) || clientPhone.includes(s) || projectName.includes(s) || agentName.includes(s);
  });

  // Stats aggregation (from current fetched list, or static quick stats)
  const totalCount = meta?.total || appointments.length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Lịch hẹn tham quan</h1>
        <p className="text-sm text-[#8C7A6B]">
          {hasRole(['super_admin', 'admin', 'sale_manager']) 
            ? 'Quản lý toàn bộ yêu cầu xem nhà mẫu và tham quan dự án của khách hàng' 
            : 'Xem và xác nhận lịch hẹn tham quan được phân công cho bạn'}
        </p>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[#8C7A6B] text-[10px] font-bold uppercase tracking-wider block">Tổng số lịch hẹn</span>
          <h3 className="text-2xl font-bold text-[#1F1B16] mt-2">{totalCount}</h3>
        </div>
        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider block">Chờ xác nhận</span>
          <h3 className="text-2xl font-bold text-amber-700 mt-2">{pendingCount}</h3>
        </div>
        <div className="bg-green-50/50 border border-green-200 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-green-800 text-[10px] font-bold uppercase tracking-wider block">Đã xác nhận</span>
          <h3 className="text-2xl font-bold text-green-700 mt-2">{confirmedCount}</h3>
        </div>
        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-blue-800 text-[10px] font-bold uppercase tracking-wider block">Đã hoàn thành</span>
          <h3 className="text-2xl font-bold text-blue-700 mt-2">{completedCount}</h3>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo khách hàng, dự án, sale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
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
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          />
        </div>
      </div>

      {/* Appointments List Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Không tìm thấy lịch hẹn tham quan nào.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Dự án tham quan</th>
                  <th className="px-6 py-4">Thời gian hẹn</th>
                  <th className="px-6 py-4">Sales phụ trách</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1F1B16]">
                        {appt.user?.name || 'Khách hàng ẩn danh'}
                      </div>
                      <div className="text-[10px] text-[#8C7A6B] space-y-0.5">
                        <div>📞 {appt.user?.phone || 'Chưa cập nhật'}</div>
                        <div>✉️ {appt.user?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1F1B16]">
                        {appt.project?.name || 'Dự án đã xóa'}
                      </div>
                      {appt.project?.location && (
                        <div className="text-[10px] text-[#8C7A6B] truncate max-w-[200px]">
                          📍 {appt.project.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1F1B16] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B88746]" />
                        {new Date(appt.appointment_date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-[10px] text-[#8C7A6B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appt.appointment_time.substring(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8C7A6B]">
                      {appt.agent ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#1F1B16]">
                          👨‍💼 {appt.agent.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Tự động phân bổ lỗi</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        appt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        appt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {appt.status === 'pending' ? 'Chờ duyệt' :
                         appt.status === 'confirmed' ? 'Đã duyệt' :
                         appt.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      {appt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'confirmed' })}
                            disabled={updateStatusMutation.isPending}
                            className="p-1 hover:bg-green-50 text-green-600 rounded-lg transition-colors inline-flex items-center"
                            title="Xác nhận lịch hẹn"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'cancelled' })}
                            disabled={updateStatusMutation.isPending}
                            className="p-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center"
                            title="Hủy lịch hẹn"
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                          </button>
                        </>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'completed' })}
                          disabled={updateStatusMutation.isPending}
                          className="px-2 py-1 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Hoàn thành
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAppt(appt)}
                        className="px-2.5 py-1 border border-[#E8DCCB] hover:bg-[#FBF8F2] text-[#1F1B16] rounded-lg text-xs font-medium transition-colors"
                      >
                        Chi tiết
                      </button>
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
                Hiển thị trang {page} / {meta.last_page} (Tổng số {meta.total} lịch hẹn)
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

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppt(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-[#E8DCCB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl z-10 p-6 space-y-6 text-[#1F1B16] font-body"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-3">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-[#1F1B16]">Chi tiết Lịch hẹn tham quan</h3>
                  <span className="text-[10px] text-[#8C7A6B]">Mã lịch hẹn: #{selectedAppt.id}</span>
                </div>
                <button onClick={() => setSelectedAppt(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge Large */}
              <div className="flex justify-between items-center bg-[#FBF8F2] p-4 rounded-xl border border-[#E8DCCB]/50">
                <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">Trạng thái hiện tại</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  selectedAppt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  selectedAppt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                  selectedAppt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {selectedAppt.status === 'pending' ? 'Chờ duyệt' :
                   selectedAppt.status === 'confirmed' ? 'Đã duyệt' :
                   selectedAppt.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                </span>
              </div>

              {/* Grid Client & Project */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">Thông tin khách hàng</h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-sm">{selectedAppt.user?.name || 'Ẩn danh'}</p>
                    <p className="flex items-center gap-1.5 text-[#8C7A6B]">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedAppt.user?.phone || 'Chưa cập nhật'}
                    </p>
                    <p className="flex items-center gap-1.5 text-[#8C7A6B] truncate">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedAppt.user?.email || '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">Dự án & Thời gian</h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-sm flex items-center gap-1">
                      <Building className="w-4 h-4 text-[#B88746]" />
                      {selectedAppt.project?.name || 'Dự án đã xóa'}
                    </p>
                    <p className="text-[#8C7A6B] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedAppt.appointment_date).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-[#8C7A6B] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedAppt.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              </div>

              {/* CRM Agent assigned */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">Chuyên viên tư vấn được phân công</h4>
                <div className="p-3 border border-[#E8DCCB]/60 bg-[#FBF8F2]/40 rounded-xl text-xs flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center font-bold">
                    {selectedAppt.agent?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedAppt.agent?.name || 'Chưa phân công'}</p>
                    <p className="text-[10px] text-[#8C7A6B]">{selectedAppt.agent?.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">Yêu cầu đặc biệt của khách hàng</h4>
                <div className="p-3 border border-[#E8DCCB]/60 rounded-xl text-xs text-[#1F1B16] bg-[#FBF8F2]/20 min-h-[60px] flex items-start gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#B88746] shrink-0 mt-0.5" />
                  <p className="italic">{selectedAppt.notes || 'Không có ghi chú đặc biệt nào.'}</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 border-t border-[#E8DCCB]/60 pt-4">
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 border border-[#E8DCCB] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Đóng
                </button>
                {selectedAppt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: selectedAppt.id, status: 'cancelled' })}
                      disabled={updateStatusMutation.isPending}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
                    >
                      Hủy lịch hẹn
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: selectedAppt.id, status: 'confirmed' })}
                      disabled={updateStatusMutation.isPending}
                      className="px-4 py-2 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Xác nhận lịch hẹn
                    </button>
                  </>
                )}
                {selectedAppt.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedAppt.id, status: 'completed' })}
                    disabled={updateStatusMutation.isPending}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Hoàn thành tham quan
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
