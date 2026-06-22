'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project as ApiProject } from '@/types/api';
import { mapApiProjectToProjectDetail } from '@/adapters/projectAdapter';
import ProjectDetailClient from '@/components/project-detail/ProjectDetailClient';

type ProjectShowResponse = {
  project: ApiProject;
  related?: ApiProject[];
};

export default function AdminProjectPreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || '');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-project-preview', slug],
    queryFn: async () => {
      const response = await api.get<ProjectShowResponse>(`/projects/${slug}`);
      return response.data?.project || null;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FBF8F2] px-6 text-[#1F1B16]">
        <div className="rounded-2xl border border-[#E8DCCB] bg-white px-6 py-5 text-sm font-semibold shadow-sm">
          Đang tải bản xem trước dự án...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FBF8F2] px-6 text-[#1F1B16]">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-base font-bold text-red-700">Không mở được bản xem trước</p>
          <p className="mt-2 text-sm text-[#7A6A5D]">
            Vui lòng kiểm tra lại quyền đăng nhập admin hoặc lưu dự án thêm một lần nữa.
          </p>
        </div>
      </main>
    );
  }

  const projectDetail = mapApiProjectToProjectDetail(data);

  return (
    <main className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 border-b border-[#E8DCCB] bg-[#1F1B16] px-4 py-3 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm">
          <div>
            <p className="font-bold">Bản xem trước trong Admin</p>
            <p className="text-xs text-white/70">Trang này dùng dữ liệu thật và có thể xem cả dự án chưa xuất bản.</p>
          </div>
          <a
            href="/admin/du-an"
            className="rounded-full border border-white/25 px-4 py-2 text-xs font-bold hover:bg-white/10"
          >
            Quay lại quản trị
          </a>
        </div>
      </div>
      <ProjectDetailClient project={projectDetail} />
    </main>
  );
}
