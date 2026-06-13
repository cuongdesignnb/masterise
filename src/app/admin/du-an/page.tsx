'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project, ProjectCategory } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe, 
  MapPin, 
  Check, 
  Layers, 
  X, 
  Image as ImageIcon, 
  DollarSign, 
  FolderOpen,
  Eye,
  Star,
  Settings
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  
  // States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'content' | 'media' | 'seo'>('general');
  
  // Category manager modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  
  // Media Selector state
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<'thumbnail' | 'gallery' | 'brochure' | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formStatus, setFormStatus] = useState<'upcoming' | 'selling' | 'completed'>('upcoming');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formDeveloper, setFormDeveloper] = useState('Masterise Homes');
  const [formScale, setFormScale] = useState('');
  const [formHandoverYear, setFormHandoverYear] = useState<number | ''>('');
  const [formAreaSize, setFormAreaSize] = useState('');
  
  const [formLocation, setFormLocation] = useState('');
  const [formRegion, setFormRegion] = useState('Miền Nam');
  const [formLat, setFormLat] = useState<number | ''>('');
  const [formLng, setFormLng] = useState<number | ''>('');
  const [formPriceMin, setFormPriceMin] = useState<number | ''>('');
  const [formPriceMax, setFormPriceMax] = useState<number | ''>('');
  const [formPriceText, setFormPriceText] = useState('');
  
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAmenities, setFormAmenities] = useState<string>('');
  const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);
  
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [formBrochureUrl, setFormBrochureUrl] = useState('');
  
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  // Queries
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['admin-projects', search, categoryFilter, statusFilter, page],
    queryFn: async () => {
      let url = `/projects?q=${search}&page=${page}&per_page=10`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get<Project[]>(url);
      return response;
    },
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['admin-project-categories'],
    queryFn: async () => {
      const response = await api.get<ProjectCategory[]>('/project-categories');
      return response.data;
    },
  });

  // Helper to slugify
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    setFormName(nameVal);
    if (!editingProject) {
      // Slugify
      const slugVal = nameVal
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[đĐ]/g, 'd')
        .replace(/([^a-z0-9\s-]|_)+/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormSlug(slugVal);
    }
  };

  // Open Form for Create
  const handleCreateOpen = () => {
    setEditingProject(null);
    setActiveTab('general');
    
    // Reset fields
    setFormName('');
    setFormSlug('');
    setFormStatus('upcoming');
    setFormIsFeatured(false);
    setFormDeveloper('Masterise Homes');
    setFormScale('');
    setFormHandoverYear('');
    setFormAreaSize('');
    setFormLocation('');
    setFormRegion('Miền Nam');
    setFormLat('');
    setFormLng('');
    setFormPriceMin('');
    setFormPriceMax('');
    setFormPriceText('');
    setFormDescription('');
    setFormContent('');
    setFormAmenities('');
    setFormCategoryIds([]);
    setFormThumbnail('');
    setFormGallery([]);
    setFormBrochureUrl('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSeoKeywords('');
    
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleEditOpen = (project: Project) => {
    setEditingProject(project);
    setActiveTab('general');
    
    // Fill fields
    setFormName(project.name);
    setFormSlug(project.slug);
    setFormStatus(project.status);
    setFormIsFeatured(project.is_featured);
    setFormDeveloper(project.developer || 'Masterise Homes');
    setFormScale(project.scale || '');
    setFormHandoverYear(project.handover_year || '');
    setFormAreaSize(project.area_size || '');
    setFormLocation(project.location || '');
    setFormRegion(project.region || 'Miền Nam');
    setFormLat(project.lat || '');
    setFormLng(project.lng || '');
    setFormPriceMin(project.price_min ? Number(project.price_min) : '');
    setFormPriceMax(project.price_max ? Number(project.price_max) : '');
    setFormPriceText(project.price_text || '');
    setFormDescription(project.description || '');
    setFormContent(project.content || '');
    setFormAmenities(project.amenities ? project.amenities.join(', ') : '');
    setFormCategoryIds(project.categories ? project.categories.map(c => c.id) : []);
    setFormThumbnail(project.thumbnail || '');
    setFormGallery(project.gallery || []);
    setFormBrochureUrl(project.brochure_url || '');
    
    setFormSeoTitle(project.seo_meta?.title || '');
    setFormSeoDescription(project.seo_meta?.description || '');
    setFormSeoKeywords(project.seo_meta?.keywords || '');
    
    setIsFormOpen(true);
  };

  // Create or Update Project Mutation
  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      const amenitiesArr = formAmenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      
      const payload = {
        name: formName,
        slug: formSlug,
        status: formStatus,
        is_featured: formIsFeatured,
        developer: formDeveloper,
        scale: formScale,
        handover_year: formHandoverYear !== '' ? Number(formHandoverYear) : null,
        area_size: formAreaSize,
        location: formLocation,
        region: formRegion,
        lat: formLat !== '' ? Number(formLat) : null,
        lng: formLng !== '' ? Number(formLng) : null,
        price_min: formPriceMin !== '' ? Number(formPriceMin) : null,
        price_max: formPriceMax !== '' ? Number(formPriceMax) : null,
        price_text: formPriceText,
        description: formDescription,
        content: formContent,
        amenities: amenitiesArr,
        category_ids: formCategoryIds,
        seo_title: formSeoTitle || formName,
        seo_description: formSeoDescription || formDescription,
        seo_keywords: formSeoKeywords,
        thumbnail: formThumbnail,
        gallery: formGallery,
        brochure_url: formBrochureUrl,
      };

      if (editingProject) {
        return api.put(`/projects/${editingProject.id}`, payload);
      } else {
        return api.post('/projects', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setIsFormOpen(false);
      alert(editingProject ? 'Đã cập nhật dự án thành công!' : 'Đã tạo dự án mới thành công!');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi lưu dự án. Vui lòng kiểm tra lại dữ liệu.');
    }
  });

  // Delete Project Mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      alert('Đã xóa dự án thành công.');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi xóa dự án.');
    }
  });

  const handleDeleteProject = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này? Điều này sẽ xóa toàn bộ SEO Meta liên quan.')) {
      deleteProjectMutation.mutate(id);
    }
  };

  // Toggle Project Category Select
  const handleCategoryToggle = (id: number) => {
    if (formCategoryIds.includes(id)) {
      setFormCategoryIds(formCategoryIds.filter(cid => cid !== id));
    } else {
      setFormCategoryIds([...formCategoryIds, id]);
    }
  };

  // Handle Media Select Modal callback
  const handleMediaSelected = (url: string | string[]) => {
    if (mediaSelectorTarget === 'thumbnail') {
      setFormThumbnail(url as string);
    } else if (mediaSelectorTarget === 'brochure') {
      setFormBrochureUrl(url as string);
    } else if (mediaSelectorTarget === 'gallery') {
      const selectedArr = url as string[];
      // Merge unique
      const merged = Array.from(new Set([...formGallery, ...selectedArr]));
      setFormGallery(merged);
    }
  };

  // Project Category CRUD Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      return api.post('/project-categories', { name, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      setNewCategoryName('');
    },
    onError: (err: any) => {
      alert(err.message || 'Lỗi khi tạo danh mục.');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/project-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Không thể xóa danh mục này. Hãy chuyển các dự án sang danh mục khác trước.');
    }
  });

  const projects = projectsData?.data || [];
  const meta = projectsData?.meta;
  const categories = categoriesData || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Dự án</h1>
          <p className="text-sm text-[#8C7A6B]">Tạo, chỉnh sửa và cấu hình thông tin dự án Masterise Homes</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#E8DCCB] hover:bg-[#B88746]/5 text-[#1F1B16] rounded-xl text-sm font-semibold transition-all"
          >
            <Layers className="w-4 h-4 text-[#B88746]" />
            Quản lý Danh mục
          </button>
          <button
            onClick={handleCreateOpen}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm dự án mới
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white border border-[#E8DCCB] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-9 pr-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#B88746] text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp mở bán</option>
            <option value="selling">Đang mở bán</option>
            <option value="completed">Đã bàn giao</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      {isProjectsLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Không tìm thấy dự án nào. Vui lòng thêm dự án mới hoặc điều chỉnh bộ lọc.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Hình ảnh & Tên</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Khu vực</th>
                  <th className="px-6 py-4">Giá bán</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Nổi bật</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-[#FBF8F2] border border-[#E8DCCB]/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building className="w-5 h-5 text-[#B88746]/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-[#1F1B16] truncate" title={project.name}>
                            {project.name}
                          </span>
                          <span className="block text-[10px] text-[#8C7A6B] truncate">
                            /{project.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.categories && project.categories.length > 0 ? (
                          project.categories.map((cat) => (
                            <span key={cat.id} className="text-[10px] bg-[#B88746]/5 text-[#B88746] border border-[#B88746]/20 px-1.5 py-0.5 rounded">
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Chưa chọn</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#1F1B16] space-y-0.5">
                        <div className="font-medium">{project.region || '-'}</div>
                        <div className="text-[#8C7A6B] flex items-center gap-0.5 text-[10px]">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {project.location ? project.location.split(',').slice(-1)[0].trim() : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#B88746]">
                      {project.price_text || 'Liên hệ'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        project.status === 'selling' ? 'bg-green-50 text-green-700 border border-green-200' :
                        project.status === 'upcoming' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {project.status === 'selling' ? 'Đang mở bán' :
                         project.status === 'upcoming' ? 'Sắp mở bán' : 'Đã bàn giao'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {project.is_featured ? (
                        <span className="inline-flex p-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <a
                        href={`/du-an/${project.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-gray-100 text-[#8C7A6B] rounded-lg transition-colors inline-flex items-center"
                        title="Xem preview"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEditOpen(project)}
                        className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors inline-flex items-center"
                        title="Sửa dự án"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center"
                        title="Xóa dự án"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {meta && meta.last_page > 1 && (
            <div className="bg-[#FBF8F2] border-t border-[#E8DCCB] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[#8C7A6B]">
                Hiển thị trang {page} / {meta.last_page} (Tổng số {meta.total} dự án)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-xl text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50 transition-colors"
                >
                  Trước
                </button>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-xl text-xs font-semibold bg-white hover:bg-[#B88746]/5 disabled:opacity-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects Create/Edit Slide Drawer (Framer Motion) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            />

            {/* Form Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-3xl bg-white h-full flex flex-col z-10 shadow-2xl border-l border-[#E8DCCB] text-[#1F1B16]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    {editingProject ? `Sửa dự án: ${editingProject.name}` : 'Thêm dự án bất động sản mới'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Điền đầy đủ thông tin chi tiết dự án, tiện ích, gallery hình ảnh và SEO meta
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-[#E8DCCB]/40 text-[#8C7A6B] hover:text-[#1F1B16] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs list */}
              <div className="flex bg-[#FBF8F2]/60 px-6 border-b border-[#E8DCCB]/60 text-xs overflow-x-auto shrink-0 select-none">
                {[
                  { id: 'general', label: 'Thông tin chung' },
                  { id: 'location', label: 'Vị trí & Giá' },
                  { id: 'content', label: 'Mô tả & Tiện ích' },
                  { id: 'media', label: 'Ảnh & Tài liệu' },
                  { id: 'seo', label: 'Cấu hình SEO' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#B88746] text-[#B88746]'
                        : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Scrollable Fields */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* TAB 1: General Info */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên dự án *</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={handleNameChange}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: The Global City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Slug URL *</label>
                        <input
                          type="text"
                          required
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="vi-du-the-global-city"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trạng thái bán *</label>
                        <select
                          value={formStatus}
                          onChange={(e: any) => setFormStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="upcoming">Sắp mở bán</option>
                          <option value="selling">Đang mở bán</option>
                          <option value="completed">Đã bàn giao</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Năm bàn giao</label>
                        <input
                          type="number"
                          value={formHandoverYear}
                          onChange={(e) => setFormHandoverYear(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 2026"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Quy mô diện tích</label>
                        <input
                          type="text"
                          value={formAreaSize}
                          onChange={(e) => setFormAreaSize(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 117.4 ha"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Chủ đầu tư</label>
                        <input
                          type="text"
                          value={formDeveloper}
                          onChange={(e) => setFormDeveloper(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Masterise Homes"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Quy mô sản phẩm (scale)</label>
                        <input
                          type="text"
                          value={formScale}
                          onChange={(e) => setFormScale(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 1800 căn hộ, 20 block"
                        />
                      </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        id="formIsFeatured"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB]"
                      />
                      <label htmlFor="formIsFeatured" className="text-xs font-semibold text-[#1F1B16] cursor-pointer">
                        Đánh dấu dự án này là <b>Nổi bật</b> (Hiển thị trang chủ)
                      </label>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-2">Thuộc danh mục *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((cat) => {
                          const isChecked = formCategoryIds.includes(cat.id);
                          return (
                            <div
                              key={cat.id}
                              onClick={() => handleCategoryToggle(cat.id)}
                              className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs transition-colors select-none ${
                                isChecked
                                  ? 'border-[#B88746] bg-[#B88746]/5 text-[#B88746] font-semibold'
                                  : 'border-[#E8DCCB] hover:bg-gray-50 text-[#1F1B16]'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                isChecked ? 'border-[#B88746] bg-[#B88746] text-white' : 'border-gray-300'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              {cat.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Location & Price */}
                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ chính xác (location)</label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Vùng miền (region)</label>
                        <select
                          value={formRegion}
                          onChange={(e) => setFormRegion(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="Miền Bắc">Miền Bắc</option>
                          <option value="Miền Trung">Miền Trung</option>
                          <option value="Miền Nam">Miền Nam</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Kinh độ (Longitude)</label>
                        <input
                          type="number"
                          step="any"
                          value={formLng}
                          onChange={(e) => setFormLng(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 106.7725"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Vĩ độ (Latitude)</label>
                        <input
                          type="number"
                          step="any"
                          value={formLat}
                          onChange={(e) => setFormLat(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 10.7967"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá tối thiểu (Triệu VND / USD)</label>
                        <input
                          type="number"
                          value={formPriceMin}
                          onChange={(e) => setFormPriceMin(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 5000 (cho 5 tỷ)"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá tối đa (Triệu VND / USD)</label>
                        <input
                          type="number"
                          value={formPriceMax}
                          onChange={(e) => setFormPriceMax(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 15000 (cho 15 tỷ)"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text hiển thị giá *</label>
                        <input
                          type="text"
                          required
                          value={formPriceText}
                          onChange={(e) => setFormPriceText(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: Từ 5.5 tỷ / căn"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Description & Amenities */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả ngắn (Description)</label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Mô tả ngắn gọn về dự án (tối đa 250 ký tự)..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung chi tiết (Markdown / HTML)</label>
                      <textarea
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Nội dung đầy đủ của dự án (Giới thiệu, quy mô chi tiết, hạ tầng...)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiện ích (Ngăn cách bởi dấu phẩy)</label>
                      <input
                        type="text"
                        value={formAmenities}
                        onChange={(e) => setFormAmenities(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: Hồ bơi vô cực, Công viên trung tâm, Trung tâm thương mại, Sân tennis, Khu BBQ"
                      />
                      <span className="text-[10px] text-[#8C7A6B] mt-1 block">Nhập danh sách tiện ích, mỗi tiện ích cách nhau bởi dấu phẩy (,)</span>
                    </div>
                  </div>
                )}

                {/* TAB 4: Media Assets */}
                {activeTab === 'media' && (
                  <div className="space-y-6">
                    {/* Thumbnail Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B]">Ảnh đại diện (Thumbnail)</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-16 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] overflow-hidden flex items-center justify-center shrink-0">
                          {formThumbnail ? (
                            <img src={formThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#B88746]/40" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={formThumbnail}
                            onChange={(e) => setFormThumbnail(e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs focus:outline-none"
                            placeholder="URL hình ảnh"
                          />
                          <button
                            type="button"
                            onClick={() => setMediaSelectorTarget('thumbnail')}
                            className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Chọn từ Media Library
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gallery Selection */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-semibold text-[#8C7A6B]">Bộ sưu tập ảnh (Gallery)</label>
                        <button
                          type="button"
                          onClick={() => setMediaSelectorTarget('gallery')}
                          className="px-2.5 py-1.5 border border-[#B88746] hover:bg-[#B88746]/5 text-[#B88746] text-xs font-semibold rounded-lg transition-colors"
                        >
                          Thêm ảnh từ Thư viện
                        </button>
                      </div>

                      {formGallery.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                          Chưa có ảnh nào trong bộ sưu tập.
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 border border-[#E8DCCB] p-3 rounded-xl bg-[#FBF8F2]/30">
                          {formGallery.map((imgUrl, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-[#E8DCCB]/60 group">
                              <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setFormGallery(formGallery.filter(u => u !== imgUrl))}
                                className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Brochure PDF */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B]">Tài liệu Brochure (PDF URL)</label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          value={formBrochureUrl}
                          onChange={(e) => setFormBrochureUrl(e.target.value)}
                          className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                          placeholder="URL file PDF tài liệu bán hàng"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaSelectorTarget('brochure')}
                          className="px-4 py-2 border border-[#1F1B16] hover:bg-gray-100 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Chọn từ Media
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: SEO Configurations */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề SEO (SEO Title)</label>
                      <input
                        type="text"
                        value={formSeoTitle}
                        onChange={(e) => setFormSeoTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Để trống sẽ tự động lấy tên dự án..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả SEO (Meta Description)</label>
                      <textarea
                        value={formSeoDescription}
                        onChange={(e) => setFormSeoDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Để trống sẽ tự động lấy mô tả ngắn..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Từ khóa SEO (Meta Keywords)</label>
                      <input
                        type="text"
                        value={formSeoKeywords}
                        onChange={(e) => setFormSeoKeywords(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: the global city, masterise quan 2, can ho cao cap hcm"
                      />
                      <span className="text-[10px] text-[#8C7A6B] mt-1 block">Các từ khóa cách nhau bằng dấu phẩy</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DCCB] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => saveProjectMutation.mutate()}
                  disabled={saveProjectMutation.isPending || !formName || !formSlug || !formPriceText}
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {saveProjectMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Lưu dự án
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Category Manager Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-[#E8DCCB] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl z-10 p-6 space-y-4 text-[#1F1B16] font-body"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-medium text-lg text-[#1F1B16]">Quản lý Danh mục Dự án</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Category Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tên danh mục mới..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746] bg-[#FBF8F2]"
                />
                <button
                  onClick={() => {
                    if (!newCategoryName.trim()) return;
                    createCategoryMutation.mutate(newCategoryName);
                  }}
                  disabled={createCategoryMutation.isPending}
                  className="px-4 py-2 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Thêm
                </button>
              </div>

              {/* Categories List */}
              {isCategoriesLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-[#B88746] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 italic">
                  Chưa có danh mục nào.
                </div>
              ) : (
                <div className="divide-y divide-[#E8DCCB]/60 max-h-[200px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold">{cat.name}</span>
                        <span className="block text-[9px] text-[#8C7A6B]">/{cat.slug} (Có {cat.projects_count || 0} dự án)</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa danh mục "${cat.name}"?`)) {
                            deleteCategoryMutation.mutate(cat.id);
                          }
                        }}
                        disabled={deleteCategoryMutation.isPending}
                        className="p-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DCCB] rounded-xl text-xs font-bold hover:bg-gray-100"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Select Modal Wrapper */}
      <AnimatePresence>
        {mediaSelectorTarget !== null && (
          <MediaSelectModal
            isOpen={mediaSelectorTarget !== null}
            onClose={() => setMediaSelectorTarget(null)}
            onSelect={handleMediaSelected}
            multiple={mediaSelectorTarget === 'gallery'}
            selectedUrls={mediaSelectorTarget === 'gallery' ? formGallery : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
