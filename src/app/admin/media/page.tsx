'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Media } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Copy, Trash2, Search, Check, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export default function MediaManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Fetch media library
  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media', search, page],
    queryFn: async () => {
      const response = await api.get<Media[]>(`/media?q=${search}&page=${page}&per_page=18`);
      return response;
    },
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      return api.upload<Media>('/media/upload', file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setUploading(false);
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi upload file.');
      setUploading(false);
    },
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xóa file.');
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

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const mediaList = mediaData?.data || [];
  const meta = mediaData?.meta;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Thư viện Media</h1>
          <p className="text-sm text-[#8C7A6B]">Tải lên hình ảnh dự án, tài liệu brochure và tự động tối ưu hóa WebP</p>
        </div>

        {/* Upload Button */}
        <label className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 shadow-sm hover:shadow">
          <Upload className="w-4 h-4" />
          {uploading ? 'Đang tải lên...' : 'Tải file lên'}
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
            className="block w-full pl-9 pr-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-sm"
          />
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs font-medium bg-[#FBF8F2] hover:bg-[#B88746]/5 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs text-[#8C7A6B] self-center">
              Trang {page} / {meta.last_page}
            </span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs font-medium bg-[#FBF8F2] hover:bg-[#B88746]/5 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Chưa có file nào trong thư viện.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {mediaList.map((file) => {
              const isImage = file.mime_type.startsWith('image/');
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={file.id}
                  className="bg-white border border-[#E8DCCB] rounded-xl overflow-hidden flex flex-col justify-between group hover:shadow-[0_4px_15px_rgba(27,27,27,0.03)] transition-all relative"
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-[#FBF8F2] relative overflow-hidden flex items-center justify-center shrink-0 border-b border-[#E8DCCB]/60">
                    {isImage ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-12 h-12 text-[#B88746]/40" />
                    )}

                    {/* Hover actions overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                      <button
                        onClick={() => copyToClipboard(file.url, file.id)}
                        className="p-1.5 bg-white hover:bg-[#B88746] hover:text-white rounded-lg text-[#1F1B16] transition-colors"
                        title="Copy link"
                      >
                        {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
                            deleteMutation.mutate(file.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 bg-white hover:bg-red-600 hover:text-white rounded-lg text-red-600 transition-colors"
                        title="Xóa file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 space-y-1 min-w-0">
                    <span className="block text-xs font-semibold text-[#1F1B16] truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="block text-[10px] text-[#8C7A6B]">
                      {formatSize(file.size)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
