'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Lead, User } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/admin/Toast';
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
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  Phone,
  FileText,
  DollarSign,
  Activity,
  UserX,
  RefreshCw,
  Eye,
  Hash,
  Layers,
  Sparkles
} from 'lucide-react';

// Status labels & styles
const STATUS_LABELS: Record<string, string> = {
  new: 'Lead mới',
  assigned: 'Đã phân sale',
  called_first_time: 'Đã gọi lần 1',
  no_answer: 'Không nghe máy',
  connected: 'Đã kết nối',
  qualified: 'Có nhu cầu',
  sent_document: 'Đã gửi tài liệu',
  scheduled_visit: 'Đã hẹn xem dự án',
  visited_project: 'Đã đi xem',
  negotiating: 'Đang đàm phán',
  booking: 'Booking',
  deposit: 'Đặt cọc',
  contract_signed: 'Ký hợp đồng',
  lost: 'Mất lead',
  invalid: 'Không hợp lệ',
  reactivated: 'Tái kích hoạt',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  called_first_time: 'bg-blue-50 text-blue-700 border-blue-200',
  no_answer: 'bg-rose-50 text-rose-700 border-rose-200',
  connected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  qualified: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  sent_document: 'bg-sky-50 text-sky-700 border-sky-200',
  scheduled_visit: 'bg-violet-50 text-violet-700 border-violet-200',
  visited_project: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  negotiating: 'bg-orange-50 text-orange-700 border-orange-200',
  booking: 'bg-pink-50 text-pink-700 border-pink-200',
  deposit: 'bg-teal-50 text-teal-700 border-teal-200',
  contract_signed: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  invalid: 'bg-gray-50 text-gray-700 border-gray-200',
  reactivated: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const TEMP_COLORS: Record<string, string> = {
  cold: 'bg-slate-50 text-slate-600 border-slate-200',
  warm: 'bg-sky-50 text-sky-700 border-sky-200',
  hot: 'bg-orange-50 text-orange-700 border-orange-200',
  very_hot: 'bg-red-50 text-red-700 border-red-200',
};

const TEMP_LABELS: Record<string, string> = {
  cold: 'Lạnh (Cold)',
  warm: 'Ấm (Warm)',
  hot: 'Nóng (Hot)',
  very_hot: 'Rất Nóng (Very Hot)',
};

export default function LeadManager() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState('');
  const [demandFilter, setDemandFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Selected lead for detail view
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  // Note form state
  const [newNote, setNewNote] = useState('');

  const isAdminOrManager = hasRole(['super_admin', 'admin', 'sale_manager']);

  // Fetch leads list
  const { data: leadsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      'leads', 
      search, 
      statusFilter, 
      sourceFilter, 
      campaignFilter, 
      temperatureFilter, 
      demandFilter, 
      budgetFilter, 
      agentFilter, 
      startDate, 
      endDate, 
      page
    ],
    queryFn: async () => {
      let url = `/leads?q=${search}&page=${page}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (sourceFilter) url += `&utm_source=${sourceFilter}`;
      if (campaignFilter) url += `&utm_campaign=${campaignFilter}`;
      if (temperatureFilter) url += `&temperature=${temperatureFilter}`;
      if (demandFilter) url += `&demand_type=${demandFilter}`;
      if (budgetFilter) url += `&budget_range=${budgetFilter}`;
      if (agentFilter) url += `&agent_id=${agentFilter}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      
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
      // Cast the response data to any to support newly introduced fields in TypeScript
      return response.data as any;
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

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('mh_token');
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747/api/v1'}/leads/export?`;
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('utm_source', sourceFilter);
      if (campaignFilter) params.append('utm_campaign', campaignFilter);
      if (temperatureFilter) params.append('temperature', temperatureFilter);
      if (demandFilter) params.append('demand_type', demandFilter);
      if (budgetFilter) params.append('budget_range', budgetFilter);
      if (agentFilter) params.append('agent_id', agentFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await fetch(url + params.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Không thể xuất dữ liệu. Vui lòng kiểm tra lại quyền truy cập hoặc kết nối.');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submit_price_form':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'submit_schedule_form':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'click_hotline':
        return <Phone className="w-4 h-4 text-rose-500" />;
      case 'click_zalo':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'view_pricing':
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case 'view_floorplan':
      case 'view_legal':
      case 'view_project':
        return <Eye className="w-4 h-4 text-indigo-500" />;
      case 'download_brochure':
        return <Download className="w-4 h-4 text-cyan-500" />;
      case 'assigned_sale':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      case 'status_changed':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'sale_note':
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const leads = leadsData?.data || [];
  const meta = leadsData?.meta;

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setCampaignFilter('');
    setTemperatureFilter('');
    setDemandFilter('');
    setBudgetFilter('');
    setAgentFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 relative min-h-[500px] font-body">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Hệ thống Quản lý Leads (CRM)</h1>
          <p className="text-sm text-[#8C7A6B]">Xem thông tin liên hệ, theo dõi hành trình UTM/Visitor, chấm điểm tự động và phân phối Sale</p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 border border-[#E8DCCB] bg-white hover:bg-[#FBF8F2] text-[#1F1B16] rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
          </button>

          {isAdminOrManager && (
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(184,135,70,0.15)] flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* Filters Box */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Main Search */}
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A6B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng theo tên, số điện thoại, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full pl-10 pr-4 py-2.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
            {/* Toggle advanced filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                showAdvancedFilters || statusFilter || sourceFilter || campaignFilter || temperatureFilter || demandFilter || budgetFilter || agentFilter || startDate || endDate
                  ? 'border-[#B88746] bg-[#B88746]/5 text-[#B88746]'
                  : 'border-[#E8DCCB] bg-[#FBF8F2] text-[#1F1B16] hover:bg-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> 
              Bộ lọc nâng cao
              {(statusFilter || sourceFilter || campaignFilter || temperatureFilter || demandFilter || budgetFilter || agentFilter || startDate || endDate) && (
                <span className="w-2 h-2 rounded-full bg-[#B88746] inline-block" />
              )}
            </button>

            {(search || statusFilter || sourceFilter || campaignFilter || temperatureFilter || demandFilter || budgetFilter || agentFilter || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 border border-dashed border-[#E8DCCB] text-[#8C7A6B] hover:text-[#1F1B16] rounded-xl text-xs font-medium hover:bg-red-50/20 hover:border-red-200 transition-all"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filter Fields Panel */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-2 border-t border-[#E8DCCB]/60"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 text-xs">
                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Trạng thái Lead</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  >
                    <option value="">Tất cả</option>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Nguồn UTM (Source)</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  >
                    <option value="">Tất cả</option>
                    <option value="google">Google Adwords</option>
                    <option value="facebook">Facebook Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="organic">Tìm kiếm tự nhiên</option>
                    <option value="direct">Trực tiếp</option>
                    <option value="referral">Giới thiệu</option>
                  </select>
                </div>

                {/* Campaign */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Chiến dịch (Campaign)</label>
                  <input
                    type="text"
                    placeholder="Tên Campaign..."
                    value={campaignFilter}
                    onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Độ nóng (Temperature)</label>
                  <select
                    value={temperatureFilter}
                    onChange={(e) => { setTemperatureFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  >
                    <option value="">Tất cả</option>
                    {Object.entries(TEMP_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Demand Type */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Mục đích mua</label>
                  <select
                    value={demandFilter}
                    onChange={(e) => { setDemandFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  >
                    <option value="">Tất cả</option>
                    <option value="Ở thực">Ở thực</option>
                    <option value="Đầu tư">Đầu tư</option>
                    <option value="Mua cho thuê">Mua cho thuê</option>
                    <option value="Cần tư vấn">Cần tư vấn</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Ngân sách</label>
                  <select
                    value={budgetFilter}
                    onChange={(e) => { setBudgetFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  >
                    <option value="">Tất cả</option>
                    <option value="Dưới 5 tỷ">Dưới 5 tỷ</option>
                    <option value="5 - 10 tỷ">5 - 10 tỷ</option>
                    <option value="10 - 20 tỷ">10 - 20 tỷ</option>
                    <option value="Trên 20 tỷ">Trên 20 tỷ</option>
                  </select>
                </div>

                {/* Agent */}
                {isAdminOrManager && (
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Chuyên viên phụ trách</label>
                    <select
                      value={agentFilter}
                      onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                    >
                      <option value="">Tất cả</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
        </div>
      ) : leads.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          <AlertCircle className="w-8 h-8 text-[#B88746]/60 mx-auto mb-3" />
          Không tìm thấy khách hàng (lead) nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-[11px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Đánh giá hành vi</th>
                  <th className="px-6 py-4">Nhu cầu sản phẩm</th>
                  <th className="px-6 py-4">Chiến dịch / Nguồn</th>
                  <th className="px-6 py-4">Sale chăm sóc</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/50 text-sm">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-[#FBF8F2]/40 transition-colors">
                    {/* Basic info */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1F1B16]">{lead.name}</div>
                      <div className="text-xs text-[#8C7A6B] mt-0.5">{lead.phone}</div>
                      {lead.email && <div className="text-xs text-[#8C7A6B]/80">{lead.email}</div>}
                    </td>

                    {/* Behavior Score & Temp */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TEMP_COLORS[lead.temperature || 'cold']}`}>
                          {TEMP_LABELS[lead.temperature || 'cold']}
                        </span>
                        <div className="text-xs font-semibold text-[#B88746] bg-[#B88746]/5 px-2 py-0.5 rounded border border-[#B88746]/10 inline-flex items-center gap-1">
                          ⚡ {lead.score || 0} điểm
                        </div>
                      </div>
                    </td>

                    {/* Product / Demand */}
                    <td className="px-6 py-4 text-xs space-y-1">
                      {lead.project && (
                        <div className="font-medium text-[#1F1B16]">
                          🏢 {lead.project.name}
                        </div>
                      )}
                      {(lead.demand_type || lead.budget_range) && (
                        <div className="text-[#8C7A6B] flex flex-col gap-0.5">
                          {lead.demand_type && <span>Nhu cầu: {lead.demand_type}</span>}
                          {lead.budget_range && <span>Ngân sách: {lead.budget_range}</span>}
                        </div>
                      )}
                      {!lead.project && !lead.demand_type && !lead.budget_range && <span className="text-[#8C7A6B]/60">Chưa cập nhật</span>}
                    </td>

                    {/* UTM / Source */}
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-[#1F1B16] capitalize">
                        {lead.utm_source === 'organic' ? '🔍 SEO (Organic)' : 
                         lead.utm_source === 'google' ? '🔴 Google Ads' : 
                         lead.utm_source === 'facebook' ? '🔵 Facebook Ads' :
                         lead.utm_source === 'tiktok' ? '⚫ TikTok Ads' : 
                         lead.utm_source === 'direct' ? '📥 Trực tiếp' : 
                         lead.utm_source === 'referral' ? '🔗 Giới thiệu' : `🌐 ${lead.utm_source || 'Mặc định'}`}
                      </div>
                      {lead.utm_campaign && (
                        <div className="text-[#8C7A6B] text-[10px] truncate max-w-[150px] mt-0.5" title={lead.utm_campaign}>
                          Camp: {lead.utm_campaign}
                        </div>
                      )}
                    </td>

                    {/* Assigned Sale */}
                    <td className="px-6 py-4 text-xs text-[#1F1B16]">
                      {lead.agent ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <div className="w-5 h-5 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center text-[10px] font-bold uppercase">
                            {lead.agent.name.charAt(0)}
                          </div>
                          <span>{lead.agent.name}</span>
                        </div>
                      ) : (
                        <span className="text-[#8C7A6B] italic inline-flex items-center gap-1">
                          <UserX className="w-3.5 h-3.5 text-rose-400" /> Chưa phân công
                        </span>
                      )}
                    </td>

                    {/* Status Pipeline */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${STATUS_COLORS[lead.status || 'new']}`}>
                        {STATUS_LABELS[lead.status || 'new']}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="px-3 py-1.5 border border-[#E8DCCB] text-[#B88746] hover:bg-[#B88746] hover:text-white rounded-lg transition-all text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem chi tiết
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
                Hiển thị trang <span className="font-semibold text-[#1F1B16]">{meta.current_page}</span> / <span className="font-semibold text-[#1F1B16]">{meta.last_page}</span> (Tổng cộng <span className="font-semibold text-[#1F1B16]">{meta.total}</span> leads)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3.5 py-1.5 border border-[#E8DCCB] rounded-xl text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50 transition-colors"
                >
                  Trước
                </button>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-3.5 py-1.5 border border-[#E8DCCB] rounded-xl text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRM Details Slide-over Drawer (Split 2-columns Panel) */}
      <AnimatePresence>
        {selectedLeadId && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadId(null)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-5xl bg-[#FBF8F2] h-full shadow-2xl flex flex-col z-50 border-l border-[#E8DCCB]"
            >
              {/* Header */}
              <div className="h-20 bg-white border-b border-[#E8DCCB] px-8 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-heading font-medium text-xl text-[#1F1B16]">
                    Hành trình chi tiết khách hàng
                  </h3>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">Mã số Lead: #{selectedLeadId}</p>
                </div>
                <button
                  onClick={() => setSelectedLeadId(null)}
                  className="p-2 border border-[#E8DCCB] rounded-full text-[#8C7A6B] hover:text-[#1F1B16] hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body (2-columns Grid for detailed layout) */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#E8DCCB]/60">
                {detailsLoading ? (
                  <div className="flex-1 p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="h-40 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="h-40 bg-gray-200 animate-pulse rounded-lg" />
                  </div>
                ) : leadDetails ? (
                  <>
                    {/* LEFT COLUMN: Lead Profile & Context */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                      {/* Name & Contact */}
                      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#B88746] text-white flex items-center justify-center font-bold text-xl uppercase shadow-md">
                            {leadDetails.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-[#1F1B16]">{leadDetails.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TEMP_COLORS[leadDetails.temperature || 'cold']}`}>
                                {TEMP_LABELS[leadDetails.temperature || 'cold']}
                              </span>
                              <span className="text-xs font-semibold text-[#B88746] bg-[#B88746]/5 px-2 py-0.5 rounded border border-[#B88746]/10">
                                ⚡ {leadDetails.score || 0} điểm hành vi
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-[#E8DCCB]/40 text-xs">
                          <div>
                            <div className="text-[#8C7A6B] font-semibold mb-0.5">Số điện thoại:</div>
                            <div className="text-[#1F1B16] font-bold text-sm select-all">{leadDetails.phone}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] font-semibold mb-0.5">Địa chỉ Email:</div>
                            <div className="text-[#1F1B16] truncate select-all">{leadDetails.email || 'Chưa cung cấp'}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] font-semibold mb-0.5">Hình thức form:</div>
                            <div className="text-[#1F1B16] font-semibold capitalize bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                              {leadDetails.type === 'contact' ? 'Liên hệ chung' : 
                               leadDetails.type === 'consultation' ? 'Bảng giá / Tư vấn' : 
                               leadDetails.type === 'download_brochure' ? 'Tải brochure' :
                               leadDetails.type === 'schedule_visit' ? 'Hẹn tham quan' : 
                               leadDetails.type === 'finance_consult' ? 'Tư vấn tài chính' : 'Đăng ký nhận tin'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] font-semibold mb-0.5">Ngày đăng ký:</div>
                            <div className="text-[#1F1B16]">{new Date(leadDetails.created_at).toLocaleString('vi-VN')}</div>
                          </div>
                        </div>

                        {leadDetails.message && (
                          <div className="pt-3 border-t border-[#E8DCCB]/40 text-xs leading-relaxed">
                            <span className="font-bold text-[#1F1B16] block mb-1">Lời nhắn của khách:</span> 
                            <div className="bg-[#FBF8F2] border border-[#E8DCCB]/50 rounded-xl p-3 text-[#1F1B16] italic">
                              "{leadDetails.message}"
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Project & Financial Demands */}
                      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm space-y-3">
                        <h5 className="font-heading font-semibold text-sm text-[#1F1B16] border-b border-[#E8DCCB]/50 pb-2">
                          🎯 Nhu cầu Đầu tư / An cư
                        </h5>
                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Dự án quan tâm:</div>
                            <div className="text-[#1F1B16] font-semibold">
                              🏢 {leadDetails.project?.name || 'Đang cập nhật'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Mục đích mua:</div>
                            <div className="text-[#1F1B16] font-semibold">{leadDetails.demand_type || 'Chưa xác định'}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Tầm ngân sách:</div>
                            <div className="text-[#1F1B16] font-semibold">{leadDetails.budget_range || 'Chưa xác định'}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Loại hình quan tâm:</div>
                            <div className="text-[#1F1B16] font-semibold">{leadDetails.product_type || 'Chưa xác định'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Marketing Attribution (UTMs) */}
                      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm space-y-3">
                        <h5 className="font-heading font-semibold text-sm text-[#1F1B16] border-b border-[#E8DCCB]/50 pb-2">
                          📊 Nguồn chiến dịch Marketing (UTMs)
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Nguồn (Source):</div>
                            <div className="text-[#1F1B16] font-semibold capitalize">{leadDetails.utm_source || 'organic'}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Hình thức (Medium):</div>
                            <div className="text-[#1F1B16] font-semibold">{leadDetails.utm_medium || 'Không có'}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[#8C7A6B] mb-0.5">Tên chiến dịch (Campaign):</div>
                            <div className="text-[#1F1B16] font-semibold">{leadDetails.utm_campaign || 'Không có'}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Nội dung (Content):</div>
                            <div className="text-[#1F1B16] font-mono text-[10px] break-all">{leadDetails.utm_content || 'Không có'}</div>
                          </div>
                          <div>
                            <div className="text-[#8C7A6B] mb-0.5">Từ khóa (Term):</div>
                            <div className="text-[#1F1B16] font-mono text-[10px] break-all">{leadDetails.utm_term || 'Không có'}</div>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-100">
                            <div className="text-[#8C7A6B] mb-0.5">Trang đáp (Landing Page):</div>
                            <div className="text-slate-600 break-all text-[10px]" title={leadDetails.landing_page}>
                              {leadDetails.landing_page || 'Mặc định'}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[#8C7A6B] mb-0.5">Nguồn giới thiệu (Referrer):</div>
                            <div className="text-slate-600 break-all text-[10px]" title={leadDetails.referrer}>
                              {leadDetails.referrer || 'Trực tiếp'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* VR 360 Context */}
                      {(leadDetails.lead_source_position === 'vr360' || leadDetails.vr_scene_title) && (
                        <div className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl p-4 space-y-2.5">
                          <h6 className="font-heading font-semibold text-xs text-[#B88746] flex items-center gap-1">
                            🕶️ Chi tiết Nguồn VR 360°
                          </h6>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <div className="text-[#8C7A6B]">Giao diện đăng ký:</div>
                              <div className="text-[#1F1B16] font-semibold">Trải nghiệm VR 360°</div>
                            </div>
                            {leadDetails.vr_scene_title && (
                              <div>
                                <div className="text-[#8C7A6B]">Cảnh quan quan tâm:</div>
                                <div className="text-[#1F1B16] font-semibold">{leadDetails.vr_scene_title}</div>
                              </div>
                            )}
                            {leadDetails.vr_hotspot_title && (
                              <div className="col-span-2 border-t border-[#E8DCCB]/60 pt-1.5">
                                <div className="text-[#8C7A6B]">Nút bấm Hotspot:</div>
                                <div className="text-[#1F1B16] font-semibold">{leadDetails.vr_hotspot_title}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Visitor details & UUID */}
                      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-[10px] space-y-1 text-slate-500 font-mono">
                        <div>Visitor ID: {leadDetails.visitor_id || 'Không có'}</div>
                        {leadDetails.last_contacted_at && <div>Liên hệ gần nhất: {new Date(leadDetails.last_contacted_at).toLocaleString('vi-VN')}</div>}
                        {leadDetails.next_follow_up_at && <div>Hẹn liên hệ lại: {new Date(leadDetails.next_follow_up_at).toLocaleString('vi-VN')}</div>}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Sale CRM Interaction & Activity Timeline */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 flex flex-col justify-between h-full bg-white">
                      <div className="space-y-6">
                        {/* Status & Assignment Quick Control Panel */}
                        <div className="p-5 bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl space-y-4">
                          <h5 className="font-heading font-semibold text-sm text-[#1F1B16]">
                            ⚙️ Điều phối & Chăm sóc
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Update Status */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">Trạng thái chăm sóc</label>
                              <select
                                value={leadDetails.status}
                                onChange={(e) => updateStatusMutation.mutate({ id: leadDetails.id, status: e.target.value })}
                                disabled={updateStatusMutation.isPending}
                                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                              >
                                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                  <option key={val} value={val}>{label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Assign Sale Agent */}
                            {isAdminOrManager && (
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">Sale phụ trách</label>
                                <select
                                  value={leadDetails.assigned_to || ''}
                                  onChange={(e) => assignMutation.mutate({ id: leadDetails.id, agentId: parseInt(e.target.value) })}
                                  disabled={assignMutation.isPending}
                                  className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                                >
                                  <option value="">-- Chọn chuyên viên Sale --</option>
                                  {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                      {agent.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Split Tabs or Headings: Activity Timeline & Sale Notes */}
                        <div className="grid grid-cols-1 gap-6">
                          {/* Sale Notes Section */}
                          <div className="space-y-3">
                            <h5 className="font-heading font-semibold text-sm text-[#1F1B16] flex items-center gap-1.5 border-b border-gray-100 pb-2">
                              <ClipboardList className="w-4 h-4 text-[#B88746]" /> 
                              Lịch sử chăm sóc (Ghi chú Sale)
                            </h5>

                            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                              {leadDetails.notes && leadDetails.notes.length === 0 ? (
                                <p className="text-xs text-[#8C7A6B] italic p-3 bg-[#FBF8F2] border border-[#E8DCCB]/40 rounded-xl text-center">
                                  Chưa có nhật ký chăm sóc. Hãy thêm ghi chú đầu tiên ở dưới!
                                </p>
                              ) : (
                                leadDetails.notes?.map((note: any) => (
                                  <div key={note.id} className="p-3 bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl text-xs space-y-1.5">
                                    <div className="flex justify-between items-center text-[#8C7A6B]">
                                      <span className="font-bold text-[#1F1B16]">{note.user?.name || 'Hệ thống'}</span>
                                      <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <p className="text-[#1F1B16] leading-relaxed whitespace-pre-wrap">{note.note}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add note form */}
                            <form onSubmit={handleAddNote} className="space-y-2">
                              <textarea
                                placeholder="Ghi chú chi tiết cuộc gọi, lịch hẹn gặp, yêu cầu cụ thể của khách hàng..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={2}
                                required
                                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746] placeholder-[#8C7A6B]"
                              />
                              <button
                                type="submit"
                                disabled={addNoteMutation.isPending}
                                className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-xl transition-all duration-300 flex items-center gap-1 w-full justify-center shadow-md shadow-black/10"
                              >
                                <Plus className="w-3.5 h-3.5" /> Thêm ghi chú chăm sóc
                              </button>
                            </form>
                          </div>

                          {/* Activity Timeline Section */}
                          <div className="space-y-3">
                            <h5 className="font-heading font-semibold text-sm text-[#1F1B16] flex items-center gap-1.5 border-b border-gray-100 pb-2">
                              <Clock className="w-4 h-4 text-[#B88746]" /> 
                              Hành trình tương tác (Timeline)
                            </h5>

                            <div className="relative border-l border-[#E8DCCB] ml-2.5 pl-4 space-y-4 max-h-52 overflow-y-auto pr-1">
                              {leadDetails.activities && leadDetails.activities.length === 0 ? (
                                <p className="text-xs text-[#8C7A6B] italic pl-2">Không có lịch sử tương tác nào.</p>
                              ) : (
                                leadDetails.activities?.map((activity: any) => (
                                  <div key={activity.id} className="relative text-xs space-y-0.5">
                                    {/* Timeline dot */}
                                    <span className="absolute -left-7 top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-[#E8DCCB] shadow-sm">
                                      {getActivityIcon(activity.type)}
                                    </span>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-[#1F1B16]">{activity.title}</span>
                                      <span className="text-[10px] text-[#8C7A6B]">{new Date(activity.created_at).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <p className="text-[#8C7A6B]">{activity.description}</p>
                                    
                                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-[10px] text-slate-500 font-mono mt-1 max-w-full overflow-x-auto">
                                        {JSON.stringify(activity.metadata)}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
