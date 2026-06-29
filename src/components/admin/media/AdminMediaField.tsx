'use client';

import { ExternalLink, Trash2 } from 'lucide-react';
import AdminImagePreview from './AdminImagePreview';

type AdminMediaFieldProps = {
  label: string;
  value?: string | null;
  placeholder?: string;
  onChange: (url: string) => void;
  onOpenMediaLibrary?: () => void;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  readOnlyInput?: boolean;
};

export default function AdminMediaField({
  label,
  value,
  placeholder,
  onChange,
  onOpenMediaLibrary,
  description,
  size = 'md',
  readOnlyInput = false,
}: AdminMediaFieldProps) {
  const currentValue = value || '';

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-semibold text-[#8C7A6B]">{label}</label>
        {description ? <p className="mt-1 text-[11px] leading-4 text-[#8C7A6B]">{description}</p> : null}
      </div>

      <AdminImagePreview
        value={currentValue}
        label="Chưa chọn ảnh"
        size={size}
        onRemove={currentValue ? () => onChange('') : undefined}
      />

      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="text"
          value={currentValue}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnlyInput}
          className="w-full rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 py-2 text-xs text-[#1F1B16] outline-none focus:ring-1 focus:ring-[#B88746]"
          placeholder={placeholder || 'Dán URL hoặc chọn từ Media Library'}
        />
        <div className="flex flex-wrap gap-2">
          {onOpenMediaLibrary ? (
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="rounded-xl bg-[#1F1B16] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#B88746]"
            >
              Chọn ảnh
            </button>
          ) : null}
          {currentValue ? (
            <>
              <a
                href={currentValue}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-xs font-semibold text-[#1F1B16] transition hover:bg-[#FBF8F2]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Mở
              </a>
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
