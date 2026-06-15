import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  message = 'Không thể kết nối máy chủ. Vui lòng thử lại.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <span className="text-4xl mb-3">⚠️</span>
      <p className="text-sm text-red-600 font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
