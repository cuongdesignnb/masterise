'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProjectVrScene } from '@/types/vr360';
import { Edit3, Trash2, Plus, ArrowLeft, Image as ImageIcon, MapPin, Check, Eye } from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';

interface VRSceneManagerProps {
  tourId: number;
  scenes: ProjectVrScene[];
  onConfigureHotspots: (scene: ProjectVrScene) => void;
  refetchTour: () => void;
}

export default function VRSceneManager({
  tourId,
  scenes,
  onConfigureHotspots,
  refetchTour
}: VRSceneManagerProps) {
  const [editingScene, setEditingScene] = useState<ProjectVrScene | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [panoramaUrl, setPanoramaUrl] = useState('');
  const [sceneType, setSceneType] = useState('other');
  const [initialYaw, setInitialYaw] = useState(0);
  const [initialPitch, setInitialPitch] = useState(0);
  const [initialZoom, setInitialZoom] = useState(80);
  const [autorotate, setAutorotate] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Media Library modal states
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setPanoramaUrl('');
    setSceneType('other');
    setInitialYaw(0);
    setInitialPitch(0);
    setInitialZoom(80);
    setAutorotate(false);
    setSortOrder(0);
    setIsActive(true);
    setEditingScene(null);
    setWarningMessage(null);
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (scene: ProjectVrScene) => {
    setEditingScene(scene);
    setTitle(scene.title);
    setSlug(scene.slug);
    setDescription(scene.description || '');
    setPanoramaUrl(scene.panorama_url);
    setSceneType(scene.scene_type);
    setInitialYaw(Number(scene.initial_yaw) || 0);
    setInitialPitch(Number(scene.initial_pitch) || 0);
    setInitialZoom(Number(scene.initial_zoom) || 80);
    setAutorotate(!!scene.autorotate);
    setSortOrder(scene.sort_order || 0);
    setIsActive(!!scene.is_active);
    setWarningMessage(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingScene) {
      // Auto slugify
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Add Scene Mutation
  const addSceneMutation = useMutation({
    mutationFn: async (data: any) => {
      setFormErrors({});
      return api.post<any>(`/admin/vr-tours/${tourId}/scenes`, data);
    },
    onSuccess: (res: any) => {
      refetchTour();
      setIsFormOpen(false);
      resetForm();
      if (res.warning) {
        alert(res.warning);
      }
    },
    onError: (err: any) => {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || 'Lỗi khi thêm cảnh mới.');
      }
    }
  });

  // Update Scene Mutation
  const updateSceneMutation = useMutation({
    mutationFn: async (data: any) => {
      setFormErrors({});
      return api.patch<any>(`/admin/vr-scenes/${editingScene?.id}`, data);
    },
    onSuccess: (res: any) => {
      refetchTour();
      setIsFormOpen(false);
      resetForm();
      if (res.warning) {
        alert(res.warning);
      }
    },
    onError: (err: any) => {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || 'Lỗi khi cập nhật cảnh.');
      }
    }
  });

  // Delete Scene Mutation
  const deleteSceneMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete<any>(`/admin/vr-scenes/${id}`);
    },
    onSuccess: () => {
      refetchTour();
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xóa cảnh.');
    }
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa cảnh "${title}"? Mọi hotspots trong cảnh này cũng sẽ bị xóa.`)) {
      deleteSceneMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      slug,
      description,
      panorama_url: panoramaUrl,
      scene_type: sceneType,
      initial_yaw: initialYaw,
      initial_pitch: initialPitch,
      initial_zoom: initialZoom,
      autorotate: autorotate ? 1 : 0,
      sort_order: sortOrder,
      is_active: isActive ? 1 : 0
    };

    if (editingScene) {
      updateSceneMutation.mutate(payload);
    } else {
      addSceneMutation.mutate(payload);
    }
  };

  const handleMediaSelect = (url: string | string[]) => {
    const selectedUrl = Array.isArray(url) ? url[0] : url;
    setPanoramaUrl(selectedUrl);
  };

  return (
    <div className="space-y-6">
      {/* 1. Form view */}
      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-[#E8DCCB] pb-3">
            <h4 className="font-heading font-medium text-sm text-[#1F1B16]">
              {editingScene ? `Sửa cảnh: ${editingScene.title}` : 'Thêm cảnh VR 360 mới'}
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-[#8C7A6B] hover:text-[#1F1B16] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên cảnh *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                placeholder="Ví dụ: Phòng khách căn mẫu"
              />
              {formErrors.title && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.title[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                placeholder="phong-khach-can-mau"
              />
              {formErrors.slug && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.slug[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả cảnh</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
              placeholder="Nhập mô tả ngắn gọn về không gian này..."
            />
          </div>

          {/* Image Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh Panorama (tỷ lệ 2:1)*</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={panoramaUrl}
                  onChange={(e) => setPanoramaUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                  placeholder="URL ảnh hoặc chọn từ thư viện..."
                />
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white hover:text-[#1F1B16] rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                >
                  <ImageIcon className="w-4 h-4" /> Thư viện
                </button>
              </div>
              {formErrors.panorama_url && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.panorama_url[0]}</p>}
              <p className="text-[10px] text-[#8C7A6B] mt-1">
                Lưu ý: Ảnh tải lên tối đa 15MB. Khuyên dùng ảnh panorama equirectangular tỷ lệ rộng/cao = 2:1.
              </p>
            </div>

            <div className="border border-[#E8DCCB] rounded-2xl bg-white overflow-hidden flex items-center justify-center h-28 relative">
              {panoramaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={panoramaUrl}
                  alt="Panorama Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-xs text-[#8C7A6B] space-y-1 p-2">
                  <ImageIcon className="w-6 h-6 mx-auto opacity-50" />
                  <p>Chưa chọn ảnh</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Góc nhìn ngang ban đầu (Yaw)</label>
              <input
                type="number"
                step="any"
                value={initialYaw}
                onChange={(e) => setInitialYaw(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                placeholder="Từ -180 đến 180"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Góc nhìn dọc ban đầu (Pitch)</label>
              <input
                type="number"
                step="any"
                value={initialPitch}
                onChange={(e) => setInitialPitch(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                placeholder="Từ -85 đến 85"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mức zoom ban đầu</label>
              <input
                type="number"
                value={initialZoom}
                onChange={(e) => setInitialZoom(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                placeholder="Từ 10 đến 120"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Loại cảnh</label>
              <select
                value={sceneType}
                onChange={(e) => setSceneType(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
              >
                <option value="overview">Toàn cảnh dự án</option>
                <option value="apartment">Căn hộ mẫu</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1F1B16] cursor-pointer">
              <input
                type="checkbox"
                checked={autorotate}
                onChange={(e) => setAutorotate(e.target.checked)}
                className="rounded text-[#B88746] focus:ring-[#B88746] w-4 h-4 border-[#E8DCCB]"
              />
              Tự động xoay cảnh chậm
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#1F1B16] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-[#B88746] focus:ring-[#B88746] w-4 h-4 border-[#E8DCCB]"
              />
              Hoạt động (Hiển thị ngoài web)
            </label>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#8C7A6B]">Thứ tự sắp xếp</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-[#E8DCCB] rounded-lg bg-white text-sm text-center"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#E8DCCB] pt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-[#E8DCCB] hover:border-[#8C7A6B] text-xs font-bold uppercase rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={addSceneMutation.isPending || updateSceneMutation.isPending}
              className="px-5 py-2 bg-[#B88746] hover:bg-[#1F1B16] text-[#1F1B16] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {editingScene ? 'Cập nhật cảnh' : 'Lưu cảnh'}
            </button>
          </div>
        </form>
      ) : (
        // 2. Scenes List
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-medium text-xs text-[#8C7A6B] uppercase tracking-wider">
              Danh sách Cảnh ({scenes.length})
            </h4>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white hover:text-[#1F1B16] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Thêm cảnh mới
            </button>
          </div>

          {scenes.length === 0 ? (
            <div className="border border-dashed border-[#E8DCCB] rounded-2xl p-10 text-center text-xs text-[#8C7A6B] space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto opacity-45 text-[#B88746]" />
              <p className="font-semibold text-sm text-[#1F1B16]">Chưa có cảnh nào trong Tour này</p>
              <p>Nhấp vào nút phía trên để bắt đầu thêm ảnh Panorama 360° đầu tiên.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-4 flex gap-4 hover:shadow-soft transition-all"
                >
                  <div className="w-24 h-20 bg-black rounded-lg overflow-hidden border border-[#E8DCCB] shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scene.panorama_url}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] text-white font-bold uppercase">
                      {scene.scene_type === 'overview' ? 'Tổng quan' : scene.scene_type === 'apartment' ? 'Căn hộ' : 'Khác'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="font-heading font-medium text-sm text-[#1F1B16] truncate">{scene.title}</h5>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          scene.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {scene.is_active ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8C7A6B] font-mono truncate">slug: {scene.slug}</p>
                      <p className="text-[10px] text-[#8C7A6B] mt-1">
                        Hotspots: <span className="font-bold text-[#1F1B16]">{scene.hotspots?.length || 0} điểm</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E8DCCB]/60">
                      <button
                        onClick={() => onConfigureHotspots(scene)}
                        className="px-2.5 py-1 bg-[#1F1B16] hover:bg-[#B88746] text-white hover:text-[#1F1B16] text-[10px] font-bold uppercase rounded-md transition-colors flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Điểm (Hotspots)
                      </button>
                      <button
                        onClick={() => handleOpenEdit(scene)}
                        className="p-1 hover:bg-[#E8DCCB]/60 text-[#8C7A6B] hover:text-[#1F1B16] rounded transition-colors"
                        title="Sửa cảnh"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(scene.id, scene.title)}
                        className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                        title="Xóa cảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Select Modal */}
      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
