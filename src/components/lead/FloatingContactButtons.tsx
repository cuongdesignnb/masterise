'use client';

import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { trackEvent } from '@/services/trackingService';

interface FloatingContactButtonsProps {
  projectId?: number | null;
}

export default function FloatingContactButtons({ projectId }: FloatingContactButtonsProps) {
  const hotline = '0901234567';
  const zaloPhone = '0901234567';
  const zaloUrl = `https://zalo.me/${zaloPhone}`;

  const handleHotlineCall = () => {
    trackEvent('click_hotline', { project_id: projectId, source: 'floating_button' });
    window.open(`tel:${hotline}`);
  };

  const handleZaloChat = () => {
    trackEvent('click_zalo', { project_id: projectId, source: 'floating_button' });
    window.open(zaloUrl, '_blank');
  };

  return (
    <div className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-40 flex flex-col gap-4">
      {/* Zalo Button */}
      <button
        onClick={handleZaloChat}
        className="group relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-sky-500 text-white rounded-full shadow-lg hover:shadow-sky-400/30 hover:scale-110 transition-all duration-300 active:scale-95"
        title="Chat Zalo"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-sky-500 opacity-40 animate-ping duration-1000 pointer-events-none" />
        
        <MessageSquare className="w-6 h-6 relative z-10" />

        {/* Hover Label */}
        <span className="absolute right-14 lg:right-16 bg-[#1F1B16] text-[#E8DCCB] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#B88746]/20 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Chat Zalo
        </span>
      </button>

      {/* Hotline Button */}
      <button
        onClick={handleHotlineCall}
        className="group relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-[#B88746] text-white rounded-full shadow-lg hover:shadow-[#B88746]/30 hover:scale-110 transition-all duration-300 active:scale-95"
        title="Gọi Hotline"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-[#B88746] opacity-40 animate-ping duration-1000 pointer-events-none" style={{ animationDelay: '0.2s' }} />

        <Phone className="w-5 h-5 lg:w-6 lg:h-6 relative z-10 animate-shake" />

        {/* Hover Label */}
        <span className="absolute right-14 lg:right-16 bg-[#1F1B16] text-[#E8DCCB] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#B88746]/20 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Hotline: 090 123 4567
        </span>
      </button>

      {/* Inline styles for shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 2.5s infinite;
        }
      `}</style>
    </div>
  );
}
