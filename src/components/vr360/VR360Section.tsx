'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vr360Service } from '@/services/vr360Service';
import { trackEvent } from '@/services/trackingService';
import { useSiteSettings } from '@/providers/SiteSettingsProvider';
import { Sparkles, Maximize2, RefreshCw, Phone, MessageSquare, AlertCircle, FileText, X } from 'lucide-react';
import VR360Viewer from './VR360Viewer';
import VR360SceneSelector from './VR360SceneSelector';
import VR360FullscreenModal from './VR360FullscreenModal';
import VR360Skeleton from './VR360Skeleton';
import LeadPriceForm from '@/components/lead/LeadPriceForm';
import ScheduleVisitForm from '@/components/lead/ScheduleVisitForm';
import { motion, AnimatePresence } from 'framer-motion';

interface VR360SectionProps {
  projectId: number;
  projectSlug: string;
  projectName: string;
  fallbackUrl?: string | null;
}

export default function VR360Section({
  projectId,
  projectSlug,
  projectName,
  fallbackUrl
}: VR360SectionProps) {
  const { hotline, socialLinks } = useSiteSettings();
  const [currentSceneSlug, setCurrentSceneSlug] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webGlError, setWebGlError] = useState<string | null>(null);
  
  // Modal states for CTAs within VR
  const [activeForm, setActiveForm] = useState<'price_form' | 'schedule_visit' | null>(null);
  const [ctaContext, setCtaContext] = useState<{ sceneTitle: string; hotspotTitle: string } | null>(null);

  // Fetch VR Tour Data
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['vr-tour', projectSlug],
    queryFn: async () => {
      try {
        const res = await vr360Service.getProjectVrTour(projectSlug);
        // Set first scene as active when loaded
        if (res.data?.scenes && res.data.scenes.length > 0) {
          setCurrentSceneSlug(res.data.scenes[0].slug);
        }
        return res.data;
      } catch (err: any) {
        // If 404, we gracefully fallback
        if (err.status === 404) {
          return { tour: null, scenes: [], virtual_tour_url: fallbackUrl || null };
        }
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const tour = response?.tour;
  const scenes = response?.scenes || [];
  const finalFallbackUrl = response?.virtual_tour_url || fallbackUrl;

  const handleSceneChange = (slug: string) => {
    setCurrentSceneSlug(slug);
  };

  const handleCtaClick = (type: 'price_form' | 'schedule_visit', sceneTitle: string, hotspotTitle: string) => {
    trackEvent('click_vr_cta', {
      project_id: projectId,
      cta_type: type,
      scene_title: sceneTitle,
      hotspot_title: hotspotTitle,
      source: 'vr360_hotspot'
    });
    setCtaContext({ sceneTitle, hotspotTitle });
    setActiveForm(type);
  };

  const openFullscreen = () => {
    trackEvent('enter_vr_fullscreen', { project_id: projectId });
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    trackEvent('exit_vr_fullscreen', { project_id: projectId });
    setIsFullscreen(false);
  };

  const triggerOpenVR = () => {
    trackEvent('open_vr360', { project_id: projectId });
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-12">
        <VR360Skeleton />
      </div>
    );
  }

  // 2. Error Fallback (WebGL/Canvas not supported)
  if (webGlError) {
    return (
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full bg-[#1F1B16] border border-[#E8DCCB]/20 rounded-2xl p-8 lg:p-12 text-center text-[#E8DCCB] space-y-6 shadow-xl">
          <AlertCircle className="w-12 h-12 text-[#B88746] mx-auto animate-pulse" />
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="font-heading font-medium text-lg text-white">Không thể khởi chạy không gian 3D</h4>
            <p className="text-xs text-[#8C7A6B] leading-relaxed">
              Trình duyệt hoặc thiết bị của bạn chưa bật tính năng tăng tốc đồ họa phần cứng (WebGL). Bạn vẫn có thể liên hệ ngay với chúng tôi để nhận bảng giá & tài liệu.
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5 justify-center pt-2">
            <button
              onClick={() => handleCtaClick('price_form', 'WebGL Fallback', 'Tư vấn')}
              className="px-6 py-2.5 bg-[#B88746] hover:bg-white hover:text-[#1F1B16] text-[#1F1B16] text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg"
            >
              Nhận tư vấn ngay
            </button>
            <button
              onClick={() => window.open(`tel:${hotline.replace(/\D/g, '')}`)}
              className="px-6 py-2.5 border border-[#E8DCCB]/30 hover:border-[#B88746] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Gọi hotline: {hotline}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fallback to Old Virtual Tour Iframe
  const hasLocalTour = tour && scenes.length > 0;
  if (!hasLocalTour && finalFallbackUrl) {
    return (
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-2xl lg:text-3xl font-heading font-medium text-[#1F1B16] uppercase tracking-wide">
            Trải nghiệm Thực tế ảo 360°
          </h2>
          <p className="text-sm text-[#8C7A6B] mt-1">Khám phá không gian thực tế ảo của dự án {projectName}</p>
        </div>

        <div className="w-full h-[450px] lg:h-[600px] border border-[#E8DCCB]/30 rounded-2xl overflow-hidden shadow-lg bg-black">
          <iframe
            src={finalFallbackUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title={`Virtual Tour - ${projectName}`}
          />
        </div>
      </div>
    );
  }

  // 4. Empty State: No VR and no fallback URL -> Hide section entirely
  if (!hasLocalTour) {
    return null;
  }

  const activeScene = scenes.find((s) => s.slug === currentSceneSlug) || scenes[0];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-12 font-body">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#B88746] tracking-widest uppercase block mb-1">
            Không gian ảo
          </span>
          <h2 className="text-2xl lg:text-3xl font-heading font-medium text-[#1F1B16] uppercase tracking-wide">
            Trải nghiệm VR 360° {projectName}
          </h2>
          <p className="text-sm text-[#8C7A6B] mt-1">
            Khám phá chi tiết mọi góc nhìn dự án, từ cảnh quan đô thị đến căn hộ thực tế
          </p>
        </div>

        {/* Action controls */}
        <button
          onClick={openFullscreen}
          className="px-5 py-2.5 bg-[#1F1B16] hover:bg-[#B88746] text-white hover:text-[#1F1B16] text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <Maximize2 className="w-4 h-4" /> Xem toàn màn hình
        </button>
      </div>

      {/* Main interactive viewer wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Viewer Frame (takes 3 columns) */}
        <div className="lg:col-span-3 h-[450px] lg:h-[550px] relative rounded-2xl overflow-hidden shadow-lg border border-[#E8DCCB]/20">
          <div className="w-full h-full" onClick={triggerOpenVR}>
            <VR360Viewer
              projectId={projectId}
              scenes={scenes}
              currentSceneSlug={currentSceneSlug}
              onSceneChange={handleSceneChange}
              onCtaClick={handleCtaClick}
            />
          </div>

          {/* Compass overlay marker or current scene label */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5 text-[11px] text-[#E8DCCB] font-semibold flex items-center gap-1.5 shadow-md pointer-events-none select-none">
            <Sparkles className="w-3.5 h-3.5 text-[#B88746]" /> 
            <span>Cảnh: {activeScene.title}</span>
          </div>
        </div>

        {/* Right Side: Quick info & form overlays (takes 1 column) */}
        <div className="bg-[#1F1B16] text-[#E8DCCB] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <h4 className="font-heading font-medium text-base text-white tracking-wide uppercase border-b border-white/10 pb-2">
              Danh sách khu vực
            </h4>
            
            {/* Quick vertical/grid selection for desktop */}
            <div className="space-y-2">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneChange(scene.slug)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                    scene.slug === currentSceneSlug
                      ? 'bg-[#B88746] text-[#1F1B16] border-[#B88746] shadow-md'
                      : 'bg-white/5 text-[#E8DCCB]/80 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {scene.title}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
            <button
              onClick={() => handleCtaClick('price_form', activeScene.title, 'Side CTA Bar')}
              className="w-full py-3 bg-[#B88746] hover:bg-[#FBF8F2] text-[#1F1B16] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Đăng ký nhận bảng giá
            </button>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
              <button
                onClick={() => window.open(`tel:${hotline.replace(/\D/g, '')}`)}
                className="py-2.5 border border-white/10 hover:border-[#B88746] rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#B88746]" /> Gọi Hotline
              </button>
              <button
                onClick={() => window.open(socialLinks.zalo.startsWith('http') ? socialLinks.zalo : `https://zalo.me/${socialLinks.zalo}`, '_blank')}
                className="py-2.5 border border-white/10 hover:border-[#B88746] rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" /> Chat Zalo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal thumbnail selector bottom row (Desktop / Mobile scroll) */}
      <div className="mt-4">
        <VR360SceneSelector
          scenes={scenes}
          currentSceneSlug={currentSceneSlug}
          onSceneChange={handleSceneChange}
        />
      </div>

      {/* Fullscreen Tour Modal */}
      <VR360FullscreenModal
        isOpen={isFullscreen}
        onClose={closeFullscreen}
        projectId={projectId}
        projectName={projectName}
        scenes={scenes}
        currentSceneSlug={currentSceneSlug}
        onSceneChange={handleSceneChange}
        onCtaClick={handleCtaClick}
      />

      {/* Interactive Form Popups overlay (Loaded dynamically on action) */}
      <AnimatePresence>
        {activeForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveForm(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-[#E8DCCB] rounded-2xl w-full max-w-lg overflow-y-auto max-h-[85vh] shadow-2xl z-10 p-1"
            >
              {/* Close Header button */}
              <button
                onClick={() => setActiveForm(null)}
                className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 hover:bg-[#FBF8F2] border border-[#E8DCCB]/60 text-[#8C7A6B] hover:text-[#1F1B16] rounded-full transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {activeForm === 'price_form' ? (
                <LeadPriceForm 
                  projectId={projectId} 
                  projectName={projectName} 
                  leadSourcePosition="vr360"
                  vrSceneTitle={ctaContext?.sceneTitle}
                  vrHotspotTitle={ctaContext?.hotspotTitle}
                />
              ) : (
                <ScheduleVisitForm 
                  projectId={projectId} 
                  projectName={projectName} 
                  leadSourcePosition="vr360"
                  vrSceneTitle={ctaContext?.sceneTitle}
                  vrHotspotTitle={ctaContext?.hotspotTitle}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
