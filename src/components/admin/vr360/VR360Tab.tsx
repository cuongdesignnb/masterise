'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProjectVrTour, ProjectVrScene } from '@/types/vr360';
import { Compass, Settings, Image as ImageIcon, Sparkles, Loader2, Save, FileWarning, Eye } from 'lucide-react';
import VRSceneManager from './VRSceneManager';
import VRHotspotEditor from './VRHotspotEditor';
import MediaSelectModal from '@/components/admin/MediaSelectModal';

interface VR360TabProps {
  projectId?: number;
  projectName: string;
}

export default function VR360Tab({ projectId, projectName }: VR360TabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'scenes' | 'settings'>('scenes');
  const [activeHotspotScene, setActiveHotspotScene] = useState<ProjectVrScene | null>(null);

  // Tour settings form fields
  const [tourTitle, setTourTitle] = useState('');
  const [tourDescription, setTourDescription] = useState('');
  const [tourCoverImage, setTourCoverImage] = useState('');
  const [tourIsActive, setTourIsActive] = useState(true);

  // Fallback virtual_tour_url from Project
  const [virtualTourUrl, setVirtualTourUrl] = useState('');

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // 1. Fetch VR Tour Data
  const { data: response, isLoading, refetch, isError } = useQuery({
    queryKey: ['admin-vr-tour', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await api.get<any>(`/admin/projects/${projectId}/vr-tour`);
      const tourData = res.data?.tour;
      if (tourData) {
        setTourTitle(tourData.title || '');
        setTourDescription(tourData.description || '');
        setTourCoverImage(tourData.cover_image || '');
        setTourIsActive(!!tourData.is_active);
      }
      if (res.data?.virtual_tour_url) {
        setVirtualTourUrl(res.data.virtual_tour_url);
      }
      return res.data;
    },
    enabled: !!projectId,
  });

  const tour = response?.tour;
  const scenes: ProjectVrScene[] = response?.tour?.scenes || [];

  // Update activeHotspotScene details when query refetches to keep hotspots updated
  React.useEffect(() => {
    if (activeHotspotScene && scenes.length > 0) {
      const updated = scenes.find((s) => s.id === activeHotspotScene.id);
      if (updated) {
        setActiveHotspotScene(updated);
      }
    }
  }, [scenes, activeHotspotScene]);

  // 2. Initialize/Create VR Tour Mutation
  const createTourMutation = useMutation({
    mutationFn: async () => {
      return api.post<any>(`/admin/projects/${projectId}/vr-tour`, {
        title: `Tour 360° dự án ${projectName}`,
        description: `Trải nghiệm thực tế ảo VR 360° chính thức của dự án ${projectName}`,
        is_active: true
      });
    },
    onSuccess: () => {
      refetch();
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi khởi tạo VR Tour.');
    }
  });

  // 3. Save Tour Settings Mutation
  const saveTourMutation = useMutation({
    mutationFn: async (data: any) => {
      setFormErrors({});
      return api.post<any>(`/admin/projects/${projectId}/vr-tour`, data);
    },
    onSuccess: () => {
      refetch();
      alert('Cập nhật cấu hình VR Tour thành công!');
    },
    onError: (err: any) => {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || 'Lỗi khi lưu cấu hình VR Tour.');
      }
    }
  });

  if (!projectId) {
    return (
      <div className="border border-dashed border-[#E8DCCB] rounded-2xl p-10 text-center text-xs text-[#8C7A6B] bg-[#FBF8F2]/40">
        <FileWarning className="w-8 h-8 mx-auto opacity-50 text-[#B88746]" />
        <p className="font-semibold text-sm text-[#1F1B16] mt-2">Dự án chưa được khởi tạo</p>
        <p className="mt-1">Vui lòng lưu thông tin dự án trước khi có thể thiết lập không gian VR 360°.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-[#8C7A6B] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#B88746]" />
        <p>Đang tải cấu hình VR Tour...</p>
      </div>
    );
  }

  // If tour does not exist, display setup CTA
  if (!tour) {
    return (
      <div className="border border-dashed border-[#E8DCCB] rounded-2xl p-12 text-center text-xs text-[#8C7A6B] space-y-4 bg-[#FBF8F2]/50">
        <Compass className="w-10 h-10 mx-auto text-[#B88746] animate-pulse" />
        <div className="max-w-md mx-auto space-y-1">
          <h4 className="font-heading font-medium text-sm text-[#1F1B16]">
            Khởi tạo trải nghiệm VR 360° cho {projectName}
          </h4>
          <p>
            Tích hợp trực tiếp các không gian ảo 3D, căn mẫu Branded Residences hoặc sa bàn đô thị ảo vào trang chi tiết dự án công khai.
          </p>
        </div>
        <button
          onClick={() => createTourMutation.mutate()}
          disabled={createTourMutation.isPending}
          className="px-6 py-2.5 bg-[#1F1B16] hover:bg-[#B88746] text-white hover:text-[#1F1B16] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {createTourMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Compass className="w-4 h-4" />
          )}
          Bắt đầu tích hợp VR 360°
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Switcher - only show if not configuring hotspots to keep focus */}
      {!activeHotspotScene && (
        <div className="flex border-b border-[#E8DCCB] text-xs font-semibold select-none">
          <button
            onClick={() => setActiveSubTab('scenes')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'scenes'
                ? 'border-[#B88746] text-[#B88746]'
                : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
            }`}
          >
            <Compass className="w-4 h-4" /> Quản lý cảnh quan (Scenes)
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'border-[#B88746] text-[#B88746]'
                : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
            }`}
          >
            <Settings className="w-4 h-4" /> Cấu hình Tour chung
          </button>
        </div>
      )}

      {/* Main View Container */}
      <div className="space-y-4">
        {activeSubTab === 'scenes' ? (
          activeHotspotScene ? (
            <VRHotspotEditor
              scene={activeHotspotScene}
              scenes={scenes}
              onBack={() => setActiveHotspotScene(null)}
              refetchTour={refetch}
            />
          ) : (
            <VRSceneManager
              tourId={tour.id}
              scenes={scenes}
              onConfigureHotspots={(scene) => setActiveHotspotScene(scene)}
              refetchTour={refetch}
            />
          )
        ) : (
          /* Tour Settings Tab */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveTourMutation.mutate({
                title: tourTitle,
                description: tourDescription,
                cover_image: tourCoverImage,
                is_active: tourIsActive ? 1 : 0
              });
            }}
            className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-6 space-y-4"
          >
            <h4 className="font-heading font-medium text-xs text-[#8C7A6B] uppercase tracking-wider border-b border-[#E8DCCB]/60 pb-2">
              Thông tin cấu hình Tour 360
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề Tour *</label>
              <input
                type="text"
                required
                value={tourTitle}
                onChange={(e) => setTourTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                placeholder="Tiêu đề hiển thị trong trình duyệt hoặc SEO"
              />
              {formErrors.title && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.title[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả ngắn</label>
              <textarea
                value={tourDescription}
                onChange={(e) => setTourDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                placeholder="Mô tả tóm tắt nội dung tham quan ảo..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh bìa (Cover Image)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tourCoverImage}
                    onChange={(e) => setTourCoverImage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
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
              </div>

              <div className="border border-[#E8DCCB] rounded-2xl bg-white overflow-hidden flex items-center justify-center h-28">
                {tourCoverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tourCoverImage}
                    alt="Cover Preview"
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

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#1F1B16] cursor-pointer">
                <input
                  type="checkbox"
                  checked={tourIsActive}
                  onChange={(e) => setTourIsActive(e.target.checked)}
                  className="rounded text-[#B88746] focus:ring-[#B88746] w-4 h-4 border-[#E8DCCB]"
                />
                Trạng thái hoạt động (Mở hiển thị VR ngoài website)
              </label>
            </div>

            {/* Read-only reference for virtual_tour_url fallback */}
            <div className="bg-[#E8DCCB]/20 rounded-xl p-3 text-xs text-[#8C7A6B] space-y-1">
              <p className="font-semibold text-[#1F1B16]">Đường dẫn dự phòng (Iframe Fallback)</p>
              <p className="text-[10px]">
                URL: <span className="font-mono text-gray-700">{virtualTourUrl || 'Không có'}</span>
              </p>
              <p className="text-[10px]">
                * Bạn có thể thay đổi đường dẫn dự phòng này trong tab <strong>"Vị trí & Giá"</strong> của dự án.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E8DCCB] pt-4">
              <button
                type="submit"
                disabled={saveTourMutation.isPending}
                className="px-5 py-2 bg-[#B88746] hover:bg-[#1F1B16] text-[#1F1B16] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Lưu cấu hình
              </button>
            </div>
          </form>
        )}
      </div>

      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setTourCoverImage(Array.isArray(url) ? url[0] : url)}
      />
    </div>
  );
}
