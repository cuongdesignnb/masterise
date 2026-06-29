'use client';

import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';

type AdminImagePreviewProps = {
  value?: string | string[] | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  multiple?: boolean;
  className?: string;
  onRemove?: (url: string, index?: number) => void;
};

function isImageUrl(url?: string | null) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(url) || url.includes('/storage/media/');
}

function fileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(pathname.split('/').filter(Boolean).pop() || 'Tệp đã chọn');
  } catch {
    return url.split('/').filter(Boolean).pop() || 'Tệp đã chọn';
  }
}

const sizeClass = {
  sm: 'h-20',
  md: 'h-28',
  lg: 'h-40',
};

export default function AdminImagePreview({
  value,
  label,
  size = 'md',
  multiple = false,
  className = '',
  onRemove,
}: AdminImagePreviewProps) {
  const urls = (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

  if (!urls.length) {
    return (
      <div className={`rounded-xl border border-dashed border-[#E8DCCB] bg-[#FBF8F2] p-4 text-center ${className}`}>
        <ImageIcon className="mx-auto h-6 w-6 text-[#B88746]/50" />
        <p className="mt-2 text-xs font-semibold text-[#8C7A6B]">{label || 'Chưa chọn ảnh'}</p>
      </div>
    );
  }

  return (
    <div className={`${multiple ? 'grid grid-cols-2 gap-3 md:grid-cols-3' : 'space-y-2'} ${className}`}>
      {urls.map((url, index) => {
        const image = isImageUrl(url);
        return (
          <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-[#E8DCCB] bg-white">
            <div className={`relative ${sizeClass[size]} bg-[#FBF8F2]`}>
              {image ? (
                <img src={url} alt={label || fileNameFromUrl(url)} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#8C7A6B]">
                  {url.toLowerCase().includes('.pdf') ? <FileText className="h-7 w-7" /> : <LinkIcon className="h-7 w-7" />}
                  <span className="text-[11px] font-semibold">{url.toLowerCase().includes('.pdf') ? 'Tệp PDF' : 'Liên kết'}</span>
                </div>
              )}
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(url, index)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition hover:bg-red-50"
                  title="Xóa"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-2 p-2">
              <p className="min-w-0 truncate text-[11px] font-semibold text-[#1F1B16]" title={url}>
                {multiple ? `${index + 1}. ` : ''}{fileNameFromUrl(url)}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg p-1.5 text-[#B88746] transition hover:bg-[#FBF8F2]"
                title="Mở ảnh"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { isImageUrl };
