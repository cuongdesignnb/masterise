'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Media } from '@/types/api';
import { motion } from 'framer-motion';
import { X, Search, Upload, FileText, Check, Loader2 } from 'lucide-react';

interface MediaSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string | string[]) => void;
  multiple?: boolean;
  selectedUrls?: string[];
}

export default function MediaSelectModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedUrls = [],
}: MediaSelectModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedUrls);

  // Fetch media library
  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media-select', search, page],
    queryFn: async () => {
      const response = await api.get<Media[]>(`/media?q=${search}&page=${page}&per_page=12`);
      return response;
    },
    enabled: isOpen,
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      return api.upload<Media>('/media/upload', file);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['media-select'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setUploading(false);

      // Auto-select uploaded file
      const fileUrl = response.data.url;
      if (multiple) {
        setTempSelected((prev) => [...prev, fileUrl]);
      } else {
        onSelect(fileUrl);
        onClose();
      }
    },
    onError: (err: unknown) => {
      alert(err instanceof Error ? err.message : 'Lỗi khi tải file lên.');
      setUploading(false);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        uploadMutation.mutate(file);
      });
    }
  };

  const handleSelectFile = (url: string) => {
    if (multiple) {
      if (tempSelected.includes(url)) {
        setTempSelected(tempSelected.filter((u) => u !== url));
      } else {
        setTempSelected([...tempSelected, url]);
      }
    } else {
      onSelect(url);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    onSelect(tempSelected);
    onClose();
  };

  const handleClearSelection = () => {
    setTempSelected([]);
  };

  const mediaList = mediaData?.data || [];
  const meta = mediaData?.meta;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        className="relative bg-white border border-[#E8DCCB] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10 font-body text-[#1F1B16]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
          <div>
            <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
              {multiple ? 'Chọn nhiều file từ Thư viện Media' : 'Chọn một file từ Thư viện Media'}
            </h3>
            <p className="text-xs text-[#8C7A6B]">
              {multiple
                ? 'File đang chọn sẽ có viền nổi bật và dấu tích. Bấm “Xác nhận chọn file” để cập nhật danh sách.'
                : 'Bấm vào một file để chọn ngay hoặc tải file mới lên.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#E8DCCB]/40 text-[#8C7A6B] hover:text-[#1F1B16] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8DCCB]/60 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#FBF8F2]/30">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full pl-9 pr-3 py-1.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Upload inline */}
            <label className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300">
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? 'Đang tải...' : 'Tải file mới lên'}
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2 py-1 border border-[#E8DCCB] rounded-lg text-[10px] font-medium bg-white hover:bg-[#B88746]/5 disabled:opacity-50"
                >
                  Trước
                </button>
                  <span className="text-[10px] text-[#8C7A6B] self-center px-1">
                    Trang {page} / {meta.last_page}
                  </span>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-2 py-1 border border-[#E8DCCB] rounded-lg text-[10px] font-medium bg-white hover:bg-[#B88746]/5 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-xl border border-[#E8DCCB]/60" />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="p-12 text-center text-[#8C7A6B] text-xs">
              Chưa có file nào khớp trong thư viện. Vui lòng tải file lên.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {mediaList.map((file) => {
                const isImage = file.mime_type.startsWith('image/');
                const isSelected = tempSelected.includes(file.url);
                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file.url)}
                    className={`bg-white border rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all relative group aspect-square select-none ${
                      isSelected
                        ? 'border-[#B88746] ring-2 ring-[#B88746]/30 shadow-md'
                        : 'border-[#E8DCCB] hover:border-[#B88746]/60 hover:shadow-sm'
                    }`}
                  >
                    {/* File Preview */}
                    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                      {isImage ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-8 h-8 text-[#B88746]/40" />
                      )}

                      {/* Selection indicator overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#B88746]/10 flex items-center justify-center">
                          <div className="p-1 bg-[#B88746] text-white rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      {!isSelected && (
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    {/* Metadata (absolute small banner at bottom) */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white p-1 text-[8px] truncate">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
          <div className="text-xs text-[#8C7A6B]">
            {multiple
              ? `Đã chọn ${tempSelected.length} file`
              : 'Bấm vào file để chọn ngay'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E8DCCB] rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            {multiple && (
              <>
                <button
                  onClick={handleClearSelection}
                  disabled={tempSelected.length === 0}
                  className="px-4 py-2 border border-red-200 bg-white text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Bỏ chọn tất cả
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="px-5 py-2 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  Xác nhận chọn file ({tempSelected.length})
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
