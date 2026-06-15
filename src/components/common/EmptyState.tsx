import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  title = 'Không tìm thấy dữ liệu',
  description = 'Hiện tại chưa có mục nào hiển thị trong danh mục này.',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <span className="text-4xl mb-3">📭</span>
      <h4 className="text-base font-bold text-[#1F1B16] mb-1">{title}</h4>
      <p className="text-xs text-[#8C7A6B] max-w-sm">{description}</p>
    </div>
  );
}
