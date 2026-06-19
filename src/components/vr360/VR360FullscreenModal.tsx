'use client';

import React, { useEffect } from 'react';
import { X, Phone, MessageSquare, FileText, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectVrScene } from '@/types/vr360';
import { useSiteSettings } from '@/providers/SiteSettingsProvider';
import VR360Viewer from './VR360Viewer';
import VR360SceneSelector from './VR360SceneSelector';

interface VR360FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number | null;
  projectName?: string;
  scenes: ProjectVrScene[];
  currentSceneSlug: string;
  onSceneChange: (slug: string) => void;
  onCtaClick: (type: 'price_form' | 'schedule_visit', sceneTitle: string, hotspotTitle: string) => void;
}

export default function VR360FullscreenModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  scenes,
  currentSceneSlug,
  onSceneChange,
  onCtaClick
}: VR360FullscreenModalProps) {
  const { hotline, socialLinks } = useSiteSettings();

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const activeScene = scenes.find((s) => s.slug === currentSceneSlug) || scenes[0];

  const handleHotlineCall = () => {
    window.open(`tel:${hotline.replace(/\D/g, '')}`);
  };

  const handleZaloChat = () => {
    window.open(socialLinks.zalo.startsWith('http') ? socialLinks.zalo : `https://zalo.me/${socialLinks.zalo}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col font-body"
        >
          {/* Header overlay */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-10 pointer-events-none select-none">
            <div className="text-white pointer-events-auto">
              <h3 className="font-heading font-medium text-base lg:text-lg tracking-wide uppercase text-[#E8DCCB]">
                Trải nghiệm 360° • {projectName || 'Dự án'}
              </h3>
              <p className="text-[10px] lg:text-xs text-[#8C7A6B] font-semibold uppercase tracking-wider mt-0.5">
                Cảnh đang xem: {activeScene?.title || 'Tổng quan'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-black/60 border border-white/10 hover:bg-white/10 text-white rounded-full transition-colors pointer-events-auto shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fullscreen Viewer Content */}
          <div className="flex-1 w-full h-full relative">
            <VR360Viewer
              projectId={projectId}
              scenes={scenes}
              currentSceneSlug={currentSceneSlug}
              onSceneChange={onSceneChange}
              onCtaClick={onCtaClick}
            />

            {/* Bottom Floating controls overlay (Desktop vs Mobile layout) */}
            <div className="absolute bottom-20 lg:bottom-24 inset-x-0 flex flex-col items-center gap-4 px-6 z-10 pointer-events-none">
              {/* Scene Selector */}
              <div className="w-full max-w-2xl bg-black/50 backdrop-blur-md rounded-2xl p-2 border border-white/5 pointer-events-auto">
                <VR360SceneSelector
                  scenes={scenes}
                  currentSceneSlug={currentSceneSlug}
                  onSceneChange={onSceneChange}
                />
              </div>
            </div>
          </div>

          {/* Sticky Fullscreen Bottom CTA Bar (Ensures optimal lead captures) */}
          <div className="bg-[#1F1B16] text-[#E8DCCB] border-t border-white/10 shadow-[0_-4px_16px_rgba(0,0,0,0.3)] z-10 select-none">
            <div className="grid grid-cols-4 items-center h-16 divide-x divide-white/5 font-semibold text-center text-[10px] lg:text-xs tracking-wider uppercase">
              {/* Call Hotline */}
              <button
                onClick={handleHotlineCall}
                className="flex flex-col lg:flex-row items-center justify-center gap-1.5 h-full text-white hover:text-[#B88746] transition-colors"
              >
                <Phone className="w-4.5 h-4.5 text-[#B88746]" />
                <span>Gọi điện</span>
              </button>

              {/* Chat Zalo */}
              <button
                onClick={handleZaloChat}
                className="flex flex-col lg:flex-row items-center justify-center gap-1.5 h-full hover:text-[#B88746] transition-colors"
              >
                <MessageSquare className="w-4.5 h-4.5 text-sky-400" />
                <span>Chat Zalo</span>
              </button>

              {/* Get Price Form */}
              <button
                onClick={() => onCtaClick('price_form', activeScene.title, 'Fullscreen Bottom CTA')}
                className="flex flex-col lg:flex-row items-center justify-center gap-1.5 h-full hover:text-[#B88746] transition-colors"
              >
                <FileText className="w-4.5 h-4.5 text-amber-400" />
                <span>Nhận bảng giá</span>
              </button>

              {/* Schedule visit */}
              <button
                onClick={() => onCtaClick('schedule_visit', activeScene.title, 'Fullscreen Bottom CTA')}
                className="flex flex-col lg:flex-row items-center justify-center gap-1.5 h-full hover:text-[#B88746] transition-colors"
              >
                <CalendarCheck className="w-4.5 h-4.5 text-emerald-400" />
                <span>Đặt lịch xem</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
