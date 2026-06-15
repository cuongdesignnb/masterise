import React from 'react';
import { Sparkles } from 'lucide-react';

export default function VR360Skeleton() {
  return (
    <div className="w-full h-[450px] lg:h-[600px] bg-[#1F1B16]/95 border border-[#E8DCCB]/25 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center text-[#E8DCCB] select-none shadow-xl">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />

      {/* Loading content */}
      <div className="z-10 flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#B88746] border-t-transparent rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-[#B88746] absolute inset-0 m-auto animate-pulse" />
        </div>
        <div>
          <h4 className="font-heading font-medium text-lg text-white tracking-wide">
            Đang khởi tạo không gian VR 360°
          </h4>
          <p className="text-xs text-[#8C7A6B] mt-1.5 leading-relaxed">
            Vui lòng chờ trong giây lát để tải dữ liệu hình ảnh panorama chất lượng cao...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  );
}
