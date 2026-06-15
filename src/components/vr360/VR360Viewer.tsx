'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProjectVrScene, ProjectVrHotspot } from '@/types/vr360';
import { trackEvent } from '@/services/trackingService';
import VR360Skeleton from './VR360Skeleton';

// Import Pannellum styles locally
import 'pannellum/build/pannellum.css';

interface VR360ViewerProps {
  projectId?: number | null;
  scenes: ProjectVrScene[];
  currentSceneSlug: string;
  onSceneChange: (slug: string) => void;
  onCtaClick?: (type: 'price_form' | 'schedule_visit', sceneTitle: string, hotspotTitle: string) => void;
  onViewerClick?: (pitch: number, yaw: number) => void;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export default function VR360Viewer({
  projectId,
  scenes,
  currentSceneSlug,
  onSceneChange,
  onCtaClick,
  onViewerClick
}: VR360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Dynamically load Pannellum JS script on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load Pannellum client-side dynamically
      require('pannellum');
      if (window.pannellum) {
        setLibLoaded(true);
      } else {
        throw new Error('Pannellum failed to mount on window object.');
      }
    } catch (err) {
      console.error('[VR360Viewer] Load library error:', err);
      setError('Thiết bị của bạn không tương thích với WebGL/Canvas đồ họa 3D.');
    }
  }, []);

  // 2. Initialize or Update Viewer when library is loaded
  useEffect(() => {
    if (!libLoaded || !containerRef.current || scenes.length === 0) return;

    // Destroy previous instance if it exists
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch (e) {
        console.warn('Destroying viewer failed:', e);
      }
      viewerRef.current = null;
    }

    // Build the scenes configuration object for Pannellum
    const pannellumScenesConfig: Record<string, any> = {};

    scenes.forEach((scene) => {
      const hotSpotsConfig = (scene.hotspots || []).map((hotspot) => {
        const baseHotspot: any = {
          pitch: Number(hotspot.pitch),
          yaw: Number(hotspot.yaw),
          cssClass: `custom-hotspot hotspot-${hotspot.type}`,
        };

        // Custom tooltips using Pannellum's build-in callback
        baseHotspot.createTooltipFunc = (hotspotDiv: HTMLElement) => {
          hotspotDiv.classList.add('custom-hotspot-container');
          
          // Outer ripple ring
          const ring = document.createElement('div');
          ring.className = `hotspot-ring ring-${hotspot.type}`;
          hotspotDiv.appendChild(ring);

          // Tooltip box
          const tooltip = document.createElement('div');
          tooltip.className = 'hotspot-tooltip';
          
          const titleEl = document.createElement('div');
          titleEl.className = 'tooltip-title';
          titleEl.innerText = hotspot.title;
          tooltip.appendChild(titleEl);

          if (hotspot.description) {
            const descEl = document.createElement('div');
            descEl.className = 'tooltip-desc';
            descEl.innerText = hotspot.description;
            tooltip.appendChild(descEl);
          }

          if (hotspot.type === 'lead' && hotspot.cta_label) {
            const ctaEl = document.createElement('div');
            ctaEl.className = 'tooltip-cta';
            ctaEl.innerText = hotspot.cta_label;
            tooltip.appendChild(ctaEl);
          }

          hotspotDiv.appendChild(tooltip);
        };

        // Click actions
        baseHotspot.clickHandlerFunc = () => {
          trackEvent('click_vr_hotspot', {
            project_id: projectId,
            hotspot_id: hotspot.id,
            hotspot_title: hotspot.title,
            hotspot_type: hotspot.type,
            scene_slug: scene.slug,
            scene_title: scene.title
          });

          if (hotspot.type === 'navigation' && hotspot.targetScene?.slug) {
            // Scene Transition
            onSceneChange(hotspot.targetScene.slug);
          } else if (hotspot.type === 'lead') {
            // Open lead form overlays
            const targetCta = hotspot.cta_type === 'schedule_visit' ? 'schedule_visit' : 'price_form';
            if (onCtaClick) {
              onCtaClick(targetCta, scene.title, hotspot.title);
            }
          } else if (hotspot.type === 'info' && hotspot.cta_url) {
            window.open(hotspot.cta_url, '_blank');
          }
        };

        return baseHotspot;
      });

      pannellumScenesConfig[scene.slug] = {
        title: scene.title,
        type: 'equirectangular',
        panorama: scene.panorama_url,
        yaw: Number(scene.initial_yaw),
        pitch: Number(scene.initial_pitch),
        hfov: Number(scene.initial_zoom),
        autoLoad: true,
        autoRotate: scene.autorotate ? -1.5 : 0, // Slow continuous rotation
        hotSpots: hotSpotsConfig
      };
    });

    const activeScene = scenes.find((s) => s.slug === currentSceneSlug) || scenes[0];

    try {
      // Initialize Pannellum Viewer
      const viewer = window.pannellum.viewer(containerRef.current, {
        default: {
          firstScene: activeScene.slug,
          sceneFadeDuration: 800,
          showControls: true,
          autoLoad: true,
        },
        scenes: pannellumScenesConfig
      });

      viewerRef.current = viewer;

      // Listen to scene transitions inside the viewer
      viewer.on('scenechange', (sceneId: string) => {
        onSceneChange(sceneId);
        
        const targetScene = scenes.find((s) => s.slug === sceneId);
        trackEvent('view_vr_scene', {
          project_id: projectId,
          scene_slug: sceneId,
          scene_title: targetScene?.title || sceneId
        });
      });

      // Handle picking coordinates
      const container = containerRef.current;
      let startX = 0;
      let startY = 0;

      const handleMouseDown = (e: MouseEvent) => {
        startX = e.clientX;
        startY = e.clientY;
      };

      const handleMouseUp = (e: MouseEvent) => {
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);
        if (diffX < 5 && diffY < 5 && viewerRef.current && onViewerClick) {
          const coords = viewerRef.current.mouseEventToCoords(e);
          if (coords) {
            onViewerClick(coords[0], coords[1]);
          }
        }
      };

      if (container) {
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mouseup', handleMouseUp);
      }

      // Cleanup listeners inside returning function
      return () => {
        if (container) {
          container.removeEventListener('mousedown', handleMouseDown);
          container.removeEventListener('mouseup', handleMouseUp);
        }
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch (e) {}
          viewerRef.current = null;
        }
      };

    } catch (err) {
      console.error('[VR360Viewer] Init error:', err);
      setError('Đã xảy ra lỗi khi khởi chạy ảnh không gian WebGL.');
    }
  }, [libLoaded, scenes, projectId, onViewerClick]);

  // 3. Programmatically switch scenes if currentSceneSlug changes from parent
  useEffect(() => {
    if (viewerRef.current && libLoaded) {
      const activeSceneId = viewerRef.current.getScene();
      if (activeSceneId !== currentSceneSlug) {
        try {
          viewerRef.current.loadScene(currentSceneSlug);
        } catch (e) {
          console.warn('Switching scene failed:', e);
        }
      }
    }
  }, [currentSceneSlug, libLoaded]);

  if (error) {
    throw new Error(error); // Trigger error boundary fallback
  }

  if (!libLoaded) {
    return <VR360Skeleton />;
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-[#E8DCCB]/20 bg-[#1F1B16]">
      {/* Target DOM Container for Pannellum */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Global CSS customizations for Pannellum Hotspots */}
      <style jsx global>{`
        /* Built-in Hotspot Circle customization */
        .custom-hotspot {
          width: 26px !important;
          height: 26px !important;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
        }

        /* Pulsing Glow Rings */
        .hotspot-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0.6;
          animation: hotspot-pulse 2s infinite ease-out;
          pointer-events: none;
        }

        .ring-info { color: #3b82f6; }
        .ring-navigation { color: #f59e0b; }
        .ring-lead { color: #10b981; }
        .ring-media { color: #06b6d4; }
        .ring-map { color: #a855f7; }

        @keyframes hotspot-pulse {
          0% { transform: scale(0.65); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* Hotspot custom markers depending on type */
        .hotspot-info { background: #3b82f6 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>') no-repeat center/14px; }
        .hotspot-navigation { background: #f59e0b url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>') no-repeat center/14px; }
        .hotspot-lead { background: #10b981 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>') no-repeat center/12px; }
        .hotspot-media { background: #06b6d4 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>') no-repeat center/12px; }
        .hotspot-map { background: #a855f7 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>') no-repeat center/12px; }

        /* Custom tooltips matching luxury gold themes */
        .hotspot-tooltip {
          position: absolute;
          bottom: 34px;
          left: 50%;
          transform: translateX(-50%);
          background: #1f1b16;
          color: #e8dccb;
          border: 1px solid rgba(184, 135, 70, 0.3);
          border-radius: 10px;
          padding: 8px 12px;
          width: 200px;
          text-align: center;
          font-family: inherit;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
          pointer-events: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .hotspot-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #1f1b16;
        }

        /* Hover show */
        .custom-hotspot-container:hover .hotspot-tooltip {
          opacity: 1;
          visibility: visible;
        }

        .tooltip-title {
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #b88746;
        }

        .tooltip-desc {
          font-size: 10px;
          color: #a69685;
          margin-top: 3px;
          line-height: 1.3;
        }

        .tooltip-cta {
          margin-top: 6px;
          background: #b88746;
          color: #1f1b16;
          font-weight: 700;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
