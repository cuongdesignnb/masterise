'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, Project } from '@/types/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, MapPin, Building, Ruler, Trash2 } from 'lucide-react';

export default function SavedProjects() {
  const queryClient = useQueryClient();

  // Fetch latest user details (including saved projects)
  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data.user;
    },
  });

  // Toggle Save Project Mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return api.post(`/projects/${projectId}/toggle-save`);
    },
    onSuccess: () => {
      // Refresh user profile to update list of saved projects
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const savedProjects = userData?.saved_projects || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-heading font-medium text-[#1F1B16]">Dự án đã lưu</h1>
        <p className="text-sm text-[#8C7A6B]">Xem danh sách các dự án bất động sản bạn đang theo dõi</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
          <div className="h-64 bg-white animate-pulse rounded-2xl border border-[#E8DCCB]" />
        </div>
      ) : savedProjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm space-y-4 max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-[#B88746]/30 mx-auto" />
          <div className="space-y-2">
            <h3 className="font-heading font-medium text-base text-[#1F1B16]">Chưa có dự án nào được lưu</h3>
            <p>Khám phá danh sách dự án cao cấp từ Masterise Homes và lưu lại các dự án bạn quan tâm.</p>
          </div>
          <Link href="/du-an" className="inline-block px-6 py-2.5 bg-[#B88746] text-white rounded-xl text-xs font-semibold hover:bg-[#1F1B16] transition-colors">
            Khám phá dự án ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedProjects.map((project: any) => (
            <motion.div
              layout
              key={project.id}
              className="bg-white rounded-2xl border border-[#E8DCCB] overflow-hidden flex flex-col group hover:shadow-[0_12px_30px_rgba(27,27,27,0.05)] transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                <img
                  src={project.thumbnail || '/images/project-placeholder.jpg'}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => toggleSaveMutation.mutate(project.id)}
                  disabled={toggleSaveMutation.isPending}
                  className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur hover:bg-red-50 text-red-500 rounded-full shadow-sm hover:shadow transition-all border border-red-100"
                  title="Xóa khỏi danh sách lưu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#B88746] bg-[#B88746]/10 px-2 py-0.5 rounded">
                      {project.status === 'selling' ? 'Đang mở bán' :
                       project.status === 'upcoming' ? 'Sắp mở bán' : 'Đã bàn giao'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {project.region}
                    </span>
                  </div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16] leading-snug group-hover:text-[#B88746] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[#8C7A6B] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#FBF8F2] text-xs text-[#8C7A6B]">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 shrink-0 text-[#B88746]/70" />
                    <span>{project.developer || 'Masterise Homes'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 shrink-0 text-[#B88746]/70" />
                    <span>{project.area_size || 'N/A'}</span>
                  </div>
                </div>

                {/* Footer link */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-heading font-semibold text-sm text-[#B88746]">
                    {project.price_text || 'Liên hệ'}
                  </span>
                  <Link
                    href={`/du-an/${project.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F1B16] hover:text-[#B88746] transition-colors"
                  >
                    Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
