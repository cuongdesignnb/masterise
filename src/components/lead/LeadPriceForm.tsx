'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { getUtmData, getVisitorId } from '@/services/utmService';
import { trackEvent } from '@/services/trackingService';
import LeadSuccessModal from './LeadSuccessModal';
import { Loader2 } from 'lucide-react';

interface LeadPriceFormProps {
  projectId?: number | null;
  projectName?: string;
  leadSourcePosition?: string;
  vrSceneTitle?: string;
  vrHotspotTitle?: string;
}

export default function LeadPriceForm({ 
  projectId, 
  projectName,
  leadSourcePosition,
  vrSceneTitle,
  vrHotspotTitle
}: LeadPriceFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [demand, setDemand] = useState('Ở thật');
  const [budget, setBudget] = useState('3 - 5 tỷ');
  const [productType, setProductType] = useState('Căn hộ cao cấp');
  const [message, setMessage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(''); // Honeypot field

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
    if (websiteUrl) {
      // Quietly reject bots without throwing visible errors
      return;
    }

    // 2. Submit Lock check
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

    setLoading(true);

    try {
      const utmData = getUtmData();
      const visitorId = getVisitorId();

      const response = await api.post('/leads', {
        name,
        phone,
        email: email.trim() || null,
        type: 'consultation',
        message: message.trim() || `Khách hàng đăng ký tư vấn dự án ${projectName || ''}`,
        project_id: projectId,
        demand_type: demand,
        budget_range: budget,
        product_type: productType,
        visitor_id: visitorId,
        lead_source_position: leadSourcePosition || null,
        vr_scene_title: vrSceneTitle || null,
        vr_hotspot_title: vrHotspotTitle || null,
        ...utmData,
      });

      if (response.success) {
        setIsSuccessOpen(true);
        // Clear inputs
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
        
        // Anti-spam: lock submit for 30s
        setSubmitLocked(true);
        setTimeout(() => setSubmitLocked(false), 30000);

        // Track submission success
        trackEvent('submit_lead_form', {
          project_id: projectId,
          type: 'consultation',
          budget,
          demand,
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
          Nhận bảng giá & chính sách mới nhất
        </h3>
        <p className="text-xs text-[#8C7A6B]">
          Đăng ký thông tin để nhận trọn bộ tài liệu thiết kế và giỏ hàng dự án độc quyền.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden from users) */}
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
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] placeholder-[#8C7A6B]/50"
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
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] placeholder-[#8C7A6B]/50"
              placeholder="09xx xxx xxx"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Email (Không bắt buộc)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] placeholder-[#8C7A6B]/50"
              placeholder="example@mail.com"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Nhu cầu mua
            </label>
            <select
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            >
              <option value="Ở thật">Mua để ở</option>
              <option value="Đầu tư">Đầu tư trung/dài hạn</option>
              <option value="Mua cho thuê">Mua khai thác cho thuê</option>
              <option value="Cần tư vấn">Cần tư vấn thêm</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Ngân sách dự kiến
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            >
              <option value="Dưới 3 tỷ">Dưới 3 tỷ</option>
              <option value="3 - 5 tỷ">Từ 3 - 5 tỷ</option>
              <option value="5 - 10 tỷ">Từ 5 - 10 tỷ</option>
              <option value="10 - 20 tỷ">Từ 10 - 20 tỷ</option>
              <option value="Trên 20 tỷ">Trên 20 tỷ</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Loại sản phẩm quan tâm
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            >
              <option value="Căn hộ cao cấp">Căn hộ cao cấp</option>
              <option value="Nhà phố thương mại">Nhà phố Shophouse</option>
              <option value="Biệt thự">Biệt thự đơn lập/song lập</option>
              <option value="Penthouse/Duplex">Căn hộ thông tầng Penthouse</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
            Ghi chú / Yêu cầu chi tiết
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] placeholder-[#8C7A6B]/40"
            placeholder="Ví dụ: Cần căn tầng cao, hướng Đông Nam..."
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
          className="w-full py-3 bg-[#1F1B16] hover:bg-[#B88746] disabled:bg-[#8C7A6B]/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang gửi thông tin...
            </>
          ) : submitLocked ? (
            'Đang khóa gửi form (30s)...'
          ) : (
            'Nhận bảng giá & chính sách mới nhất'
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
