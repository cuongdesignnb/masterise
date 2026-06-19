'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageSquare, Phone, ArrowRight, X } from 'lucide-react';
import { trackEvent } from '@/services/trackingService';
import { useSiteSettings } from '@/providers/SiteSettingsProvider';

interface LeadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number | null;
}

export default function LeadSuccessModal({ isOpen, onClose, projectId }: LeadSuccessModalProps) {
  const { hotline, socialLinks } = useSiteSettings();
  const zaloUrl = socialLinks.zalo.startsWith('http') ? socialLinks.zalo : `https://zalo.me/${socialLinks.zalo}`;

  const handleZaloClick = () => {
    trackEvent('click_zalo', { project_id: projectId });
    window.open(zaloUrl, '_blank');
    onClose();
  };

  const handleHotlineClick = () => {
    trackEvent('click_hotline', { project_id: projectId });
    window.open(`tel:${hotline.replace(/\D/g, '')}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white border border-[#E8DCCB] rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl z-10 text-center font-body text-[#1F1B16]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-[#FBF8F2] text-[#8C7A6B] hover:text-[#1F1B16] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 bg-[#B88746]/10 border border-[#B88746]/30 text-[#B88746] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            {/* Header */}
            <h3 className="font-heading font-medium text-xl text-[#1F1B16] mb-2">
              Gửi Thông Tin Thành Công!
            </h3>
            <p className="text-sm text-[#4E453B] leading-relaxed mb-6">
              Cảm ơn anh/chị đã để lại thông tin. Bộ phận tư vấn dự án của Masterise Homes sẽ liên hệ hỗ trợ trong vòng 5 phút tới.
            </p>

            {/* Zalo Callout Banner */}
            <div className="bg-[#FFF8EC] border border-[#B88746]/20 rounded-xl p-4 mb-6 text-left">
              <h4 className="text-xs font-bold text-[#B88746] uppercase tracking-wider mb-1">
                ⚡ Nhận tài liệu tức thì qua Zalo
              </h4>
              <p className="text-[11px] text-[#8C7A6B] leading-relaxed mb-3">
                Bấm chat Zalo để nhận ngay file PDF: Bảng giá căn hộ, chính sách thanh toán sớm & mặt bằng quy hoạch chi tiết.
              </p>
              <button
                onClick={handleZaloClick}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Kết nối Zalo nhận tài liệu ngay
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                onClick={handleHotlineClick}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E8DCCB] hover:bg-[#FBF8F2] text-[#1F1B16] rounded-xl text-xs font-semibold transition-colors"
              >
                <Phone className="w-4 h-4 text-[#B88746]" />
                Gọi hotline
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F1B16] hover:bg-[#B88746] text-white rounded-xl text-xs font-semibold transition-all duration-300"
              >
                Tiếp tục xem
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
