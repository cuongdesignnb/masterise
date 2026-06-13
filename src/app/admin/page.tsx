'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Building, 
  Newspaper, 
  FileSpreadsheet, 
  Calendar, 
  ArrowRight,
  UserCheck,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StatsData {
  projects_count: number;
  posts_count: number;
  leads_count: number;
  new_leads_count: number;
  appointments_count: number;
  pending_appointments_count: number;
  recent_leads: any[];
  recent_appointments: any[];
}

export default function AdminOverview() {
  // Fetch admin dashboard stats
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get<StatsData>('/reports/stats');
      return response.data;
    },
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
        ))}
        <div className="md:col-span-2 h-96 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
        <div className="md:col-span-2 h-96 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Có lỗi xảy ra khi tải dữ liệu thống kê. Vui lòng làm mới trang hoặc kiểm tra kết nối API.
      </div>
    );
  }

  const statCards = [
    { name: 'Dự án đang quản lý', count: stats.projects_count, detail: 'Dự án bất động sản', icon: Building, color: 'text-blue-600 bg-blue-50', link: '/admin/du-an' },
    { name: 'Bài viết tin tức', count: stats.posts_count, detail: 'Tin tức & Hướng dẫn', icon: Newspaper, color: 'text-emerald-600 bg-emerald-50', link: '/admin/tin-tuc' },
    { name: 'Yêu cầu tư vấn (Leads)', count: stats.leads_count, detail: `${stats.new_leads_count} lead mới cần xử lý`, icon: FileSpreadsheet, color: 'text-amber-600 bg-amber-50', link: '/admin/leads' },
    { name: 'Lịch hẹn tham quan', count: stats.appointments_count, detail: `${stats.pending_appointments_count} lịch hẹn chờ duyệt`, icon: Calendar, color: 'text-purple-600 bg-purple-50', link: '/admin/lich-hen' },
  ];

  return (
    <div className="space-y-8">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Tổng quan hệ thống</h1>
        <p className="text-sm text-[#8C7A6B]">Báo cáo nhanh tình hình kinh doanh và nội dung website</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={card.name}
              className="bg-white border border-[#E8DCCB] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-[0_8px_25px_rgba(27,27,27,0.03)] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[#8C7A6B] text-xs font-medium uppercase tracking-wider block">{card.name}</span>
                  <h3 className="text-3xl font-heading font-bold text-[#1F1B16]">{card.count}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#FBF8F2]">
                <span className="text-xs text-[#8C7A6B]">{card.detail}</span>
                <Link href={card.link} className="text-[#B88746] hover:text-[#1F1B16] text-xs font-semibold inline-flex items-center gap-1">
                  Quản lý <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid for recent leads & appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-medium text-[#1F1B16]">Yêu cầu tư vấn mới nhất</h3>
            <Link href="/admin/leads" className="text-[#B88746] hover:text-[#1F1B16] text-xs font-semibold inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recent_leads.length === 0 ? (
            <div className="p-8 text-center bg-[#FBF8F2] rounded-xl text-[#8C7A6B] text-xs">
              Chưa có yêu cầu tư vấn nào được ghi nhận.
            </div>
          ) : (
            <div className="divide-y divide-[#FBF8F2] -mx-6">
              {stats.recent_leads.map((lead) => (
                <div key={lead.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#FBF8F2]/50 transition-colors">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-[#1F1B16] truncate">{lead.name}</h4>
                      <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-[#B88746]/10 text-[#B88746]">
                        {lead.type === 'contact' ? 'Liên hệ' : lead.type === 'consultation' ? 'Tư vấn' : lead.type === 'download_brochure' ? 'Tài liệu' : 'Newsletter'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C7A6B] truncate">
                      📞 {lead.phone} {lead.project && `| 🏢 ${lead.project.name}`}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      lead.status === 'new' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      lead.status === 'contacted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      lead.status === 'consulting' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      lead.status === 'closed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {lead.status === 'new' ? 'Mới' :
                       lead.status === 'contacted' ? 'Đã liên hệ' :
                       lead.status === 'consulting' ? 'Đang tư vấn' :
                       lead.status === 'closed' ? 'Thành công' : 'Đã hủy'}
                    </span>
                    <span className="text-[10px] text-[#8C7A6B] block">
                      {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-medium text-[#1F1B16]">Lịch hẹn tham quan mới</h3>
            <Link href="/admin/lich-hen" className="text-[#B88746] hover:text-[#1F1B16] text-xs font-semibold inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recent_appointments.length === 0 ? (
            <div className="p-8 text-center bg-[#FBF8F2] rounded-xl text-[#8C7A6B] text-xs">
              Chưa có lịch hẹn tham quan nào.
            </div>
          ) : (
            <div className="divide-y divide-[#FBF8F2] -mx-6">
              {stats.recent_appointments.map((appt) => (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#FBF8F2]/50 transition-colors">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-[#1F1B16] truncate">{appt.user?.name || 'Khách Hàng'}</h4>
                      <span className="text-xs text-[#8C7A6B]">→ {appt.project?.name}</span>
                    </div>
                    <p className="text-xs text-[#8C7A6B]">
                      📅 {appt.appointment_date} | ⏰ {appt.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      appt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      appt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {appt.status === 'confirmed' ? 'Đã duyệt' :
                       appt.status === 'pending' ? 'Chờ duyệt' :
                       appt.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
