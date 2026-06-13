'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment, Project } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ClipboardList, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function BookAppointments() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'list' | 'book'>('list');

  // Form states
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch appointments list
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get<Appointment[]>('/appointments');
      return response.data;
    },
  });

  // Fetch projects list (for the select dropdown)
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['public-projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects?per_page=50');
      return response.data;
    },
  });

  // Book Appointment Mutation
  const bookMutation = useMutation({
    mutationFn: async (data: { project_id: number; appointment_date: string; appointment_time: string; notes?: string }) => {
      return api.post<Appointment>('/appointments', data);
    },
    onSuccess: (response) => {
      setFormSuccess('Đặt lịch hẹn tham quan thành công!');
      // Reset form
      setProjectId('');
      setDate('');
      setTime('');
      setNotes('');
      // Invalidate query to refresh list
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Switch back to list tab after 2 seconds
      setTimeout(() => {
        setFormSuccess(null);
        setActiveTab('list');
      }, 2000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
      setTimeout(() => setFormError(null), 4000);
    },
  });

  // Cancel Appointment Mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!projectId || !date || !time) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    bookMutation.mutate({
      project_id: parseInt(projectId),
      appointment_date: date,
      appointment_time: time,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-heading font-medium text-[#1F1B16]">Lịch hẹn tham quan</h1>
        <p className="text-sm text-[#8C7A6B]">Lập lịch và quản lý các buổi tham quan căn hộ mẫu, sa bàn dự án</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DCCB] gap-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-4 text-sm font-medium transition-all relative ${
            activeTab === 'list' ? 'text-[#B88746] font-semibold' : 'text-[#8C7A6B] hover:text-[#1F1B16]'
          }`}
        >
          Lịch hẹn của tôi
          {activeTab === 'list' && (
            <motion.div layoutId="apptTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B88746]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`pb-4 text-sm font-medium transition-all relative ${
            activeTab === 'book' ? 'text-[#B88746] font-semibold' : 'text-[#8C7A6B] hover:text-[#1F1B16]'
          }`}
        >
          Đặt lịch mới
          {activeTab === 'book' && (
            <motion.div layoutId="apptTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B88746]" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {appointmentsLoading ? (
              <div className="space-y-4">
                <div className="h-24 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
                <div className="h-24 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm space-y-4 max-w-lg mx-auto">
                <Calendar className="w-12 h-12 text-[#B88746]/30 mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-heading font-medium text-base text-[#1F1B16]">Không có lịch hẹn nào</h3>
                  <p>Lên lịch tham quan căn hộ mẫu, sa bàn để nhận tư vấn trực tiếp từ nhân viên Masterise Homes.</p>
                </div>
                <button
                  onClick={() => setActiveTab('book')}
                  className="px-6 py-2.5 bg-[#B88746] text-white rounded-xl text-xs font-semibold hover:bg-[#1F1B16] transition-colors"
                >
                  Đặt lịch ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white border border-[#E8DCCB] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-[#B88746]/10 text-[#B88746] flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-heading font-semibold text-[#1F1B16] text-lg">{appt.project?.name}</h3>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8C7A6B]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {appt.appointment_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {appt.appointment_time.substring(0, 5)}
                          </span>
                          {appt.project?.location && (
                            <span className="flex items-center gap-1 max-w-sm truncate" title={appt.project.location}>
                              <MapPin className="w-3.5 h-3.5 shrink-0" /> {appt.project.location}
                            </span>
                          )}
                        </div>

                        {appt.notes && (
                          <p className="text-xs text-[#8C7A6B] bg-[#FBF8F2] p-2.5 rounded-lg border border-[#E8DCCB] max-w-xl">
                            <span className="font-medium text-[#1F1B16]">Ghi chú:</span> {appt.notes}
                          </p>
                        )}

                        {appt.agent && (
                          <p className="text-xs text-[#8C7A6B]">
                            👨‍💼 <span className="font-medium">Chuyên viên hỗ trợ:</span> {appt.agent.name} ({appt.agent.phone || 'N/A'})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#FBF8F2]">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        appt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        appt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {appt.status === 'confirmed' ? 'Đã xác nhận' :
                         appt.status === 'pending' ? 'Đang chờ duyệt' :
                         appt.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                      </span>

                      {appt.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
                              cancelMutation.mutate(appt.id);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors py-1 px-3 border border-red-200 hover:bg-red-50 rounded-lg"
                        >
                          Hủy lịch hẹn
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="book-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 md:p-8 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex gap-2 items-center">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl text-green-700 text-sm flex gap-2 items-center">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> {formSuccess}
                </div>
              )}

              <div className="space-y-4">
                {/* Project Selection */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#1F1B16]">Dự án tham quan *</label>
                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={projectsLoading}
                    className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                  >
                    <option value="">-- Chọn dự án --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.region})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1F1B16]">Ngày tham quan *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1F1B16]">Giờ tham quan *</label>
                    <select
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                    >
                      <option value="">-- Chọn khung giờ --</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#1F1B16]">Ghi chú yêu cầu thêm</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                    placeholder="Điền ghi chú (ví dụ: Số lượng người đi cùng, cần xe đưa đón, nhu cầu căn 3PN...)"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-[#E8DCCB]">
                <button
                  type="submit"
                  disabled={bookMutation.isPending}
                  className="px-6 py-3 bg-[#B88746] hover:bg-[#1F1B16] text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {bookMutation.isPending ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
