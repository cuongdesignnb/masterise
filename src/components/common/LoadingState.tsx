import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ message = 'Đang tải dữ liệu...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-10 h-10 border-4 border-[#B88746] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm text-[#8C7A6B] font-medium">{message}</p>
    </div>
  );
}
