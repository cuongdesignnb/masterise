'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, FileText, CalendarCheck, X } from 'lucide-react';
import { trackEvent } from '@/services/trackingService';
import LeadPriceForm from './LeadPriceForm';
import ScheduleVisitForm from './ScheduleVisitForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '@/providers/SiteSettingsProvider';

interface StickyLeadCTAProps {
  projectId?: number | null;
  projectName?: string;
}

export default function StickyLeadCTA({ projectId, projectName }: StickyLeadCTAProps) {
  const [activeModal, setActiveModal] = useState<'price' | 'visit' | null>(null);
  const { hotline, socialLinks } = useSiteSettings();
  const cleanPhone = hotline.replace(/[^\d+]/g, '');
  const zaloHandle = socialLinks.zalo.trim();
  const zaloUrl = /^https?:\/\//i.test(zaloHandle)
    ? zaloHandle
    : `https://zalo.me/${zaloHandle.replace(/\D/g, '') || zaloHandle}`;

  const handleHotlineCall = () => {
    if (!cleanPhone) return;
    trackEvent('click_hotline', { project_id: projectId });
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleZaloChat = () => {
    if (!zaloHandle) return;
    trackEvent('click_zalo', { project_id: projectId });
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  };

  const openPriceModal = () => {
    trackEvent('open_price_modal_mobile', { project_id: projectId });
    setActiveModal('price');
  };

  const openVisitModal = () => {
    trackEvent('open_visit_modal_mobile', { project_id: projectId });
    setActiveModal('visit');
  };

  return (
    <>
      {/* Mobile Sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#1F1B16] text-[#E8DCCB] border-t border-white/10 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.15)] select-none">
        <div className="grid grid-cols-4 items-center h-16 divide-x divide-white/5 font-body">
          {/* Hotline Button */}
          <button
            onClick={handleHotlineCall}
            disabled={!cleanPhone}
            aria-label={cleanPhone ? `Gọi hotline ${hotline}` : 'Hotline đang cập nhật'}
            className="flex flex-col items-center justify-center h-full text-white hover:text-[#B88746] transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            <Phone className="w-5 h-5 mb-1 text-[#B88746]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Gọi ngay</span>
          </button>

          {/* Zalo Button */}
          <button
            onClick={handleZaloChat}
            disabled={!zaloHandle}
            aria-label={zaloHandle ? 'Chat Zalo' : 'Zalo đang cập nhật'}
            className="flex flex-col items-center justify-center h-full hover:text-[#B88746] transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            <MessageSquare className="w-5 h-5 mb-1 text-sky-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chat Zalo</span>
          </button>

          {/* Price Form Button */}
          <button
            onClick={openPriceModal}
            className="flex flex-col items-center justify-center h-full hover:text-[#B88746] transition-colors"
          >
            <FileText className="w-5 h-5 mb-1 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1">Bảng giá</span>
          </button>

          {/* Schedule Button */}
          <button
            onClick={openVisitModal}
            className="flex flex-col items-center justify-center h-full hover:text-[#B88746] transition-colors"
          >
            <CalendarCheck className="w-5 h-5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1">Đặt lịch</span>
          </button>
        </div>
      </div>

      {/* Popups overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-[#E8DCCB] rounded-2xl w-full max-w-lg overflow-y-auto max-h-[85vh] shadow-2xl z-10 p-1"
            >
              {/* Close Header button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 hover:bg-[#FBF8F2] border border-[#E8DCCB]/60 text-[#8C7A6B] hover:text-[#1F1B16] rounded-full transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {activeModal === 'price' ? (
                <LeadPriceForm projectId={projectId} projectName={projectName} />
              ) : (
                <ScheduleVisitForm projectId={projectId} projectName={projectName} />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
