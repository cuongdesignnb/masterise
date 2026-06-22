'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { Post, PostCategory } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Layers, 
  X, 
  Image as ImageIcon, 
  Check, 
  Star,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import RichTextEditor from '@/components/admin/RichTextEditor';

function AdminNews() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();

  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      api.get<Post[]>(`/posts?id=${editId}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            handleEditOpen(res.data[0]);
          }
        })
        .catch((err) => {
          console.error("Failed to load post for editing:", err);
        });
    }
  }, [editId]);
  
  // States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo'>('content');
  
  // Category manager modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Media Selector state
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formPostType, setFormPostType] = useState<'news' | 'investment' | 'event'>('news');
  const [formEventStartAt, setFormEventStartAt] = useState('');
  const [formEventEndAt, setFormEventEndAt] = useState('');
  const [formEventLocation, setFormEventLocation] = useState('');
  const [formEventRegisterUrl, setFormEventRegisterUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState<number | ''>('');
  
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  // Fetch posts list
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['admin-posts', search, categoryFilter, statusFilter, page],
    queryFn: async () => {
      let url = `/posts?q=${search}&page=${page}&per_page=10`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get<Post[]>(url);
      return response;
    },
  });

  // Fetch post categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['admin-post-categories'],
    queryFn: async () => {
      const response = await api.get<PostCategory[]>('/post-categories');
      return response.data;
    },
  });

  // Slug auto generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormTitle(val);
    if (!editingPost) {
      const slugVal = val
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^a-z0-9\s-]|_)+/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormSlug(slugVal);
    }
  };

  // Open Create Form
  const handleCreateOpen = () => {
    setEditingPost(null);
    setActiveTab('content');
    
    setFormTitle('');
    setFormSlug('');
    setFormSummary('');
    setFormContent('');
    setFormThumbnail('');
    setFormPostType('news');
    setFormEventStartAt('');
    setFormEventEndAt('');
    setFormEventLocation('');
    setFormEventRegisterUrl('');
    setFormStatus('draft');
    setFormIsFeatured(false);
    setFormCategoryId(categoriesData && categoriesData.length > 0 ? categoriesData[0].id : '');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSeoKeywords('');
    
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleEditOpen = (post: Post) => {
    setEditingPost(post);
    setActiveTab('content');
    
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormSummary(post.summary || '');
    setFormContent(post.content || '');
    setFormThumbnail(post.thumbnail || '');
    setFormPostType(post.post_type || 'news');
    setFormEventStartAt(post.event_start_at ? post.event_start_at.slice(0, 16) : '');
    setFormEventEndAt(post.event_end_at ? post.event_end_at.slice(0, 16) : '');
    setFormEventLocation(post.event_location || '');
    setFormEventRegisterUrl(post.event_register_url || '');
    setFormStatus(post.status);
    setFormIsFeatured(post.is_featured);
    setFormCategoryId(post.post_category_id);
    
    setFormSeoTitle(post.seo_meta?.title || '');
    setFormSeoDescription(post.seo_meta?.description || '');
    setFormSeoKeywords(post.seo_meta?.keywords || '');
    
    setIsFormOpen(true);
  };

  // Save Post Mutation
  const savePostMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formTitle,
        slug: formSlug,
        summary: formSummary,
        content: formContent,
        thumbnail: formThumbnail,
        post_type: formPostType,
        event_start_at: formEventStartAt || null,
        event_end_at: formEventEndAt || null,
        event_location: formEventLocation || null,
        event_register_url: formEventRegisterUrl || null,
        status: formStatus,
        is_featured: formIsFeatured,
        post_category_id: Number(formCategoryId),
        seo_title: formSeoTitle || formTitle,
        seo_description: formSeoDescription || formSummary,
        seo_keywords: formSeoKeywords,
      };

      if (editingPost) {
        return api.put(`/posts/${editingPost.id}`, payload);
      } else {
        return api.post('/posts', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setIsFormOpen(false);
      toast.success(editingPost ? 'Đã cập nhật bài viết thành công!' : 'Đã đăng bài viết mới thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi lưu bài viết. Vui lòng kiểm tra lại dữ liệu.');
    }
  });

  // Delete Post Mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Đã xóa bài viết thành công.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi xóa bài viết.');
    }
  });

  const handleDeletePost = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này? Điều này sẽ xóa toàn bộ SEO Meta liên quan.')) {
      deletePostMutation.mutate(id);
    }
  };

  // Post Category Mutations
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
      return api.post('/post-categories', { name, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-post-categories'] });
      setNewCategoryName('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi tạo danh mục.');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/post-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-post-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể xóa danh mục chứa bài viết.');
    }
  });

  const posts = postsData?.data || [];
  const meta = postsData?.meta;
  const categories = categoriesData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Tin tức</h1>
          <p className="text-sm text-[#8C7A6B]">Soạn thảo bài viết, phân mục tin tức, tối ưu SEO và cấu hình tin nổi bật</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#E8DCCB] hover:bg-[#B88746]/5 text-[#1F1B16] rounded-xl text-sm font-semibold transition-all"
          >
            <Layers className="w-4 h-4 text-[#B88746]" />
            Danh mục Tin tức
          </button>
          <button
            onClick={handleCreateOpen}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Viết bài mới
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
            placeholder="Tìm theo tiêu đề, tóm tắt..."
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
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* News Table */}
      {isPostsLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E8DCCB]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCCB] text-[#8C7A6B] text-sm">
          Không tìm thấy bài viết nào. Hãy tạo bài viết mới.
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F2] border-b border-[#E8DCCB] text-[#8C7A6B] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Bài viết</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Tác giả</th>
                  <th className="px-6 py-4">Ngày đăng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Nổi bật</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60 text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FBF8F2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-[#FBF8F2] border border-[#E8DCCB]/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <Newspaper className="w-5 h-5 text-[#B88746]/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-[#1F1B16] truncate max-w-[280px]" title={post.title}>
                            {post.title}
                          </span>
                          <span className="block text-[10px] text-[#8C7A6B] truncate max-w-[280px]">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-[#B88746]/5 text-[#B88746] border border-[#B88746]/20 px-2 py-0.5 rounded font-medium">
                        {post.category?.name || 'Không xác định'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#1F1B16] inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                        {post.author?.name || 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8C7A6B]">
                      {post.published_at ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.published_at).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Chưa đăng</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        post.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {post.is_featured ? (
                        <span className="inline-flex p-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      {post.status === 'published' && (
                        <a
                          href={`/tin-tuc/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-gray-100 text-[#8C7A6B] rounded-lg transition-colors inline-flex items-center"
                          title="Xem bài viết"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEditOpen(post)}
                        className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors inline-flex items-center"
                        title="Sửa bài viết"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="bg-[#FBF8F2] border-t border-[#E8DCCB] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[#8C7A6B]">
                Hiển thị trang {page} / {meta.last_page} (Tổng số {meta.total} bài viết)
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

      {/* Write/Edit drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white h-full flex flex-col z-10 shadow-2xl border-l border-[#E8DCCB] text-[#1F1B16] font-body"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#E8DCCB] flex justify-between items-center bg-[#FBF8F2]">
                <div>
                  <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
                    {editingPost ? `Sửa bài viết: ${editingPost.title}` : 'Soạn bài viết tin tức mới'}
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Nhập nội dung bài viết, ảnh đại diện và cấu hình SEO để đăng bài
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-[#E8DCCB]/40 text-[#8C7A6B] hover:text-[#1F1B16] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#FBF8F2]/60 px-6 border-b border-[#E8DCCB]/60 text-xs shrink-0 select-none">
                {[
                  { id: 'content', label: 'Soạn thảo nội dung' },
                  { id: 'media', label: 'Hình ảnh đại diện' },
                  { id: 'seo', label: 'Cấu hình SEO' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#B88746] text-[#B88746]'
                        : 'border-transparent text-[#8C7A6B] hover:text-[#1F1B16]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* TAB 1: Content */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề bài viết *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={handleTitleChange}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Tiêu đề tin tức..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Slug URL *</label>
                        <input
                          type="text"
                          required
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="slug-viet-lien-khong-dau"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Danh mục tin tức *</label>
                        <select
                          value={formCategoryId}
                          onChange={(e) => setFormCategoryId(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="">Chọn danh mục...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Loại nội dung *</label>
                        <select
                          value={formPostType}
                          onChange={(e: any) => setFormPostType(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="news">Tin tức</option>
                          <option value="investment">Đầu tư</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                    </div>

                    {formPostType === 'event' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Thời gian bắt đầu</label>
                          <input
                            type="datetime-local"
                            value={formEventStartAt}
                            onChange={(e) => setFormEventStartAt(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Thời gian kết thúc</label>
                          <input
                            type="datetime-local"
                            value={formEventEndAt}
                            onChange={(e) => setFormEventEndAt(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa điểm sự kiện</label>
                          <input
                            type="text"
                            value={formEventLocation}
                            onChange={(e) => setFormEventLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                            placeholder="VD: Sales Gallery Masterise Homes"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">URL đăng ký</label>
                          <input
                            type="url"
                            value={formEventRegisterUrl}
                            onChange={(e) => setFormEventRegisterUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trạng thái bài viết *</label>
                        <select
                          value={formStatus}
                          onChange={(e: any) => setFormStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="draft">Bản nháp</option>
                          <option value="published">Xuất bản ngay</option>
                          {formStatus === 'scheduled' && (
                            <option value="scheduled">Đang hẹn giờ đăng</option>
                          )}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 md:pt-6">
                        <input
                          type="checkbox"
                          id="formIsFeatured"
                          checked={formIsFeatured}
                          onChange={(e) => setFormIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB]"
                        />
                        <label htmlFor="formIsFeatured" className="text-xs font-semibold text-[#1F1B16] cursor-pointer">
                          Đánh dấu bài viết là <b>Nổi bật</b>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tóm tắt bài viết (Summary)</label>
                      <textarea
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung bài viết (Rich Text Editor)</label>
                      <RichTextEditor
                        value={formContent}
                        onChange={setFormContent}
                        placeholder="Nhập nội dung bài viết đầy đủ..."
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: Thumbnail Selection */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-[#8C7A6B]">Ảnh đại diện bài viết</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-32 h-20 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] overflow-hidden flex items-center justify-center shrink-0">
                        {formThumbnail ? (
                          <img src={formThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-[#B88746]/40" />
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
                          onClick={() => setIsMediaOpen(true)}
                          className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Chọn từ Media Library
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SEO */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề SEO</label>
                      <input
                        type="text"
                        value={formSeoTitle}
                        onChange={(e) => setFormSeoTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        placeholder="Để trống sẽ lấy tiêu đề bài viết..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả SEO</label>
                      <textarea
                        value={formSeoDescription}
                        onChange={(e) => setFormSeoDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        placeholder="Để trống sẽ lấy phần tóm tắt..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Từ khóa SEO</label>
                      <input
                        type="text"
                        value={formSeoKeywords}
                        onChange={(e) => setFormSeoKeywords(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        placeholder="Ví dụ: tin tuc masterise, du an the global city..."
                      />
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
                  onClick={() => savePostMutation.mutate()}
                  disabled={savePostMutation.isPending || !formTitle || !formSlug || !formCategoryId}
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {savePostMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Đăng / Lưu bài viết
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Manager Modal */}
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
                <h3 className="font-heading font-medium text-lg text-[#1F1B16]">Danh mục Tin tức</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Category Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tên danh mục tin mới..."
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

              {/* Categories list */}
              {isCategoriesLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-[#B88746] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 italic">
                  Chưa có danh mục tin nào.
                </div>
              ) : (
                <div className="divide-y divide-[#E8DCCB]/60 max-h-[200px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold">{cat.name}</span>
                        <span className="block text-[9px] text-[#8C7A6B]">/{cat.slug} (Có {cat.posts_count || 0} bài viết)</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa danh mục tin "${cat.name}"?`)) {
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

      {/* Media Selector Modal */}
      <AnimatePresence>
        {isMediaOpen && (
          <MediaSelectModal
            isOpen={isMediaOpen}
            onClose={() => setIsMediaOpen(false)}
            onSelect={(url) => setFormThumbnail(url as string)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminNewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center font-body text-[#1F1B16]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B88746] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8C7A6B] text-sm">Đang tải trình quản lý tin tức...</p>
        </div>
      </div>
    }>
      <AdminNews />
    </Suspense>
  );
}
