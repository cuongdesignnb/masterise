'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment, Project } from '@/types/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Calendar, ArrowRight, Home, ShieldAlert } from 'lucide-react';

export default function UserDashboardOverview() {
  const { user } = useAuth();

  // Fetch user's appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const response = await api.get<Appointment[]>('/appointments');
      return response.data;
    },
  });

  // Fetch saved projects
  const savedProjectsCount = user?.saved_projects?.length || 0;
  const recentAppointments = appointmentsData?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#1F1B16] text-[#E8DCCB] p-8 md:p-10 rounded-[24px] border border-[#B88746]/20 shadow-[0_12px_40px_rgba(27,27,27,0.06)]"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B88746]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-semibold tracking-widest text-[#B88746] uppercase block">
            Cổng thông tin khách hàng
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-medium text-white">
            Xin chào, {user?.name}
          </h1>
          <p className="text-[#8C7A6B] max-w-xl text-sm leading-relaxed">
            Chào mừng bạn quay lại với Masterise Homes. Tại đây bạn có thể cập nhật thông tin nhu cầu, theo dõi lịch hẹn tham quan nhà mẫu và quản lý các dự án yêu thích của mình.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[#8C7A6B] text-xs font-medium uppercase tracking-wider block">Dự án đã lưu</span>
            <h3 className="text-3xl font-heading font-bold text-[#1F1B16]">{savedProjectsCount}</h3>
            <Link href="/tai-khoan/du-an" className="text-[#B88746] text-xs font-medium inline-flex items-center gap-1 hover:underline">
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[#8C7A6B] text-xs font-medium uppercase tracking-wider block">Lịch hẹn tham quan</span>
            <h3 className="text-3xl font-heading font-bold text-[#1F1B16]">
              {appointmentsLoading ? '...' : appointmentsData?.length || 0}
            </h3>
            <Link href="/tai-khoan/lich-hen" className="text-[#B88746] text-xs font-medium inline-flex items-center gap-1 hover:underline">
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div className="space-y-2">
            <span className="text-[#8C7A6B] text-xs font-medium uppercase tracking-wider block">Loại tài khoản</span>
            <h3 className="text-xl font-heading font-semibold text-[#1F1B16] uppercase tracking-wider">Khách Hàng</h3>
            <Link href="/tai-khoan/ho-so" className="text-[#B88746] text-xs font-medium inline-flex items-center gap-1 hover:underline">
              Cập nhật hồ sơ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Appointments & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-medium text-[#1F1B16]">Lịch hẹn sắp tới</h3>
            <Link href="/tai-khoan/lich-hen" className="text-[#B88746] text-xs font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>

          {appointmentsLoading ? (
            <div className="space-y-4">
              <div className="h-16 bg-[#FBF8F2] animate-pulse rounded-xl" />
              <div className="h-16 bg-[#FBF8F2] animate-pulse rounded-xl" />
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="p-8 text-center bg-[#FBF8F2] rounded-xl border border-dashed border-[#E8DCCB] text-[#8C7A6B] text-sm space-y-3">
              <p>Bạn chưa có lịch hẹn tham quan nào.</p>
              <Link href="/du-an" className="inline-block px-4 py-2 bg-[#B88746] text-white rounded-lg text-xs font-semibold hover:bg-[#1F1B16] transition-colors">
                Khám phá dự án & đặt lịch
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appt) => (
                <div key={appt.id} className="p-4 bg-[#FBF8F2] rounded-xl border border-[#E8DCCB] flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-[#1F1B16]">{appt.project?.name}</h4>
                    <p className="text-xs text-[#8C7A6B]">
                      {appt.appointment_date} vào lúc {appt.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      appt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      appt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {appt.status === 'confirmed' ? 'Đã xác nhận' :
                       appt.status === 'pending' ? 'Đang duyệt' :
                       appt.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Projects Preview */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-medium text-[#1F1B16]">Dự án đang theo dõi</h3>
            <Link href="/tai-khoan/du-an" className="text-[#B88746] text-xs font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>

          {savedProjectsCount === 0 ? (
            <div className="p-8 text-center bg-[#FBF8F2] rounded-xl border border-dashed border-[#E8DCCB] text-[#8C7A6B] text-sm space-y-3">
              <p>Bạn chưa lưu dự án nào.</p>
              <Link href="/du-an" className="inline-block px-4 py-2 bg-[#B88746] text-white rounded-lg text-xs font-semibold hover:bg-[#1F1B16] transition-colors">
                Xem danh sách dự án
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <p className="text-sm text-[#8C7A6B]">
                Bạn đang theo dõi <span className="font-semibold text-[#1F1B16]">{savedProjectsCount} dự án</span>. Cập nhật mới nhất sẽ được thông báo đến email của bạn.
              </p>
              <Link
                href="/tai-khoan/du-an"
                className="w-full text-center py-3.5 bg-[#B88746]/5 hover:bg-[#B88746] text-[#B88746] hover:text-white border border-[#B88746]/20 rounded-xl text-xs font-semibold transition-all duration-300"
              >
                Quản lý dự án đã lưu
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
