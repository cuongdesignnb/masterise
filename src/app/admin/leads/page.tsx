'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Lead, User } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ClipboardList, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  X, 
  ChevronRight, 
  Plus, 
  UserCheck 
} from 'lucide-react';

export default function LeadManager() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // Selected lead for detail view
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  // Note form state
  const [newNote, setNewNote] = useState('');

  const isAdminOrManager = hasRole(['super_admin', 'admin', 'sale_manager']);

  // Fetch leads list
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', search, statusFilter, typeFilter, page],
    queryFn: async () => {
      let url = `/leads?q=${search}&page=${page}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      const response = await api.get<Lead[]>(url);
      return response;
    },
  });

  // Fetch single lead details (when selected)
  const { data: leadDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['lead', selectedLeadId],
    queryFn: async () => {
      if (!selectedLeadId) return null;
      const response = await api.get<Lead>(`/leads/${selectedLeadId}`);
      return response.data;
    },
    enabled: !!selectedLeadId,
  });

  // Fetch sales agents (for assignment)
  const { data: agents = [] } = useQuery({
    queryKey: ['sales-agents'],
    queryFn: async () => {
      if (!isAdminOrManager) return [];
      const response = await api.get<User[]>('/users/sales');
      return response.data;
    },
    enabled: isAdminOrManager,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return api.patch(`/leads/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] });
    },
  });

  // Assign agent mutation
  const assignMutation = useMutation({
    mutationFn: async ({ id, agentId }: { id: number; agentId: number }) => {
      return api.patch(`/leads/${id}/assign`, { agent_id: agentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      return api.post(`/leads/${id}/notes`, { note });
    },
    onSuccess: () => {
      setNewNote('');
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] });
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLeadId) return;
    addNoteMutation.mutate({ id: selectedLeadId, note: newNote });
  };

  const leads = leadsData?.data || [];
  const meta = leadsData?.meta;

  return (
    <div className="space-y-6 relative min-h-[500px]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Leads (CRM)</h1>
        <p className="text-sm text-[#8C7A6B]">Xem thông tin liên hệ của khách hàng, cập nhật trạng thái tư vấn và phân bổ công việc</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, sđt, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-9 pr-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="consulting">Đang tư vấn</option>
            <option value="closed">Đã chốt (Thành công)</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          >
            <option value="">Tất cả loại hình</option>
            <option value="contact">Liên hệ chung</option>
            <option value="consultation">Đăng ký tư vấn</option>
            <option value="download_brochure">Tải brochure</option>
            <option value="newsletter">Nhận tin tức</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-32 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Không tìm thấy khách hàng (lead) nào khớp với bộ lọc.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Thông tin liên hệ</th>
                  <th className="px-6 py-4">Nhu cầu tư vấn</th>
                  <th className="px-6 py-4">Phân bổ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1F1B16]">{lead.name}</td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div className="text-[#1F1B16]">{lead.phone}</div>
                      <div className="text-[#8C7A6B]">{lead.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div>
                        <span className="font-semibold text-[#B88746] bg-[#B88746]/5 px-2 py-0.5 rounded border border-[#B88746]/10 uppercase tracking-wider text-[10px]">
                          {lead.type === 'contact' ? 'Liên hệ' : lead.type === 'consultation' ? 'Tư vấn' : lead.type === 'download_brochure' ? 'Tài liệu' : 'Newsletter'}
                        </span>
                      </div>
                      {lead.project && <div className="text-[#8C7A6B]">Dự án: {lead.project.name}</div>}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8C7A6B]">
                      {lead.agent ? `👨‍💼 ${lead.agent.name}` : '❌ Chưa phân công'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        lead.status === 'new' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        lead.status === 'contacted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        lead.status === 'consulting' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        lead.status === 'closed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {lead.status === 'new' ? 'Mới' :
                         lead.status === 'contacted' ? 'Đã liên hệ' :
                         lead.status === 'consulting' ? 'Đang tư vấn' :
                         lead.status === 'closed' ? 'Đã chốt' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors inline-flex items-center"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {meta && meta.last_page > 1 && (
            <div className="bg-[#FBF8F2] border-t border-[#E8DCCB] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[#8C7A6B]">
                Tổng cộng {meta.total} Leads
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRM Details Slide-over Drawer */}
      <AnimatePresence>
        {selectedLeadId && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadId(null)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 border-l border-[#E8DCCB]"
            >
              {/* Header */}
              <div className="h-16 border-b border-[#E8DCCB] px-6 flex items-center justify-between shrink-0">
                <h3 className="font-heading font-medium text-lg text-[#1F1B16]">Chi tiết khách hàng</h3>
                <button
                  onClick={() => setSelectedLeadId(null)}
                  className="p-1.5 border border-[#E8DCCB] rounded-lg text-[#8C7A6B] hover:text-[#1F1B16]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {detailsLoading ? (
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-50 animate-pulse rounded-xl" />
                    <div className="h-48 bg-gray-50 animate-pulse rounded-xl" />
                  </div>
                ) : leadDetails ? (
                  <div className="space-y-6">
                    {/* Basic Info Block */}
                    <div className="p-4 bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl space-y-2.5">
                      <h4 className="text-base font-bold text-[#1F1B16]">{leadDetails.name}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-[#8C7A6B]">Số điện thoại:</div>
                        <div className="text-[#1F1B16] font-semibold">{leadDetails.phone}</div>
                        <div className="text-[#8C7A6B]">Email:</div>
                        <div className="text-[#1F1B16]">{leadDetails.email || 'Không có'}</div>
                        <div className="text-[#8C7A6B]">Ngày đăng ký:</div>
                        <div className="text-[#1F1B16]">{new Date(leadDetails.created_at).toLocaleString('vi-VN')}</div>
                      </div>
                      {leadDetails.message && (
                        <div className="pt-2 border-t border-[#E8DCCB] text-xs text-[#8C7A6B] leading-relaxed">
                          <span className="font-semibold text-[#1F1B16]">Tin nhắn khách gửi:</span> {leadDetails.message}
                        </div>
                      )}
                    </div>

                    {/* Quick CRM Controls */}
                    <div className="space-y-4">
                      {/* Status select */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Cập nhật trạng thái</label>
                        <select
                          value={leadDetails.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: leadDetails.id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                          className="w-full px-3 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="new">Mới (Chưa xử lý)</option>
                          <option value="contacted">Đã liên hệ sơ bộ</option>
                          <option value="consulting">Đang tư vấn chuyên sâu</option>
                          <option value="closed">Đã chốt giao dịch</option>
                          <option value="cancelled">Hủy tư vấn</option>
                        </select>
                      </div>

                      {/* Agent assignment select */}
                      {isAdminOrManager && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Phân công chuyên viên</label>
                          <select
                            value={leadDetails.assigned_to || ''}
                            onChange={(e) => assignMutation.mutate({ id: leadDetails.id, agentId: parseInt(e.target.value) })}
                            disabled={assignMutation.isPending}
                            className="w-full px-3 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          >
                            <option value="">-- Chọn sale phụ trách --</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name} ({agent.phone || 'N/A'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* CRM Notes Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider block">Lịch sử tư vấn (Notes)</h4>
                      
                      {/* Notes list */}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {leadDetails.notes && leadDetails.notes.length === 0 ? (
                          <p className="text-xs text-[#8C7A6B] italic">Chưa có ghi chú nào được lưu.</p>
                        ) : (
                          leadDetails.notes?.map((note) => (
                            <div key={note.id} className="p-3 bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl text-xs space-y-1.5">
                              <div className="flex justify-between items-center text-[#8C7A6B]">
                                <span className="font-semibold text-[#1F1B16]">{note.user?.name || 'Admin'}</span>
                                <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                              </div>
                              <p className="text-[#1F1B16] leading-relaxed">{note.note}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add note form */}
                      <form onSubmit={handleAddNote} className="space-y-2">
                        <textarea
                          placeholder="Thêm ghi chú tư vấn mới (lưu ý giao dịch, tiến trình gọi điện)..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={3}
                          required
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        />
                        <button
                          type="submit"
                          disabled={addNoteMutation.isPending}
                          className="w-full py-2 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm ghi chú
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
