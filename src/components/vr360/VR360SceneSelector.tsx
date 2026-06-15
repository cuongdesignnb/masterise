'use client';

import React from 'react';
import { ProjectVrScene } from '@/types/vr360';
import Image from 'next/image';

interface VR360SceneSelectorProps {
  scenes: ProjectVrScene[];
  currentSceneSlug: string;
  onSceneChange: (slug: string) => void;
}

export default function VR360SceneSelector({
  scenes,
  currentSceneSlug,
  onSceneChange
}: VR360SceneSelectorProps) {
  if (scenes.length <= 1) return null;

  return (
    <div className="w-full py-3">
      {/* Desktop / Mobile Selector */}
      <div className="flex overflow-x-auto gap-3.5 pb-2.5 px-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent select-none">
        {scenes.map((scene) => {
          const isActive = scene.slug === currentSceneSlug;

          return (
            <button
              key={scene.id}
              onClick={() => onSceneChange(scene.slug)}
              className={`group relative flex-none w-28 h-16 lg:w-32 lg:h-20 rounded-xl overflow-hidden border transition-all duration-300 ${
                isActive
                  ? 'border-[#B88746] shadow-[0_4px_12px_rgba(184,135,70,0.25)] scale-105'
                  : 'border-[#E8DCCB]/30 hover:border-[#B88746]/70 hover:scale-102'
              }`}
            >
              {/* Thumbnail Image */}
              {scene.thumbnail_url ? (
                <Image
                  src={scene.thumbnail_url}
                  alt={scene.title}
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[#1F1B16] flex items-center justify-center text-[10px] text-[#8C7A6B]">
                  360° View
                </div>
              )}

              {/* Tint overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-colors ${
                isActive ? 'from-black/90' : 'group-hover:from-black/70'
              }`} />

              {/* Title label */}
              <div className="absolute inset-x-2 bottom-1.5 text-center">
                <span className={`text-[10px] lg:text-[11px] font-bold tracking-wide uppercase line-clamp-1 ${
                  isActive ? 'text-[#E8DCCB]' : 'text-white/80 group-hover:text-white'
                }`}>
                  {scene.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
