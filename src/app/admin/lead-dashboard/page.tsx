'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Flame, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Award,
  CircleDollarSign,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Status Label Helper
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

export default function LeadDashboard() {
  const { hasRole } = useAuth();
  const isAdminOrManager = hasRole(['super_admin', 'admin', 'sale_manager']);

  // Fetch Dashboard Stats
  const { data: dashboardData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['lead-dashboard'],
    queryFn: async () => {
      const response = await api.get<any>('/lead-dashboard');
      return response.data;
    },
    enabled: isAdminOrManager,
  });

  if (!isAdminOrManager) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DCCB] text-red-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Không có quyền truy cập</h2>
        <p className="text-sm text-[#8C7A6B] mt-1">Chỉ Quản trị viên và Sale Manager mới có quyền truy cập trang thống kê này.</p>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const slaAlerts = dashboardData?.sla_alerts || {};
  const charts = dashboardData?.charts || {};

  // Parse charts data
  const leadsBySource = charts.leads_by_source || [];
  const leadsByStatus = charts.leads_by_status || [];
  const leadsHistory = charts.leads_history || [];
  const saleLeaderboard = charts.sale_performance || [];

  return (
    <div className="space-y-6 font-body">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Dashboard Đo lường Lead & CRM</h1>
          <p className="text-sm text-[#8C7A6B]">Phân tích hiệu quả nguồn chiến dịch, theo dõi cảnh báo SLA và hiệu suất đội ngũ kinh doanh</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2 border border-[#E8DCCB] bg-white hover:bg-[#FBF8F2] text-[#1F1B16] rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> 
          Làm mới dữ liệu
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Leads */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#B88746]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#B88746]" /> Tổng số Leads tích lũy
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-heading font-bold text-[#1F1B16]">{kpis.total_leads || 0}</span>
                <span className="text-xs text-emerald-600 font-semibold">Hoạt động</span>
              </div>
              <div className="text-[11px] text-[#8C7A6B] mt-1.5">
                Hôm nay: <span className="font-semibold text-[#1F1B16]">{kpis.leads_today || 0}</span> | Tuần này: <span className="font-semibold text-[#1F1B16]">{kpis.leads_this_week || 0}</span>
              </div>
            </div>

            {/* Hot Leads */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                <Flame className="w-4 h-4 text-red-500 animate-pulse" /> Leads siêu nóng (Hot)
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-heading font-bold text-red-600">{kpis.hot_leads || 0}</span>
                <span className="text-xs text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Điểm cao</span>
              </div>
              <div className="text-[11px] text-[#8C7A6B] mt-1.5">
                Chưa gán Sale xử lý: <span className="font-semibold text-red-600">{kpis.unassigned_leads || 0}</span>
              </div>
            </div>

            {/* Scheduled Visits */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-500" /> Hẹn tham quan thực tế
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-heading font-bold text-emerald-600">{kpis.scheduled_visits || 0}</span>
                <span className="text-xs text-[#8C7A6B]">Gặp trực tiếp</span>
              </div>
              <div className="text-[11px] text-[#8C7A6B] mt-1.5">
                Cần gọi lại nhắc hẹn hôm nay: <span className="font-semibold text-[#1F1B16]">{slaAlerts.callbacks_today?.length || 0}</span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                <Award className="w-4 h-4 text-indigo-500" /> Tỷ lệ chốt thành công
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-heading font-bold text-indigo-600">{kpis.conversion_rate || 0}%</span>
                <span className="text-xs text-[#8C7A6B]">Giao dịch ký hợp đồng</span>
              </div>
              <div className="text-[11px] text-[#8C7A6B] mt-1.5">
                Quá hạn hẹn gọi lại: <span className="font-semibold text-rose-600">{kpis.overdue_follow_ups || 0}</span>
              </div>
            </div>
          </div>

          {/* SLA Warning Panel & Real-time Alerts */}
          <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-base text-[#1F1B16] flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-bounce" /> 
              Cảnh báo Vận hành & SLA Phản hồi khẩn cấp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Alert 1: Uncalled Leads > 5m */}
              <div className="bg-white border border-red-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Gọi điện trễ hạn (&gt;5p)
                  </span>
                  <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded text-[10px]">
                    {slaAlerts.uncalled_after_5m?.length || 0} Lead
                  </span>
                </div>
                <p className="text-[#8C7A6B]">Lead mới đăng ký quá 5 phút chưa thực hiện cuộc gọi đầu tiên.</p>
                {slaAlerts.uncalled_after_5m?.length > 0 && (
                  <div className="pt-2 border-t border-red-50/50 space-y-1 max-h-20 overflow-y-auto">
                    {slaAlerts.uncalled_after_5m.slice(0, 3).map((lead: any) => (
                      <div key={lead.id} className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-[#1F1B16]">{lead.name}</span>
                        <Link href={`/admin/leads`} className="text-[#B88746] hover:underline flex items-center gap-0.5">
                          Xem <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert 2: Hot Unassigned Leads */}
              <div className="bg-white border border-orange-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-600 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Lead Nóng chưa chia
                  </span>
                  <span className="bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded text-[10px]">
                    {slaAlerts.unassigned_hot?.length || 0} Lead
                  </span>
                </div>
                <p className="text-[#8C7A6B]">Lead có tương tác cao (Hot/Very Hot) nhưng chưa giao Sale chăm sóc.</p>
                {slaAlerts.unassigned_hot?.length > 0 && (
                  <div className="pt-2 border-t border-orange-50/50 space-y-1 max-h-20 overflow-y-auto">
                    {slaAlerts.unassigned_hot.slice(0, 3).map((lead: any) => (
                      <div key={lead.id} className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-[#1F1B16]">{lead.name} ({lead.score}đ)</span>
                        <Link href={`/admin/leads`} className="text-[#B88746] hover:underline flex items-center gap-0.5">
                          Chia Sale <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert 3: Stale Leads (> 3 days) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Lead bị nguội (&gt;3 ngày)
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                    {slaAlerts.stale_leads?.length || 0} Lead
                  </span>
                </div>
                <p className="text-[#8C7A6B]">Lead đang tương tác nhưng không có cập nhật ghi chú/trạng thái quá 3 ngày.</p>
                {slaAlerts.stale_leads?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1 max-h-20 overflow-y-auto">
                    {slaAlerts.stale_leads.slice(0, 3).map((lead: any) => (
                      <div key={lead.id} className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-[#1F1B16]">{lead.name} (Sale: {lead.agent?.name || 'N/A'})</span>
                        <Link href={`/admin/leads`} className="text-[#B88746] hover:underline flex items-center gap-0.5">
                          Đôn đốc <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SVG Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Daily Leads History (7 Days SVG Line Chart) */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm">
              <h4 className="font-heading font-semibold text-sm text-[#1F1B16] mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#B88746]" /> Lịch sử đăng ký Lead (7 ngày qua)
              </h4>
              
              {leadsHistory.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-[#8C7A6B]">Chưa có dữ liệu lịch sử</div>
              ) : (
                <div className="w-full">
                  <svg className="w-full h-56" viewBox="0 0 500 200">
                    {/* Background Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#F0E6D8" strokeWidth="1" strokeDasharray="3" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#F0E6D8" strokeWidth="1" strokeDasharray="3" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#F0E6D8" strokeWidth="1" strokeDasharray="3" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#1F1B16" strokeWidth="1" />

                    {/* Coordinates */}
                    {(() => {
                      const counts = leadsHistory.map((d: any) => d.count);
                      const maxCount = Math.max(...counts, 5);
                      const points = leadsHistory.map((d: any, index: number) => {
                        const x = 40 + (index * (440 / (leadsHistory.length - 1)));
                        const y = 170 - (d.count * (150 / maxCount));
                        return { x, y, label: d.date, count: d.count };
                      });

                      // Construct polyline path
                      const pathD = points.map((p: any) => `${p.x},${p.y}`).join(' ');

                      return (
                        <>
                          {/* Main line path */}
                          <polyline fill="none" stroke="#B88746" strokeWidth="3" points={pathD} />
                          
                          {/* Gradient fill underneath */}
                          <path 
                            fill="url(#goldGradient)" 
                            opacity="0.15" 
                            d={`M${points[0].x},170 L${pathD} L${points[points.length - 1].x},170 Z`} 
                          />

                          {/* Definition of gradients */}
                          <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#B88746" />
                              <stop offset="100%" stopColor="#FFFFFF" />
                            </linearGradient>
                          </defs>

                          {/* Dots & Labels */}
                          {points.map((p: any, i: number) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="4.5" fill="#1F1B16" stroke="#B88746" strokeWidth="2.5" />
                              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1F1B16">
                                {p.count}
                              </text>
                              <text x={p.x} y="188" textAnchor="middle" fontSize="9" fontWeight="semibold" fill="#8C7A6B">
                                {p.label}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              )}
            </div>

            {/* Chart 2: Leads by Source (Marketing Channel SVG Bar Chart) */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm">
              <h4 className="font-heading font-semibold text-sm text-[#1F1B16] mb-4 flex items-center gap-1.5">
                <CircleDollarSign className="w-4 h-4 text-[#B88746]" /> Tỷ lệ phân bổ nguồn khách hàng (Attribution)
              </h4>

              {leadsBySource.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-[#8C7A6B]">Chưa có dữ liệu nguồn</div>
              ) : (
                <div className="w-full">
                  <svg className="w-full h-56" viewBox="0 0 500 200">
                    <line x1="60" y1="20" x2="60" y2="170" stroke="#1F1B16" strokeWidth="1" />
                    <line x1="60" y1="170" x2="480" y2="170" stroke="#1F1B16" strokeWidth="1" />

                    {(() => {
                      const totals = leadsBySource.map((s: any) => s.total);
                      const maxTotal = Math.max(...totals, 5);
                      const barSpacing = 150 / (leadsBySource.length || 1);
                      const sourceNames: Record<string, string> = {
                        google: 'Google Ads',
                        facebook: 'Facebook Ads',
                        tiktok: 'TikTok Ads',
                        organic: 'SEO Organic',
                        direct: 'Direct',
                        referral: 'Referral',
                        vr360: 'VR 360 Experience'
                      };

                      return leadsBySource.map((item: any, i: number) => {
                        const y = 30 + (i * 25);
                        const barWidth = (item.total / maxTotal) * 360;
                        const label = sourceNames[item.utm_source] || item.utm_source || 'Không rõ';

                        return (
                          <g key={i}>
                            {/* Source Name Label */}
                            <text x="50" y={y + 11} textAnchor="end" fontSize="9" fontWeight="bold" fill="#8C7A6B">
                              {label}
                            </text>
                            {/* Bar Graphic */}
                            <rect 
                              x="60" 
                              y={y} 
                              width={Math.max(barWidth, 4)} 
                              height="14" 
                              fill={i % 2 === 0 ? '#B88746' : '#1F1B16'} 
                              rx="3" 
                            />
                            {/* Bar Value Count */}
                            <text x={65 + barWidth} y={y + 11} fontSize="9" fontWeight="bold" fill="#1F1B16">
                              {item.total}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
              )}
            </div>

            {/* Chart 3: Leads by Status Pipeline Funnel */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm lg:col-span-2">
              <h4 className="font-heading font-semibold text-sm text-[#1F1B16] mb-4 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#B88746]" /> Phễu chuyển đổi Trạng thái Leads (Pipeline Conversion)
              </h4>

              {leadsByStatus.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8C7A6B]">Chưa có dữ liệu trạng thái phễu</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leadsByStatus.map((item: any, idx: number) => {
                    const totalLeads = kpis.total_leads || 1;
                    const percent = Math.round((item.total / totalLeads) * 100);

                    return (
                      <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-slate-50/50 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#1F1B16]">{STATUS_LABELS[item.status] || item.status}</span>
                          <span className="font-bold text-[#B88746]">{item.total} leads</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#B88746] rounded-full" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-[#8C7A6B] text-right">
                          Tỷ lệ: {percent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sale leaderboard performance table */}
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm lg:col-span-2">
              <h4 className="font-heading font-semibold text-sm text-[#1F1B16] mb-4 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#B88746]" /> Bảng xếp hạng hiệu suất Sale (Leaderboard)
              </h4>

              {saleLeaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8C7A6B]">Chưa có dữ liệu Sale hoạt động</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">Nhân sự</th>
                        <th className="px-4 py-3 text-center">Được giao</th>
                        <th className="px-4 py-3 text-center">Đang xử lý</th>
                        <th className="px-4 py-3 text-center">Ký hợp đồng</th>
                        <th className="px-4 py-3 text-right">Tỷ lệ chốt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {saleLeaderboard.map((sale: any, idx: number) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 flex items-center gap-2 font-semibold text-[#1F1B16]">
                            <span className="w-5 h-5 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            {sale.name}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-[#1F1B16]">{sale.assigned}</td>
                          <td className="px-4 py-3 text-center text-amber-600 font-semibold">{sale.active}</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">{sale.closed}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100">
                              {sale.conv_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
