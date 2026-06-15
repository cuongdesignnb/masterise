'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProjectVrScene, ProjectVrHotspot } from '@/types/vr360';
import { ArrowLeft, Plus, Edit2, Trash2, MapPin, Info, Compass, Sparkles, HelpCircle, Save, Check } from 'lucide-react';
import VR360Viewer from '@/components/vr360/VR360Viewer';

interface VRHotspotEditorProps {
  scene: ProjectVrScene;
  scenes: ProjectVrScene[];
  onBack: () => void;
  refetchTour: () => void;
}

export default function VRHotspotEditor({
  scene,
  scenes,
  onBack,
  refetchTour
}: VRHotspotEditorProps) {
  const [editingHotspot, setEditingHotspot] = useState<ProjectVrHotspot | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPlacementModeActive, setIsPlacementModeActive] = useState(true);

  // Form Fields
  const [type, setType] = useState('info');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [icon, setIcon] = useState('');
  const [targetSceneId, setTargetSceneId] = useState<string>('');
  const [ctaType, setCtaType] = useState('price_form');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const resetForm = () => {
    setType('info');
    setTitle('');
    setDescription('');
    setYaw(0);
    setPitch(0);
    setIcon('');
    setTargetSceneId('');
    setCtaType('price_form');
    setCtaLabel('');
    setCtaUrl('');
    setSortOrder(0);
    setIsActive(true);
    setEditingHotspot(null);
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (hotspot: ProjectVrHotspot) => {
    setEditingHotspot(hotspot);
    setType(hotspot.type);
    setTitle(hotspot.title);
    setDescription(hotspot.description || '');
    setYaw(Number(hotspot.yaw));
    setPitch(Number(hotspot.pitch));
    setIcon(hotspot.icon || '');
    setTargetSceneId(hotspot.target_scene_id ? String(hotspot.target_scene_id) : '');
    setCtaType(hotspot.cta_type || 'price_form');
    setCtaLabel(hotspot.cta_label || '');
    setCtaUrl(hotspot.cta_url || '');
    setSortOrder(hotspot.sort_order || 0);
    setIsActive(!!hotspot.is_active);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Add Hotspot Mutation
  const addHotspotMutation = useMutation({
    mutationFn: async (data: any) => {
      setFormErrors({});
      return api.post<any>(`/admin/vr-scenes/${scene.id}/hotspots`, data);
    },
    onSuccess: () => {
      refetchTour();
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || 'Lỗi khi thêm hotspot mới.');
      }
    }
  });

  // Update Hotspot Mutation
  const updateHotspotMutation = useMutation({
    mutationFn: async (data: any) => {
      setFormErrors({});
      return api.patch<any>(`/admin/vr-hotspots/${editingHotspot?.id}`, data);
    },
    onSuccess: () => {
      refetchTour();
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || 'Lỗi khi cập nhật hotspot.');
      }
    }
  });

  // Delete Hotspot Mutation
  const deleteHotspotMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete<any>(`/admin/vr-hotspots/${id}`);
    },
    onSuccess: () => {
      refetchTour();
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xóa hotspot.');
    }
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa điểm định vị "${title}"?`)) {
      deleteHotspotMutation.mutate(id);
    }
  };

  const handleViewerClick = (clickedPitch: number, clickedYaw: number) => {
    if (!isPlacementModeActive) return;

    setYaw(Number(clickedYaw.toFixed(4)));
    setPitch(Number(clickedPitch.toFixed(4)));

    if (!isFormOpen) {
      resetForm();
      setYaw(Number(clickedYaw.toFixed(4)));
      setPitch(Number(clickedPitch.toFixed(4)));
      setIsFormOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      type,
      title,
      description,
      yaw,
      pitch,
      icon,
      target_scene_id: type === 'navigation' && targetSceneId ? Number(targetSceneId) : null,
      cta_type: type === 'lead' ? ctaType : null,
      cta_label: type === 'lead' ? ctaLabel : null,
      cta_url: type === 'lead' || type === 'info' ? ctaUrl : null,
      sort_order: sortOrder,
      is_active: isActive ? 1 : 0
    };

    if (editingHotspot) {
      updateHotspotMutation.mutate(payload);
    } else {
      addHotspotMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#E8DCCB] pb-3">
        <div>
          <h4 className="font-heading font-medium text-sm text-[#1F1B16]">
            Thiết lập Hotspots: {scene.title}
          </h4>
          <p className="text-[11px] text-[#8C7A6B]">
            Xoay ảnh 360° bên dưới và bấm chuột trực tiếp để tự động điền Yaw/Pitch định vị
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#8C7A6B] hover:text-[#1F1B16] flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: 360 viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8C7A6B]">Trình xem trực quan:</span>
              <button
                type="button"
                onClick={() => setIsPlacementModeActive(!isPlacementModeActive)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  isPlacementModeActive
                    ? 'bg-[#B88746] text-[#1F1B16] shadow-sm'
                    : 'bg-[#E8DCCB]/40 text-[#8C7A6B]'
                }`}
              >
                {isPlacementModeActive ? '● Chế độ định vị ON' : 'Chế độ định vị OFF'}
              </button>
            </div>
          </div>

          <div className="h-[400px] border border-[#E8DCCB]/30 rounded-2xl overflow-hidden relative shadow-inner">
            <VR360Viewer
              scenes={[scene]}
              currentSceneSlug={scene.slug}
              onSceneChange={() => {}}
              onViewerClick={handleViewerClick}
            />
            {isPlacementModeActive && (
              <div className="absolute top-2 left-2 bg-[#1F1B16]/90 border border-[#B88746]/45 px-3 py-1.5 rounded-xl text-[10px] text-[#E8DCCB] pointer-events-none z-20">
                Mẹo: Xoay và bấm chuột vào vị trí bất kỳ trên hình để lấy tọa độ!
              </div>
            )}
          </div>
        </div>

        {/* Right column: Form / Hotspots list */}
        <div className="space-y-4">
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                <h5 className="font-heading font-medium text-xs text-[#1F1B16] uppercase tracking-wider">
                  {editingHotspot ? 'Sửa điểm định vị' : 'Thêm điểm định vị mới'}
                </h5>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[10px] font-bold text-[#8C7A6B] hover:text-[#1F1B16]"
                >
                  Đóng form
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Tọa độ Pitch *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                    placeholder="-85 đến 85"
                  />
                  {formErrors.pitch && <p className="text-[9px] text-red-500">{formErrors.pitch[0]}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Tọa độ Yaw *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={yaw}
                    onChange={(e) => setYaw(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                    placeholder="-180 đến 180"
                  />
                  {formErrors.yaw && <p className="text-[9px] text-red-500">{formErrors.yaw[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Loại điểm định vị *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                >
                  <option value="info">Thông tin dự án (Info)</option>
                  <option value="navigation">Chuyển cảnh (Navigation)</option>
                  <option value="lead">Biểu mẫu đăng ký (Lead CTA)</option>
                  <option value="media">Hình ảnh/Đồ họa (Media)</option>
                  <option value="map">Bản đồ kết nối (Map)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Tiêu đề điểm định vị *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                  placeholder="Ví dụ: Căn hộ mẫu 2 phòng ngủ"
                />
                {formErrors.title && <p className="text-[9px] text-red-500">{formErrors.title[0]}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                  placeholder="Nhập ghi chú nhỏ hoặc thông số..."
                />
              </div>

              {/* Conditionally render form fields depending on Type */}
              {type === 'navigation' && (
                <div>
                  <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Cảnh chuyển tiếp đến *</label>
                  <select
                    required
                    value={targetSceneId}
                    onChange={(e) => setTargetSceneId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                  >
                    <option value="">-- Chọn cảnh đích --</option>
                    {scenes
                      .filter((s) => s.id !== scene.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.slug})
                        </option>
                      ))}
                  </select>
                  {formErrors.target_scene_id && <p className="text-[9px] text-red-500">{formErrors.target_scene_id[0]}</p>}
                </div>
              )}

              {type === 'lead' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Loại biểu mẫu (CTA Type)</label>
                    <select
                      value={ctaType}
                      onChange={(e) => setCtaType(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                    >
                      <option value="price_form">Báo giá & Giỏ hàng mẫu</option>
                      <option value="schedule_visit">Đặt lịch xem dự án</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Nhãn nút bấm (CTA Label) *</label>
                    <input
                      type="text"
                      required
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                      placeholder="Ví dụ: Nhận bảng báo giá chi tiết"
                    />
                  </div>
                </div>
              )}

              {(type === 'lead' || type === 'info') && (
                <div>
                  <label className="block text-[10px] font-semibold text-[#8C7A6B] mb-0.5">Link bổ sung (Hotline/Zalo URL)</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg bg-white text-xs"
                    placeholder="https://zalo.me/... hoặc link ngoài"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-[#1F1B16] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#B88746] focus:ring-[#B88746] w-3.5 h-3.5 border-[#E8DCCB]"
                  />
                  Hoạt động
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#8C7A6B]">Sắp xếp</span>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-12 px-1 py-0.5 border border-[#E8DCCB] rounded text-center text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E8DCCB]/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-[10px] font-bold uppercase"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addHotspotMutation.isPending || updateHotspotMutation.isPending}
                  className="px-4 py-1.5 bg-[#B88746] text-[#1F1B16] text-[10px] font-bold uppercase rounded-lg shadow-sm disabled:opacity-50"
                >
                  {editingHotspot ? 'Lưu cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-heading font-medium text-xs text-[#8C7A6B] uppercase tracking-wider">
                  Hotspots của cảnh ({scene.hotspots?.length || 0})
                </h5>
                <button
                  onClick={handleOpenAdd}
                  className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white hover:text-[#1F1B16] text-[10px] font-bold uppercase rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo điểm
                </button>
              </div>

              {(!scene.hotspots || scene.hotspots.length === 0) ? (
                <div className="border border-dashed border-[#E8DCCB] rounded-2xl p-6 text-center text-[11px] text-[#8C7A6B] space-y-1 bg-[#FBF8F2]/40">
                  <MapPin className="w-6 h-6 mx-auto opacity-50 text-[#B88746]" />
                  <p className="font-semibold text-xs text-[#1F1B16]">Cảnh này chưa có hotspots</p>
                  <p>Bật chế độ định vị, nhấp trực tiếp vào trình xem để tạo nhanh điểm định vị.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {scene.hotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl p-3 space-y-2 hover:shadow-soft transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              hotspot.type === 'navigation'
                                ? 'bg-amber-500'
                                : hotspot.type === 'lead'
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                            }`} />
                            <h6 className="font-semibold text-xs text-[#1F1B16] leading-tight">{hotspot.title}</h6>
                          </div>
                          <p className="text-[9px] text-[#8C7A6B] mt-0.5">
                            Type: <span className="font-bold text-gray-700">{hotspot.type}</span> | Tọa độ: Pitch {Number(hotspot.pitch).toFixed(1)}°, Yaw {Number(hotspot.yaw).toFixed(1)}°
                          </p>
                          {hotspot.description && (
                            <p className="text-[10px] text-[#8C7A6B] leading-snug line-clamp-2 mt-1">{hotspot.description}</p>
                          )}
                           {hotspot.type === 'navigation' && (hotspot.targetScene || hotspot.target_scene) && (
                            <p className="text-[9px] text-[#B88746] mt-1 bg-amber-50/50 border border-amber-200/50 rounded px-1.5 py-0.5 inline-block">
                              Đích: {hotspot.targetScene?.title || hotspot.target_scene?.title || hotspot.targetScene?.slug || hotspot.target_scene?.slug || 'N/A'}
                            </p>
                          )}
                          {hotspot.type === 'lead' && (
                            <p className="text-[9px] text-emerald-700 mt-1 bg-emerald-50/50 border border-emerald-200/50 rounded px-1.5 py-0.5 inline-block">
                              CTA: {hotspot.cta_label} ({hotspot.cta_type})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-[#E8DCCB]/60">
                        <button
                          onClick={() => handleOpenEdit(hotspot)}
                          className="p-1 hover:bg-[#E8DCCB]/60 text-[#8C7A6B] hover:text-[#1F1B16] rounded transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(hotspot.id, hotspot.title)}
                          className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
