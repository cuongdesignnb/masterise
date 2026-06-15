'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { getUtmData, getVisitorId } from '@/services/utmService';
import { trackEvent } from '@/services/trackingService';
import LeadSuccessModal from './LeadSuccessModal';
import { Loader2, Calendar } from 'lucide-react';

interface ScheduleVisitFormProps {
  projectId?: number | null;
  projectName?: string;
  leadSourcePosition?: string;
  vrSceneTitle?: string;
  vrHotspotTitle?: string;
}

export default function ScheduleVisitForm({ 
  projectId, 
  projectName,
  leadSourcePosition,
  vrSceneTitle,
  vrHotspotTitle
}: ScheduleVisitFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('09:00 - 11:00');
  const [companions, setCompanions] = useState('1 người');
  const [demand, setDemand] = useState('Ở thật');
  const [message, setMessage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(''); // Honeypot

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [submitLocked, setSubmitLocked] = useState(false);

  const validatePhone = (p: string) => {
    const clean = p.replace(/\D/g, '');
    const has84 = clean.startsWith('84') && clean.length === 11;
    const has0 = clean.startsWith('0') && clean.length === 10;
    return has84 || has0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Honeypot check
    if (websiteUrl) return;

    // 2. Submit Lock
    if (submitLocked) {
      setError('Hệ thống đang xử lý. Vui lòng không bấm liên tục.');
      return;
    }

    // 3. Validation
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam (gồm 10 chữ số).');
      return;
    }
    if (!visitDate) {
      setError('Vui lòng chọn ngày muốn đi xem.');
      return;
    }

    setLoading(true);

    try {
      const utmData = getUtmData();
      const visitorId = getVisitorId();

      const combinedMessage = `[LỊCH THAM QUAN] Dự án: ${projectName || ''} | Ngày xem: ${visitDate} | Khung giờ: ${visitTime} | Số người: ${companions}. Ghi chú: ${message.trim()}`;

      const response = await api.post('/leads', {
        name,
        phone,
        type: 'schedule_visit',
        message: combinedMessage,
        project_id: projectId,
        demand_type: demand,
        visitor_id: visitorId,
        lead_source_position: leadSourcePosition || null,
        vr_scene_title: vrSceneTitle || null,
        vr_hotspot_title: vrHotspotTitle || null,
        ...utmData,
      });

      if (response.success) {
        setIsSuccessOpen(true);
        // Clear
        setName('');
        setPhone('');
        setVisitDate('');
        setMessage('');
        
        setSubmitLocked(true);
        setTimeout(() => setSubmitLocked(false), 30000);

        // Track event
        trackEvent('submit_schedule_form', {
          project_id: projectId,
          type: 'schedule_visit',
          visit_date: visitDate,
          visit_time: visitTime,
          companions,
        });
      } else {
        setError(response.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 md:p-8 shadow-sm font-body text-[#1F1B16]">
      <div className="mb-6">
        <h3 className="font-heading font-medium text-lg text-[#1F1B16] mb-1">
          Đặt lịch tham quan nhà mẫu
        </h3>
        <p className="text-xs text-[#8C7A6B]">
          Đăng ký tham quan thực tế sa bàn và nhà mẫu cao cấp của Masterise Homes. Có xe đưa đón tận nơi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="website_url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Họ tên *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
              placeholder="09xx xxx xxx"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#B88746]" />
              Ngày xem nhà mẫu *
            </label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Block past dates
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Khung giờ
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            >
              <option value="08:00 - 10:00">Sáng: 08:00 - 10:00</option>
              <option value="10:00 - 12:00">Sáng: 10:00 - 12:00</option>
              <option value="14:00 - 16:00">Chiều: 14:00 - 16:00</option>
              <option value="16:00 - 18:00">Chiều: 16:00 - 18:00</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Số người đi cùng
            </label>
            <select
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            >
              <option value="1 người">Đi 1 mình</option>
              <option value="2 người">Đi 2 người (Cặp đôi)</option>
              <option value="3 người">Đi 3 người</option>
              <option value="4 người">Đi 4 người</option>
              <option value="Trên 4 người">Đoàn trên 4 người</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Mục đích mua
            </label>
            <div className="flex gap-4 pt-1">
              {['Ở thật', 'Đầu tư', 'Cần tư vấn'].map((val) => (
                <label key={val} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="schedule_demand"
                    checked={demand === val}
                    onChange={() => setDemand(val)}
                    className="accent-[#B88746] w-4 h-4"
                  />
                  {val === 'Ở thật' ? 'Mua để ở' : val === 'Đầu tư' ? 'Mua đầu tư' : 'Cần hỗ trợ tư vấn'}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
            Yêu cầu hỗ trợ thêm (Ví dụ: xe đưa đón tại nhà)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] placeholder-[#8C7A6B]/40"
            placeholder="Ví dụ: Cần xe đón tại Quận 2 lúc 8h sáng..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-left">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || submitLocked}
          className="w-full py-3 bg-[#B88746] hover:bg-[#1F1B16] disabled:bg-[#8C7A6B]/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang đăng ký lịch hẹn...
            </>
          ) : submitLocked ? (
            'Đang khóa gửi form (30s)...'
          ) : (
            'Đăng ký Đặt Lịch Tham Quan Nhà Mẫu'
          )}
        </button>
      </form>

      <LeadSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
