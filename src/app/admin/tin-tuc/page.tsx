'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api, formatApiError } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { Post, PostCategory, PostMedia, Tag } from '@/types/api';
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
  User,
  FileText,
  Play,
  Video,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import RichTextEditor from '@/components/admin/RichTextEditor';
import RelatedPostsSelector from '@/components/admin/RelatedPostsSelector';
import { tagService } from '@/services/tagService';
import { getPostDetailHref } from '@/lib/postRoutes';
import { splitArticleIntroAndMain } from '@/lib/articleContent';

type NewsMediaDraft = Omit<PostMedia, 'id' | 'post_id' | 'created_at' | 'updated_at'> & {
  id?: number;
};

type MediaSelectTarget =
  | { mode: 'thumbnail' }
  | { mode: 'gallery' }
  | { mode: 'poster'; index: number }
  | { mode: 'item'; index: number }
  | null;

const createMediaDraft = (type: NewsMediaDraft['type'], url = ''): NewsMediaDraft => ({
  type,
  title: '',
  url,
  thumbnail_url: '',
  media_id: null,
  mime_type: null,
  file_size: null,
  sort_order: 0,
  meta: null,
});

function inferMediaTypeFromUrl(url: string): NewsMediaDraft['type'] {
  const clean = url.split('?')[0].toLowerCase();
  if (/\.(mp4|webm|mov)$/.test(clean)) return 'video_upload';
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/.test(clean)) return 'document';
  return 'image';
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');
    if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || '';
    if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/').filter(Boolean)[1] || '';
    if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/').filter(Boolean)[1] || '';
    return parsed.searchParams.get('v') || '';
  } catch {
    return '';
  }
}

function getYouTubeThumbnail(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

function getFileName(url?: string | null) {
  if (!url) return '';
  const clean = url.split('?')[0];
  return decodeURIComponent(clean.split('/').filter(Boolean).pop() || clean);
}

function getFileExtension(url?: string | null) {
  const name = getFileName(url).toLowerCase();
  const match = name.match(/\.([a-z0-9]+)$/);
  return match?.[1]?.toUpperCase() || 'FILE';
}

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
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Category manager modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Media Selector state
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaSelectTarget, setMediaSelectTarget] = useState<MediaSelectTarget>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSlugManuallyEdited, setFormSlugManuallyEdited] = useState(false);
  const [formSummary, setFormSummary] = useState('');
  const [formIntroContent, setFormIntroContent] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formMediaItems, setFormMediaItems] = useState<NewsMediaDraft[]>([]);
  const [formPostType, setFormPostType] = useState<'news' | 'investment' | 'event'>('news');
  const [formEventStartAt, setFormEventStartAt] = useState('');
  const [formEventEndAt, setFormEventEndAt] = useState('');
  const [formEventLocation, setFormEventLocation] = useState('');
  const [formEventRegisterUrl, setFormEventRegisterUrl] = useState('');
  const [formEventSeo, setFormEventSeo] = useState({
    event_location_name: '', event_street_address: '', event_locality: '', event_region: '',
    event_postal_code: '', event_country: 'VN', event_attendance_mode: 'Offline' as 'Offline' | 'Online' | 'Mixed',
    event_status: 'Scheduled' as 'Scheduled' | 'Cancelled' | 'Postponed' | 'Rescheduled',
    event_organizer_name: '', event_organizer_url: '', event_online_url: '', event_price: '',
    event_currency: 'VND', event_availability: 'InStock' as 'InStock' | 'PreOrder' | 'SoldOut',
  });
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState<number | ''>('');
  const [formTagIds, setFormTagIds] = useState<number[]>([]);
  const [formRelatedPostIds, setFormRelatedPostIds] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  const getApiErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return 'Lỗi khi lưu bài viết. Vui lòng kiểm tra lại dữ liệu.';
  };

  const normalizeApiFieldErrors = (err: unknown) => {
    const errors = (err as { errors?: Record<string, string[]> })?.errors || {};
    return Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, messages?.[0] || 'Dữ liệu chưa hợp lệ.'])
    );
  };

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

  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await tagService.getTags({ with_count: true })).data,
  });
  const { data: relatedCandidates = [] } = useQuery({
    queryKey: ['related-post-candidates', formPostType],
    queryFn: async () => (await api.get<Post[]>(`/posts?per_page=100&status=published&post_type=${formPostType}`)).data,
    enabled: isFormOpen,
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
    setFormError('');
    setFieldErrors({});
    
    setFormTitle('');
    setFormSlug('');
    setFormSlugManuallyEdited(false);
    setFormSummary('');
    setFormIntroContent('');
    setFormContent('');
    setFormThumbnail('');
    setFormMediaItems([]);
    setFormPostType('news');
    setFormEventStartAt('');
    setFormEventEndAt('');
    setFormEventLocation('');
    setFormEventRegisterUrl('');
    setFormEventSeo({
      event_location_name: '', event_street_address: '', event_locality: '', event_region: '',
      event_postal_code: '', event_country: 'VN', event_attendance_mode: 'Offline', event_status: 'Scheduled',
      event_organizer_name: '', event_organizer_url: '', event_online_url: '', event_price: '',
      event_currency: 'VND', event_availability: 'InStock',
    });
    setFormStatus('draft');
    setFormIsFeatured(false);
    setFormCategoryId(categoriesData && categoriesData.length > 0 ? categoriesData[0].id : '');
    setFormTagIds([]);
    setFormRelatedPostIds([]);
    setTagSearch('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSeoKeywords('');
    
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleEditOpen = (post: Post) => {
    setEditingPost(post);
    setActiveTab('content');
    setFormError('');
    setFieldErrors({});
    
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormSlugManuallyEdited(true);
    setFormSummary(post.summary || '');
    if (post.intro_content !== null && post.intro_content !== undefined) {
      setFormIntroContent(post.intro_content);
      setFormContent(post.content || '');
    } else {
      const legacyContent = post.content || '';
      const split = splitArticleIntroAndMain(legacyContent);
      setFormIntroContent(split.mainHtml ? split.introHtml : '');
      setFormContent(split.mainHtml || legacyContent);
    }
    setFormThumbnail(post.thumbnail || '');
    setFormMediaItems((post.media_items || []).map((item, index) => ({
      id: item.id,
      media_id: item.media_id || null,
      type: item.type,
      title: item.title || '',
      url: item.url || '',
      thumbnail_url: item.thumbnail_url || '',
      mime_type: item.mime_type || null,
      file_size: item.file_size || null,
      sort_order: item.sort_order ?? index,
      meta: item.meta || null,
    })));
    setFormPostType(post.post_type || 'news');
    setFormEventStartAt(post.event_start_at ? post.event_start_at.slice(0, 16) : '');
    setFormEventEndAt(post.event_end_at ? post.event_end_at.slice(0, 16) : '');
    setFormEventLocation(post.event_location || '');
    setFormEventRegisterUrl(post.event_register_url || '');
    setFormEventSeo({
      event_location_name: post.event_location_name || '',
      event_street_address: post.event_street_address || '',
      event_locality: post.event_locality || '',
      event_region: post.event_region || '',
      event_postal_code: post.event_postal_code || '',
      event_country: post.event_country || 'VN',
      event_attendance_mode: post.event_attendance_mode || 'Offline',
      event_status: post.event_status || 'Scheduled',
      event_organizer_name: post.event_organizer_name || '',
      event_organizer_url: post.event_organizer_url || '',
      event_online_url: post.event_online_url || '',
      event_price: post.event_price || '',
      event_currency: post.event_currency || 'VND',
      event_availability: post.event_availability || 'InStock',
    });
    setFormStatus(post.status);
    setFormIsFeatured(post.is_featured);
    setFormCategoryId(post.post_category_id);
    setFormTagIds((post.tags || []).map((tag) => tag.id));
    setFormRelatedPostIds((post.manual_related_posts || []).map((item) => item.id));
    setTagSearch('');
    
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
        slug_is_auto: !editingPost && !formSlugManuallyEdited,
        summary: formSummary,
        intro_content: formIntroContent,
        content: formContent,
        thumbnail: formThumbnail,
        post_type: formPostType,
        event_start_at: formEventStartAt || null,
        event_end_at: formEventEndAt || null,
        event_location: formEventLocation || null,
        event_register_url: formEventRegisterUrl || null,
        ...Object.fromEntries(Object.entries(formEventSeo).map(([key, value]) => [key, value || null])),
        status: formStatus,
        is_featured: formIsFeatured,
        post_category_id: Number(formCategoryId),
        tag_ids: formTagIds,
        related_post_ids: formRelatedPostIds,
        media_items: formMediaItems.map((item, index) => ({
          ...item,
          sort_order: index,
          title: item.title || undefined,
          thumbnail_url: item.thumbnail_url || undefined,
          url: item.url || undefined,
        })),
        seo_title: formSeoTitle || formTitle,
        seo_description: formSeoDescription || formSummary,
        seo_keywords: formSeoKeywords,
      };

      if (editingPost) {
        return api.put<Post>(`/posts/${editingPost.id}`, payload);
      } else {
        return api.post<Post>('/posts', payload);
      }
    },
    onSuccess: async (response) => {
      const savedPost = response.data;
      const requestedSlug = formSlug.trim();
      const autoAdjustedSlug = !editingPost
        && !formSlugManuallyEdited
        && Boolean(savedPost?.slug)
        && savedPost.slug !== requestedSlug;
      let freshPost = savedPost;

      if (savedPost?.id) {
        const freshResponse = await api.get<Post[]>(`/posts?id=${savedPost.id}&per_page=1&status=all`);
        freshPost = freshResponse.data?.[0] || savedPost;

        queryClient.setQueriesData({ queryKey: ['admin-posts'] }, (oldData: unknown) => {
          const current = oldData as { data?: Post[] } | undefined;
          if (!current?.data) return oldData;
          return {
            ...current,
            data: current.data.map((post) => post.id === freshPost.id ? { ...post, ...freshPost } : post),
          };
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      await queryClient.refetchQueries({ queryKey: ['admin-posts'], type: 'active' });
      setIsFormOpen(false);
      if (freshPost?.id) setEditingPost(freshPost);
      setFormError('');
      setFieldErrors({});
      if (autoAdjustedSlug) {
        toast.info(`Slug đã tồn tại nên hệ thống tự đổi thành /${savedPost.slug}.`);
      }
      toast.success(editingPost ? 'Đã cập nhật bài viết thành công!' : 'Đã đăng bài viết mới thành công!');
    },
    onError: (err: unknown) => {
      const nextFieldErrors = normalizeApiFieldErrors(err);
      const message = nextFieldErrors.slug || formatApiError(err, getApiErrorMessage(err));
      setFieldErrors(nextFieldErrors);
      setFormError(message);
      setActiveTab('content');
      toast.error(message);
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

  const handleSavePost = () => {
    const nextErrors: Record<string, string> = {};

    if (!formTitle.trim()) nextErrors.title = 'Vui lòng nhập tiêu đề bài viết.';
    if (!formSlug.trim()) nextErrors.slug = 'Vui lòng nhập slug URL.';
    if (!formCategoryId) nextErrors.post_category_id = 'Vui lòng chọn danh mục tin tức trước khi lưu.';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(Object.values(nextErrors)[0]);
      setActiveTab('content');
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    setFormError('');
    setFieldErrors({});
    savePostMutation.mutate();
  };

  const createAndSelectTag = async () => {
    const name = tagSearch.trim();
    if (!name) return;
    const existing = tagsData.find((tag) => tag.name.toLocaleLowerCase('vi-VN') === name.toLocaleLowerCase('vi-VN'));
    if (existing) {
      setFormTagIds((ids) => ids.includes(existing.id) ? ids : [...ids, existing.id]);
      setTagSearch('');
      return;
    }
    try {
      const response = await tagService.createTag(name);
      setFormTagIds((ids) => [...ids, response.data.id]);
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      setTagSearch('');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const selectedTags = tagsData.filter((tag) => formTagIds.includes(tag.id));
  const filteredTags = tagsData.filter((tag) => !formTagIds.includes(tag.id) && (!tagSearch.trim() || tag.name.toLocaleLowerCase('vi-VN').includes(tagSearch.trim().toLocaleLowerCase('vi-VN'))));

  const updateMediaItem = (index: number, patch: Partial<NewsMediaDraft>) => {
    setFormMediaItems((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item));
  };

  const addMediaItem = (type: NewsMediaDraft['type'], url = '') => {
    setFormMediaItems((items) => [...items, { ...createMediaDraft(type, url), sort_order: items.length }]);
  };

  const removeMediaItem = (index: number) => {
    setFormMediaItems((items) => items.filter((_, idx) => idx !== index));
  };

  const moveMediaItem = (index: number, direction: -1 | 1) => {
    setFormMediaItems((items) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, idx) => ({ ...item, sort_order: idx }));
    });
  };

  const openMediaSelector = (target: MediaSelectTarget) => {
    setMediaSelectTarget(target);
    setIsMediaOpen(true);
  };

  // Post Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const normalizedName = name.trim();
      const slug = normalizedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      return api.post('/post-categories', { name: normalizedName, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-post-categories'] });
      setNewCategoryName('');
    },
    onError: (error: unknown) => {
      toast.error(formatApiError(error, 'Không thể tạo danh mục.'));
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
                          href={getPostDetailHref(post)}
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
                  { id: 'media', label: 'Media & Tài liệu' },
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
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                    {formError}
                  </div>
                )}
                
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
                      {fieldErrors.title && <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Slug URL *</label>
                        <input
                          type="text"
                          required
                          value={formSlug}
                          onChange={(e) => {
                            setFormSlug(e.target.value);
                            setFormSlugManuallyEdited(true);
                          }}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="slug-viet-lien-khong-dau"
                        />
                        {fieldErrors.slug && <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.slug}</p>}
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
                        {fieldErrors.post_category_id && <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.post_category_id}</p>}
                        {categories.length === 0 && (
                          <p className="mt-1 text-[11px] text-[#8C7A6B]">
                            Chưa có danh mục tin tức. Hãy bấm “Danh mục Tin tức” để thêm trước khi lưu bài.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Loại nội dung *</label>
                        <select
                          value={formPostType}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFormPostType(e.target.value as 'news' | 'investment' | 'event'); setFormRelatedPostIds([]); }}
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
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Hình thức tham dự</label>
                          <select value={formEventSeo.event_attendance_mode} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_attendance_mode: e.target.value as 'Offline' | 'Online' | 'Mixed' }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm">
                            <option value="Offline">Trực tiếp</option><option value="Online">Trực tuyến</option><option value="Mixed">Kết hợp</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trạng thái sự kiện</label>
                          <select value={formEventSeo.event_status} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_status: e.target.value as 'Scheduled' | 'Cancelled' | 'Postponed' | 'Rescheduled' }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm">
                            <option value="Scheduled">Đã lên lịch</option><option value="Postponed">Tạm hoãn</option><option value="Rescheduled">Đổi lịch</option><option value="Cancelled">Đã hủy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên địa điểm chuẩn Schema</label>
                          <input value={formEventSeo.event_location_name} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_location_name: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="Tên địa điểm thật" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ đường phố</label>
                          <input value={formEventSeo.event_street_address} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_street_address: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="Số nhà, tên đường" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Quận/Huyện</label>
                          <input value={formEventSeo.event_locality} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_locality: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tỉnh/Thành phố</label>
                          <input value={formEventSeo.event_region} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_region: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">URL tham dự online</label>
                          <input type="url" value={formEventSeo.event_online_url} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_online_url: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Đơn vị tổ chức</label>
                          <input value={formEventSeo.event_organizer_name} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_organizer_name: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mã bưu chính</label>
                          <input value={formEventSeo.event_postal_code} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_postal_code: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mã quốc gia</label>
                          <input value={formEventSeo.event_country} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_country: e.target.value.toUpperCase() }))} maxLength={2} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="VN" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">URL đơn vị tổ chức</label>
                          <input type="url" value={formEventSeo.event_organizer_url} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_organizer_url: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá vé thực</label>
                          <input type="number" min="0" step="0.01" value={formEventSeo.event_price} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_price: e.target.value }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="Để trống nếu không có giá" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiền tệ</label>
                          <input value={formEventSeo.event_currency} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_currency: e.target.value.toUpperCase() }))} maxLength={3} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm" placeholder="VND" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tình trạng vé</label>
                          <select value={formEventSeo.event_availability} onChange={(e) => setFormEventSeo((value) => ({ ...value, event_availability: e.target.value as 'InStock' | 'PreOrder' | 'SoldOut' }))} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm">
                            <option value="InStock">Còn chỗ</option><option value="PreOrder">Sắp mở</option><option value="SoldOut">Hết chỗ</option>
                          </select>
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
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Đoạn mở đầu</label>
                      <p className="mb-2 text-[11px] text-[#8C7A6B]">Phần này hiển thị trước các bài viết liên quan.</p>
                      <RichTextEditor
                        value={formIntroContent}
                        onChange={setFormIntroContent}
                        placeholder="Nhập đoạn giới thiệu ngắn của bài viết..."
                        enableProjectLinks
                        stickyToolbar
                        editorLabel="Đoạn mở đầu"
                      />
                    </div>

                    <RelatedPostsSelector
                      candidates={relatedCandidates}
                      selectedIds={formRelatedPostIds}
                      onChange={setFormRelatedPostIds}
                      postTypes={formPostType}
                      excludeId={editingPost?.id}
                      title="Bài viết liên quan chèn sau đoạn mở đầu"
                      description="Nếu chọn dưới 3 bài, hệ thống tự bổ sung bài cùng loại và không trùng lặp."
                    />

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung chính</label>
                      <p className="mb-2 text-[11px] text-[#8C7A6B]">Phần này hiển thị ngay sau khối bài viết liên quan.</p>
                      <RichTextEditor
                        value={formContent}
                        onChange={setFormContent}
                        placeholder="Nhập nội dung chính đầy đủ..."
                        enableProjectLinks
                        stickyToolbar
                        editorLabel="Nội dung chính"
                      />
                    </div>

                    <section className="rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-4">
                      <label className="block text-xs font-bold text-[#6E5F51]">Tags</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTags.map((tag) => <button type="button" key={tag.id} onClick={() => setFormTagIds((ids) => ids.filter((id) => id !== tag.id))} className="inline-flex items-center gap-1 rounded-full bg-[#B88746] px-3 py-1.5 text-xs font-bold text-white">#{tag.name}<X className="h-3 w-3" /></button>)}
                      </div>
                      <div className="mt-3 flex gap-2"><input value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} placeholder="Tìm hoặc tạo tag..." className="h-10 min-w-0 flex-1 rounded-xl border border-[#E8DCCB] bg-white px-3 text-sm outline-none focus:border-[#B88746]" /><button type="button" onClick={createAndSelectTag} className="rounded-xl bg-[#1F1B16] px-3 text-xs font-bold text-white">Thêm tag</button></div>
                      {tagSearch && <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">{filteredTags.slice(0, 8).map((tag) => <button type="button" key={tag.id} onClick={() => { setFormTagIds((ids) => [...ids, tag.id]); setTagSearch(''); }} className="block w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-semibold hover:text-[#B88746]">{tag.name} {tag.posts_count !== undefined ? `(${tag.posts_count})` : ''}</button>)}</div>}
                    </section>
                  </div>
                )}

                {/* TAB 2: Media Library */}
                {activeTab === 'media' && (
                  <div className="space-y-6">
                    <section className="rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2]/60 p-4">
                      <label className="block text-xs font-semibold text-[#8C7A6B]">Ảnh đại diện bài viết</label>
                      <div className="mt-3 flex gap-4 items-center">
                        <div className="w-32 h-20 rounded-xl border border-[#E8DCCB] bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {formThumbnail ? (
                            <img src={formThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-[#B88746]/40" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="min-h-9 rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-xs text-[#8C7A6B]">
                            {formThumbnail ? 'Đã chọn ảnh từ Media Library' : 'Chưa chọn ảnh đại diện'}
                          </div>
                          <button
                            type="button"
                            onClick={() => openMediaSelector({ mode: 'thumbnail' })}
                            className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Chọn từ Media Library
                          </button>
                          {formThumbnail && (
                            <button
                              type="button"
                              onClick={() => setFormThumbnail('')}
                              className="ml-2 px-3 py-1.5 border border-red-100 bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#1F1B16]">Album ảnh, video và tài liệu</h4>
                          <p className="text-[11px] text-[#8C7A6B]">Thêm nhiều ảnh dạng slider, video upload hoặc YouTube, PDF/DOC/DOCX tải về.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openMediaSelector({ mode: 'gallery' })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F1B16] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#B88746]">
                            <ImageIcon className="h-3.5 w-3.5" /> Thêm ảnh
                          </button>
                          <button type="button" onClick={() => addMediaItem('youtube')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1F1B16] hover:border-[#B88746]">
                            <Play className="h-3.5 w-3.5 text-red-500" /> YouTube
                          </button>
                          <button type="button" onClick={() => addMediaItem('video_upload')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1F1B16] hover:border-[#B88746]">
                            <Video className="h-3.5 w-3.5 text-[#B88746]" /> Video file
                          </button>
                          <button type="button" onClick={() => addMediaItem('document')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1F1B16] hover:border-[#B88746]">
                            <FileText className="h-3.5 w-3.5 text-[#B88746]" /> Tài liệu
                          </button>
                        </div>
                      </div>

                      {formMediaItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#E8DCCB] bg-[#FBF8F2] p-6 text-center text-xs text-[#8C7A6B]">
                          Chưa có media đính kèm. Bấm các nút phía trên để thêm ảnh, video hoặc tài liệu.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formMediaItems.map((item, index) => (
                            <div key={`${item.type}-${index}`} className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B88746]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#B88746]">
                                  {item.type === 'image' && <ImageIcon className="h-3 w-3" />}
                                  {item.type === 'youtube' && <Play className="h-3 w-3" />}
                                  {item.type === 'video_upload' && <Video className="h-3 w-3" />}
                                  {item.type === 'document' && <FileText className="h-3 w-3" />}
                                  {item.type === 'image' ? 'Ảnh' : item.type === 'youtube' ? 'YouTube' : item.type === 'video_upload' ? 'Video file' : 'Tài liệu'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => moveMediaItem(index, -1)} disabled={index === 0} className="rounded-lg border border-[#E8DCCB] p-1.5 text-[#8C7A6B] disabled:opacity-30">
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button type="button" onClick={() => moveMediaItem(index, 1)} disabled={index === formMediaItems.length - 1} className="rounded-lg border border-[#E8DCCB] p-1.5 text-[#8C7A6B] disabled:opacity-30">
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                  <button type="button" onClick={() => removeMediaItem(index)} className="rounded-lg border border-red-100 bg-red-50 px-2 py-1.5 text-[10px] font-bold text-red-600">
                                    Xóa
                                  </button>
                                </div>
                              </div>

                              {(item.url || item.thumbnail_url) && (
                                <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] p-2">
                                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E8DCCB] bg-white">
                                    {item.type === 'image' && item.url ? (
                                      <img src={item.url} alt={item.title || 'Media preview'} className="h-full w-full object-cover" />
                                    ) : (item.type === 'youtube' || item.type === 'video_upload') && item.thumbnail_url ? (
                                      <img src={item.thumbnail_url} alt={item.title || 'Video preview'} className="h-full w-full object-cover" />
                                    ) : item.type === 'video_upload' ? (
                                      <Video className="h-6 w-6 text-[#B88746]" />
                                    ) : item.type === 'youtube' ? (
                                      <Play className="h-6 w-6 text-red-500" />
                                    ) : (
                                      <FileText className="h-6 w-6 text-[#B88746]" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold text-[#1F1B16]">
                                      {item.title || getFileName(item.url) || 'Media đã chọn'}
                                    </p>
                                    <p className="mt-1 truncate text-[11px] font-semibold text-[#8C7A6B]">
                                      {item.type === 'document' ? `${getFileExtension(item.url)}${item.file_size ? ` - ${Math.round(item.file_size / 1024)} KB` : ''}` : item.type === 'youtube' ? 'YouTube' : item.type === 'video_upload' ? 'Video upload' : 'Ảnh từ Media Library'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="grid gap-3 md:grid-cols-2">
                                <label className="text-[11px] font-semibold text-[#8C7A6B]">
                                  Tiêu đề hiển thị
                                  <input value={item.title || ''} onChange={(e) => updateMediaItem(index, { title: e.target.value })} className="mt-1 w-full rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 py-2 text-xs text-[#1F1B16] outline-none" placeholder="Ví dụ: Mặt bằng tổng thể, Brochure PDF..." />
                                </label>
                                <label className="text-[11px] font-semibold text-[#8C7A6B]">
                                  {item.type === 'youtube' ? 'Link YouTube' : 'File từ Media Library'}
                                  {item.type === 'youtube' ? (
                                    <input value={item.url || ''} onChange={(e) => {
                                      const nextUrl = e.target.value;
                                      updateMediaItem(index, {
                                        url: nextUrl,
                                        type: 'youtube',
                                        thumbnail_url: item.thumbnail_url || getYouTubeThumbnail(nextUrl),
                                      });
                                    }} className="mt-1 w-full rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 py-2 text-xs text-[#1F1B16] outline-none" placeholder="https://www.youtube.com/watch?v=..." />
                                  ) : (
                                    <div className="mt-1 flex gap-2">
                                      <div className="min-h-9 w-full rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 py-2 text-xs text-[#8C7A6B]">
                                        {item.url ? 'Đã chọn file từ Media Library' : 'Chưa chọn file'}
                                      </div>
                                      <button type="button" onClick={() => openMediaSelector({ mode: 'item', index })} className="shrink-0 rounded-xl bg-[#1F1B16] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#B88746]">
                                        Chọn file
                                      </button>
                                    </div>
                                  )}
                                </label>
                                {(item.type === 'video_upload' || item.type === 'youtube') && (
                                  <div className="text-[11px] font-semibold text-[#8C7A6B] md:col-span-2">
                                    Ảnh poster/thumbnail video
                                    <div className="mt-1 flex flex-wrap items-center gap-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] p-2">
                                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-[#E8DCCB] bg-white flex items-center justify-center">
                                        {item.thumbnail_url ? (
                                          <img src={item.thumbnail_url} alt="Poster video" className="h-full w-full object-cover" />
                                        ) : (
                                          <ImageIcon className="h-5 w-5 text-[#B88746]/40" />
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1 text-xs font-normal text-[#8C7A6B]">
                                        {item.thumbnail_url ? 'Đã chọn ảnh poster từ Media Library' : 'Chưa chọn poster, có thể bỏ trống'}
                                      </div>
                                      <button type="button" onClick={() => openMediaSelector({ mode: 'poster', index })} className="rounded-xl bg-[#1F1B16] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#B88746]">
                                        Chọn ảnh
                                      </button>
                                      {item.thumbnail_url && (
                                        <button type="button" onClick={() => updateMediaItem(index, { thumbnail_url: '' })} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">
                                          Xóa
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
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
                  onClick={handleSavePost}
                  disabled={savePostMutation.isPending}
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
            multiple={mediaSelectTarget?.mode === 'gallery'}
            selectedUrls={mediaSelectTarget?.mode === 'gallery' ? formMediaItems.filter((item) => item.type === 'image').map((item) => item.url || '').filter((url): url is string => Boolean(url)) : []}
            onClose={() => {
              setIsMediaOpen(false);
              setMediaSelectTarget(null);
            }}
            onSelect={(url) => {
              const urls = Array.isArray(url) ? url : [url];
              const selectedUrl = urls[0];

              if (mediaSelectTarget?.mode === 'thumbnail' && selectedUrl) {
                setFormThumbnail(selectedUrl);
              }

              if (mediaSelectTarget?.mode === 'gallery') {
                setFormMediaItems((items) => [
                  ...items.filter((item) => item.type !== 'image'),
                  ...urls.filter((itemUrl): itemUrl is string => Boolean(itemUrl)).map((itemUrl, idx) => ({
                    ...createMediaDraft('image', itemUrl),
                    title: '',
                    sort_order: items.length + idx,
                  })),
                ]);
              }

              if (mediaSelectTarget?.mode === 'item' && selectedUrl) {
                updateMediaItem(mediaSelectTarget.index, {
                  url: selectedUrl,
                  type: inferMediaTypeFromUrl(selectedUrl),
                });
              }

              if (mediaSelectTarget?.mode === 'poster' && selectedUrl) {
                updateMediaItem(mediaSelectTarget.index, {
                  thumbnail_url: selectedUrl,
                });
              }

              setIsMediaOpen(false);
              setMediaSelectTarget(null);
            }}
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
