'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { Project, ProjectCategory, ProjectStatus } from '@/types/api';
import { PROJECT_STATUS_OPTIONS, getProjectStatusColor, getProjectStatusLabel } from '@/lib/projectStatus';
import { formatVnd } from '@/lib/projectPrice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Check, 
  Layers, 
  X, 
  Image as ImageIcon, 
  Eye,
  Star
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import AdminMediaField from '@/components/admin/media/AdminMediaField';
import AdminImagePreview from '@/components/admin/media/AdminImagePreview';
import RichTextEditor from '@/components/admin/RichTextEditor';
import VR360Tab from '@/components/admin/vr360/VR360Tab';
import type { FloorPlanGroup, FloorPlanItem, FloorPlanTab } from '@/types/floor-plan';
import { createFloorPlanKey, normalizeFloorPlanGroups, uniqueFloorPlanImages } from '@/lib/projectFloorPlan';

type SelectOption = {
  id: number;
  name: string;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  region_id?: number | null;
  region?: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
  } | null;
};
type IconValueItem = { label: string; value: string; icon: string };
type StatItem = { value: string; label: string };
type ConnectivityItem = { time: string; label: string };
type AmenityItem = { title: string; description: string; image: string; icon: string };
type HandoverStandardItem = { title: string; description: string; image: string; icon: string };
type ReasonItem = { title: string; description: string; icon: string };
type TestimonialItem = { name: string; role: string; content: string; avatar: string };
type FaqItem = { question: string; answer: string };
type PriceRowItem = {
  kind: 'row' | 'image' | 'file' | 'note';
  productType: string;
  area: string;
  price: string;
  payment: string;
  status: string;
  note: string;
  title: string;
  description: string;
  image_url: string;
  file_url: string;
  file_type: 'pdf' | 'excel' | 'word' | 'image' | 'other';
  file_size: string;
  button_label: string;
  highlight: boolean;
};
type PolicyItem = {
  title: string;
  description: string;
  icon: string;
  image_url: string;
  badge: string;
  bullets: string[];
  cta_label: string;
  cta_url: string;
  file_url: string;
};
type TimelineItem = { date: string; title: string };
type ProjectSectionTitleKey =
  | 'overview'
  | 'location'
  | 'amenities'
  | 'floorPlans'
  | 'handover'
  | 'productInfo'
  | 'pricingPolicy'
  | 'policies'
  | 'timeline'
  | 'investment'
  | 'testimonials'
  | 'faq'
  | 'contact';
type ProjectSectionTitles = Record<ProjectSectionTitleKey, { eyebrow: string; title: string }>;

const defaultProjectSectionTitles: ProjectSectionTitles = {
  overview: { eyebrow: 'Tổng quan dự án', title: '' },
  location: { eyebrow: 'Vị trí chiến lược', title: 'Kết nối toàn diện' },
  amenities: { eyebrow: '', title: 'Tiện ích nổi bật' },
  floorPlans: { eyebrow: 'Mặt bằng', title: 'Mặt bằng điển hình' },
  handover: { eyebrow: 'Bàn giao', title: 'Tiêu chuẩn bàn giao' },
  productInfo: { eyebrow: '', title: 'Sản phẩm & Bảng giá' },
  pricingPolicy: { eyebrow: 'Bảng giá', title: 'Bảng giá & Chính sách' },
  policies: { eyebrow: '', title: 'Chính sách bán hàng' },
  timeline: { eyebrow: '', title: 'Tiến độ thi công' },
  investment: { eyebrow: '', title: 'Vì sao nên đầu tư?' },
  testimonials: { eyebrow: '', title: 'Khách hàng nói gì?' },
  faq: { eyebrow: '', title: 'Câu hỏi thường gặp' },
  contact: { eyebrow: '', title: 'Đăng ký tư vấn\nNhận thông tin dự án' },
};

const projectSectionTitleLabels: { key: ProjectSectionTitleKey; label: string }[] = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'location', label: 'Vị trí & Kết nối' },
  { key: 'amenities', label: 'Tiện ích nổi bật' },
  { key: 'floorPlans', label: 'Mặt bằng' },
  { key: 'handover', label: 'Tiêu chuẩn bàn giao' },
  { key: 'productInfo', label: 'Sản phẩm & Bảng giá' },
  { key: 'pricingPolicy', label: 'Bảng giá & Chính sách' },
  { key: 'policies', label: 'Chính sách bán hàng' },
  { key: 'timeline', label: 'Tiến độ thi công' },
  { key: 'investment', label: 'Lý do đầu tư' },
  { key: 'testimonials', label: 'Đánh giá khách hàng' },
  { key: 'faq', label: 'FAQ dự án' },
  { key: 'contact', label: 'Form tư vấn' },
];

const normalizeProjectSectionTitles = (value: unknown): ProjectSectionTitles => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaultProjectSectionTitles;
  }

  const record = value as Record<string, { eyebrow?: unknown; title?: unknown }>;
  return projectSectionTitleLabels.reduce((acc, item) => {
    const current = record[item.key] || {};
    acc[item.key] = {
      eyebrow: typeof current.eyebrow === 'string' ? current.eyebrow : defaultProjectSectionTitles[item.key].eyebrow,
      title: typeof current.title === 'string' ? current.title : defaultProjectSectionTitles[item.key].title,
    };
    return acc;
  }, { ...defaultProjectSectionTitles } as ProjectSectionTitles);
};

type BaseMediaTarget = 'thumbnail' | 'banner' | 'gallery' | 'detailGallery' | 'brochure' | 'map';
type RepeaterMediaTarget =
  | { group: 'amenityDetails'; index: number; field: 'image' }
  | { group: 'handoverStandards'; index: number; field: 'image' }
  | { group: 'projectTestimonials'; index: number; field: 'avatar' }
  | { group: 'floorPlanGroups'; groupIndex: number; tabIndex: number; itemIndex: number; field: 'images' }
  | { group: 'priceRows'; index: number; field: 'image_url' | 'file_url' }
  | { group: 'policyCards'; index: number; field: 'image_url' | 'file_url' };
type MediaSelectorTarget = BaseMediaTarget | RepeaterMediaTarget | null;
type ProjectAdminTab =
  | 'overview'
  | 'hero'
  | 'gallery'
  | 'location'
  | 'amenities'
  | 'floor'
  | 'handover'
  | 'pricingPolicy'
  | 'timeline'
  | 'investment'
  | 'faq'
  | 'media'
  | 'seo'
  | 'vr360';
type ProjectSaveMode = 'draft' | 'save' | 'preview' | 'publish';
type ChecklistStatus = 'complete' | 'missing' | 'optional' | 'error';
type SectionChecklistItem = {
  key: ProjectAdminTab;
  label: string;
  status: ChecklistStatus;
  missingFields: string[];
  targetTab: ProjectAdminTab;
  targetField?: string;
};

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectAdminTab>('overview');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [activeChecklistTarget, setActiveChecklistTarget] = useState<{ tab: ProjectAdminTab; field?: string } | null>(null);
  const [editLoadingProjectId, setEditLoadingProjectId] = useState<number | null>(null);
  
  // Category manager modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategorySlug, setEditingCategorySlug] = useState('');
  
  // Media Selector state
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<MediaSelectorTarget>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formProjectLabel, setFormProjectLabel] = useState('');
  const [formDeveloperId, setFormDeveloperId] = useState<number | ''>('');
  const [formLocationId, setFormLocationId] = useState<number | ''>('');
  const [formLocationSearch, setFormLocationSearch] = useState('');
  const [formProjectStatus, setFormProjectStatus] = useState<ProjectStatus>('coming_soon');
  const [formOpenSaleAt, setFormOpenSaleAt] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsHot, setFormIsHot] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formDeveloper, setFormDeveloper] = useState('Masterise Homes'); // Default developer - matches company_name in settings
  const [formScale, setFormScale] = useState('');
  const [formHandoverYear, setFormHandoverYear] = useState<number | ''>('');
  const [formHandoverTime, setFormHandoverTime] = useState('');
  
  const [formLocation, setFormLocation] = useState('');
  const [formLocationDescription, setFormLocationDescription] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formLat, setFormLat] = useState<number | ''>('');
  const [formLng, setFormLng] = useState<number | ''>('');
  
  const [formPriceMin, setFormPriceMin] = useState<number | ''>('');
  const [formPriceMax, setFormPriceMax] = useState<number | ''>('');
  const [formPricePerSqmMin, setFormPricePerSqmMin] = useState<number | ''>('');
  const [formPricePerSqmMax, setFormPricePerSqmMax] = useState<number | ''>('');
  const [formPriceText, setFormPriceText] = useState('');
  const [formAreaMin, setFormAreaMin] = useState<number | ''>('');
  const [formAreaMax, setFormAreaMax] = useState<number | ''>('');
  const [formAreaText, setFormAreaText] = useState('');
  const [formAreaSize, setFormAreaSize] = useState('');
  
  const [formLegalStatus, setFormLegalStatus] = useState('');
  const [formOwnershipType, setFormOwnershipType] = useState('');
  const [formConstructionDensity, setFormConstructionDensity] = useState('');
  const [formTotalArea, setFormTotalArea] = useState('');
  const [formTotalUnits, setFormTotalUnits] = useState<number | ''>('');
  const [formTotalBlocks, setFormTotalBlocks] = useState<number | ''>('');
  const [formTotalFloors, setFormTotalFloors] = useState<number | ''>('');
  
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAmenities, setFormAmenities] = useState<string>('');
  const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);
  const [formHighlightPoints, setFormHighlightPoints] = useState<string>('');
  const [formNearbyPlaces, setFormNearbyPlaces] = useState<string>('');
  const [formPaymentPolicy, setFormPaymentPolicy] = useState('');
  const [formSalesPolicy, setFormSalesPolicy] = useState('');
  const [formBookingPolicy, setFormBookingPolicy] = useState('');
  
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formBannerImage, setFormBannerImage] = useState('');
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [formDetailGallery, setFormDetailGallery] = useState<string[]>([]);
  const [formBrochureUrl, setFormBrochureUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVirtualTourUrl, setFormVirtualTourUrl] = useState('');
  const [formMapImageUrl, setFormMapImageUrl] = useState('');
  
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');
  const [formHeroSubtitle, setFormHeroSubtitle] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formGalleryLabel, setFormGalleryLabel] = useState('');
  const [formGalleryTitle, setFormGalleryTitle] = useState('');
  const [formGalleryDescription, setFormGalleryDescription] = useState('');
  const [formDetailGalleryLabel, setFormDetailGalleryLabel] = useState('');
  const [formDetailGalleryTitle, setFormDetailGalleryTitle] = useState('');
  const [formDetailGalleryDescription, setFormDetailGalleryDescription] = useState('');
  const [formSectionTitles, setFormSectionTitles] = useState<ProjectSectionTitles>(defaultProjectSectionTitles);
  const [formSchemaPrice, setFormSchemaPrice] = useState('');
  const [formSchemaPriceCurrency, setFormSchemaPriceCurrency] = useState('VND');
  const [formSchemaAvailability, setFormSchemaAvailability] = useState('');
  const [formQuickCards, setFormQuickCards] = useState<IconValueItem[]>([]);
  const [formProjectFacts, setFormProjectFacts] = useState<IconValueItem[]>([]);
  const [formProjectStats, setFormProjectStats] = useState<StatItem[]>([]);
  const [formConnectivity, setFormConnectivity] = useState<ConnectivityItem[]>([]);
  const [formAmenityDetails, setFormAmenityDetails] = useState<AmenityItem[]>([]);
  const [formInvestmentReasons, setFormInvestmentReasons] = useState<ReasonItem[]>([]);
  const [formProjectTestimonials, setFormProjectTestimonials] = useState<TestimonialItem[]>([]);
  const [formProjectFaqs, setFormProjectFaqs] = useState<FaqItem[]>([]);
  const [formFloorPlanGroups, setFormFloorPlanGroups] = useState<FloorPlanGroup[]>([]);
  const [formHandoverStandards, setFormHandoverStandards] = useState<HandoverStandardItem[]>([]);
  const [formPriceRows, setFormPriceRows] = useState<PriceRowItem[]>([]);
  const [formPolicyCards, setFormPolicyCards] = useState<PolicyItem[]>([]);
  const [formProjectTimeline, setFormProjectTimeline] = useState<TimelineItem[]>([]);

  const slugifyProjectName = (value: string) => value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const fieldLabelMap: Record<string, string> = {
    name: 'Tên dự án',
    slug: 'Đường dẫn tĩnh',
    project_label: 'Nhãn hiển thị trên thẻ dự án',
    description: 'Mô tả ngắn',
    thumbnail: 'Ảnh đại diện',
    banner_image: 'Ảnh Hero',
    project_status: 'Trạng thái dự án',
    seo_title: 'Tiêu đề SEO',
    seo_description: 'Mô tả SEO',
    floor_plans: 'Danh sách mặt bằng',
    handover_standards: 'Tiêu chuẩn bàn giao',
    price_rows: 'Dòng bảng giá',
    gallery: 'Danh sách ảnh không gian sống',
    gallery_label: 'Nhãn section Không gian sống',
    gallery_title: 'Tiêu đề section Không gian sống',
    gallery_description: 'Mô tả section Không gian sống',
    detail_gallery: 'Album ảnh cuối trang chi tiết',
    detail_gallery_label: 'Nhãn album cuối trang',
    detail_gallery_title: 'Tiêu đề album cuối trang',
    detail_gallery_description: 'Mô tả album cuối trang',
    map_image_url: 'Ảnh bản đồ',
    category_ids: 'Loại hình dự án',
  };
  const fieldTabMap: Record<string, ProjectAdminTab> = {
    name: 'overview',
    slug: 'overview',
    project_label: 'overview',
    description: 'overview',
    content: 'overview',
    banner_image: 'media',
    thumbnail: 'media',
    gallery: 'gallery',
    gallery_label: 'gallery',
    gallery_title: 'gallery',
    gallery_description: 'gallery',
    detail_gallery: 'media',
    detail_gallery_label: 'media',
    detail_gallery_title: 'media',
    detail_gallery_description: 'media',
    location: 'location',
    address: 'location',
    map_image_url: 'location',
    connectivity: 'location',
    amenity_details: 'amenities',
    floor_tabs: 'floor',
    floor_plans: 'floor',
    handover_standards: 'handover',
    price_rows: 'pricingPolicy',
    policy_cards: 'pricingPolicy',
    project_timeline: 'timeline',
    investment_reasons: 'investment',
    project_testimonials: 'investment',
    project_faqs: 'faq',
    seo_title: 'seo',
    seo_description: 'seo',
    schema_price: 'seo',
  };
  const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Lỗi khi xử lý yêu cầu.';
  const normalizeApiErrors = (error: unknown) => {
    const maybeError = error as { status?: number; errors?: Record<string, string[]>; message?: string };
    if (maybeError?.errors) {
      const nextErrors = Object.fromEntries(
        Object.entries(maybeError.errors).map(([field, messages]) => [
          field,
          `${fieldLabelMap[field] || field}: ${messages?.[0] || 'Dữ liệu chưa hợp lệ.'}`,
        ])
      );
      return {
        message: 'Chưa thể lưu dự án. Vui lòng kiểm tra lại các trường được đánh dấu.',
        fieldErrors: nextErrors,
      };
    }
    if (maybeError?.status === 401 || maybeError?.status === 403) {
      return {
        message: 'Phiên đăng nhập không còn hợp lệ hoặc bạn không có quyền lưu dự án này.',
        fieldErrors: {},
      };
    }
    return {
      message: getErrorMessage(error) === 'Validation error'
        ? 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.'
        : getErrorMessage(error),
      fieldErrors: {},
    };
  };
  const normalizeArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const asRecords = (value: unknown): Record<string, unknown>[] => normalizeArray(value)
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  const asStrings = (value: unknown): string[] => normalizeArray(value)
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const textValue = (value: unknown) => String(value || '');
  const inferFileType = (url: string): PriceRowItem['file_type'] => {
    const clean = url.split('?')[0].toLowerCase();
    if (/\.(png|jpe?g|webp|gif|avif|svg)$/.test(clean)) return 'image';
    if (/\.pdf$/.test(clean)) return 'pdf';
    if (/\.(xls|xlsx|csv)$/.test(clean)) return 'excel';
    if (/\.(doc|docx)$/.test(clean)) return 'word';
    return 'other';
  };
  const getFileName = (url: string) => decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Tài liệu');
  const isImageUrl = (url?: string | null) => Boolean(url && /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(url));
  const createPriceItem = (kind: PriceRowItem['kind'], url = ''): PriceRowItem => ({
    kind,
    productType: '',
    area: '',
    price: '',
    payment: '',
    status: '',
    note: '',
    title: '',
    description: '',
    image_url: kind === 'image' ? url : '',
    file_url: kind === 'file' ? url : '',
    file_type: kind === 'file' ? inferFileType(url) : 'other',
    file_size: '',
    button_label: kind === 'image' ? 'Xem ảnh lớn' : kind === 'file' ? 'Tải xuống' : '',
    highlight: false,
  });
  const createPolicyItem = (): PolicyItem => ({
    title: '',
    description: '',
    icon: 'CalendarDays',
    image_url: '',
    badge: '',
    bullets: [],
    cta_label: '',
    cta_url: '',
    file_url: '',
  });
  const labelKey = (value: unknown) => textValue(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  const loadIconValueItems = (value: unknown, icon = 'LandPlot'): IconValueItem[] => asRecords(value).map((item) => ({
    label: textValue(item.label),
    value: textValue(item.value),
    icon: textValue(item.icon || icon),
  }));
  const loadHeroQuickCardItems = (value: unknown, ownershipType: unknown): IconValueItem[] => loadIconValueItems(value)
    .map((item) => labelKey(item.label) === 'gia tham khao' && textValue(ownershipType)
      ? { label: 'Sở hữu', value: textValue(ownershipType), icon: 'ClipboardCheck' }
      : item);
  const loadStatItems = (value: unknown): StatItem[] => asRecords(value).map((item) => ({
    value: textValue(item.value),
    label: textValue(item.label),
  }));
  const loadConnectivityItems = (value: unknown): ConnectivityItem[] => asRecords(value).map((item) => ({
    time: textValue(item.time),
    label: textValue(item.label),
  }));
  const loadAmenityItems = (value: unknown): AmenityItem[] => asRecords(value).map((item) => ({
    title: textValue(item.title),
    description: textValue(item.description),
    image: textValue(item.image),
    icon: textValue(item.icon || 'Sparkles'),
  }));
  const loadHandoverStandardItems = (value: unknown): HandoverStandardItem[] => asRecords(value).map((item) => ({
    title: textValue(item.title || item.name),
    description: textValue(item.description || item.note),
    image: textValue(item.image || item.image_url || item.thumbnail),
    icon: textValue(item.icon || 'ClipboardCheck'),
  }));
  const loadReasonItems = (value: unknown): ReasonItem[] => asRecords(value).map((item) => ({
    title: textValue(item.title),
    description: textValue(item.description),
    icon: textValue(item.icon || 'TrendingUp'),
  }));
  const loadTestimonialItems = (value: unknown): TestimonialItem[] => asRecords(value).map((item) => ({
    name: textValue(item.name),
    role: textValue(item.role),
    content: textValue(item.content),
    avatar: textValue(item.avatar),
  }));
  const loadFaqItems = (value: unknown): FaqItem[] => asRecords(value).map((item) => ({
    question: textValue(item.question),
    answer: textValue(item.answer),
  }));
  const loadPriceRowItems = (value: unknown): PriceRowItem[] => normalizeArray(value)
    .map((row) => {
      if (Array.isArray(row)) {
        return { ...createPriceItem('row'), productType: textValue(row[0]), area: textValue(row[1]), price: textValue(row[2]) };
      }
      if (!row || typeof row !== 'object') return null;
      const item = row as Record<string, unknown>;
      const kind = textValue(item.kind || 'row') as PriceRowItem['kind'];
      if (kind === 'image') {
        return {
          ...createPriceItem('image', textValue(item.image_url || item.imageUrl || item.image || item.url)),
          title: textValue(item.title),
          description: textValue(item.description),
          button_label: textValue(item.button_label || item.buttonLabel || 'Xem ảnh lớn'),
        };
      }
      if (kind === 'file') {
        const fileUrl = textValue(item.file_url || item.fileUrl || item.url);
        return {
          ...createPriceItem('file', fileUrl),
          title: textValue(item.title),
          description: textValue(item.description),
          file_type: (textValue(item.file_type || item.fileType) as PriceRowItem['file_type']) || inferFileType(fileUrl),
          file_size: textValue(item.file_size || item.fileSize),
          button_label: textValue(item.button_label || item.buttonLabel || 'Tải xuống'),
        };
      }
      if (kind === 'note') {
        return {
          ...createPriceItem('note'),
          title: textValue(item.title),
          description: textValue(item.description || item.note),
          highlight: Boolean(item.highlight),
        };
      }
      return {
        ...createPriceItem('row'),
        productType: textValue(item.productType || item.product_type || item.type || item.name || item.title),
        area: textValue(item.area || item.area_text || item.size),
        price: textValue(item.price || item.price_text),
        payment: textValue(item.payment),
        status: textValue(item.status),
        note: textValue(item.note),
        description: textValue(item.description),
      };
    })
    .filter((item): item is PriceRowItem => Boolean(item && (
      item.productType || item.area || item.price || item.payment || item.status || item.note || item.title || item.description || item.image_url || item.file_url
    )));
  const loadPolicyItems = (value: unknown): PolicyItem[] => asRecords(value).map((item) => ({
    ...createPolicyItem(),
    title: textValue(item.title || item.name),
    description: textValue(item.description || item.desc),
    icon: textValue(item.icon || 'CalendarDays'),
    image_url: textValue(item.image_url || item.imageUrl || item.image || item.thumbnail),
    badge: textValue(item.badge),
    bullets: Array.isArray(item.bullets) ? item.bullets.map(textValue).filter(Boolean) : textValue(item.bullets).split('\n').map((line) => line.trim()).filter(Boolean),
    cta_label: textValue(item.cta_label || item.ctaLabel),
    cta_url: textValue(item.cta_url || item.ctaUrl),
    file_url: textValue(item.file_url || item.fileUrl),
  }));
  const loadTimelineItems = (value: unknown): TimelineItem[] => asRecords(value).map((item) => ({
    date: textValue(item.date),
    title: textValue(item.title),
  }));
  const cleanArray = <T,>(items: T[], isFilled: (item: T) => boolean) => items.filter(isFilled);

  const isProjectSaveDebugEnabled = () => {
    if (process.env.NODE_ENV !== 'production') return true;
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('mh_project_save_debug') === '1';
  };

  const debugProjectSave = (label: string, value: unknown) => {
    if (isProjectSaveDebugEnabled()) {
      console.log(label, value);
    }
  };

  // Queries
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['admin-projects', search, categoryFilter, statusFilter, page],
    queryFn: async () => {
      let url = `/admin/projects?q=${encodeURIComponent(search)}&page=${page}&per_page=10`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (statusFilter) url += `&project_status=${encodeURIComponent(statusFilter)}`;
      const response = await api.get<Project[]>(url);
      return response;
    },
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['admin-project-categories'],
    queryFn: async () => {
      const response = await api.get<ProjectCategory[]>('/admin/project-categories');
      return response.data;
    },
  });

  const { data: developersData } = useQuery({
    queryKey: ['admin-developers-select'],
    queryFn: async () => {
      const response = await api.get<SelectOption[]>('/developers?all=true');
      return response.data || [];
    }
  });

  const { data: locationsData } = useQuery({
    queryKey: ['admin-locations-select'],
    queryFn: async () => {
      const response = await api.get<SelectOption[]>('/locations?all=true');
      return response.data || [];
    }
  });

  const developersSelect = Array.isArray(developersData) ? developersData : [];
  const locationsSelect = Array.isArray(locationsData) ? locationsData : [];
  const selectedLocation = locationsSelect.find((location) => location.id === Number(formLocationId));
  const normalizedLocationSearch = formLocationSearch.trim().toLocaleLowerCase('vi');
  const filteredLocationOptions = locationsSelect.filter((location) => {
    if (location.id === Number(formLocationId)) return true;
    if (!normalizedLocationSearch) return true;
    return [location.name, location.province, location.district, location.region?.name]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase('vi').includes(normalizedLocationSearch));
  });

  // Helper to slugify
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    setFormName(nameVal);
    if (!editingProject) {
      setFormSlug(slugifyProjectName(nameVal));
    }
  };

  // Open Form for Create
  const handleCreateOpen = () => {
    setEditingProject(null);
    setActiveTab('overview');
    setFormError('');
    setFieldErrors({});
    setLastSavedAt('');
    
    // Reset fields
    setFormName('');
    setFormSlug('');
    setFormCode('');
    setFormProjectLabel('');
    setFormDeveloperId('');
    setFormLocationId('');
    setFormLocationSearch('');
    setFormProjectStatus('coming_soon');
    setFormOpenSaleAt('');
    setFormIsFeatured(false);
    setFormIsHot(false);
    setFormIsPublished(false);
    setFormSortOrder(0);
    setFormDeveloper('Masterise Homes');
    setFormScale('');
    setFormHandoverYear('');
    setFormHandoverTime('');
    setFormLocation('');
    setFormLocationDescription('');
    setFormAddress('');
    setFormProvince('');
    setFormDistrict('');
    setFormWard('');
    setFormLat('');
    setFormLng('');
    setFormPriceMin('');
    setFormPriceMax('');
    setFormPricePerSqmMin('');
    setFormPricePerSqmMax('');
    setFormPriceText('');
    setFormAreaMin('');
    setFormAreaMax('');
    setFormAreaText('');
    setFormAreaSize('');
    setFormLegalStatus('');
    setFormOwnershipType('');
    setFormConstructionDensity('');
    setFormTotalArea('');
    setFormTotalUnits('');
    setFormTotalBlocks('');
    setFormTotalFloors('');
    setFormDescription('');
    setFormContent('');
    setFormAmenities('');
    setFormCategoryIds([]);
    setFormHighlightPoints('');
    setFormNearbyPlaces('');
    setFormPaymentPolicy('');
    setFormSalesPolicy('');
    setFormBookingPolicy('');
    setFormThumbnail('');
    setFormBannerImage('');
    setFormGallery([]);
    setFormDetailGallery([]);
    setFormBrochureUrl('');
    setFormVideoUrl('');
    setFormVirtualTourUrl('');
    setFormMapImageUrl('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSeoKeywords('');
    setFormHeroSubtitle('');
    setFormBadgeText('');
    setFormGalleryLabel('');
    setFormGalleryTitle('');
    setFormGalleryDescription('');
    setFormDetailGalleryLabel('');
    setFormDetailGalleryTitle('');
    setFormDetailGalleryDescription('');
    setFormSectionTitles(defaultProjectSectionTitles);
    setFormSchemaPrice('');
    setFormSchemaPriceCurrency('VND');
    setFormSchemaAvailability('');
    setFormQuickCards([]);
    setFormProjectFacts([]);
    setFormProjectStats([]);
    setFormConnectivity([]);
    setFormAmenityDetails([]);
    setFormInvestmentReasons([]);
    setFormProjectTestimonials([]);
    setFormProjectFaqs([]);
    setFormFloorPlanGroups([]);
    setFormHandoverStandards([]);
    setFormPriceRows([]);
    setFormPolicyCards([]);
    setFormProjectTimeline([]);
    
    setIsFormOpen(true);
  };

  const fillProjectForm = (project: Project) => {
    setFormName(project.name);
    setFormSlug(project.slug);
    setFormCode(project.code || '');
    setFormProjectLabel(project.project_label || '');
    setFormDeveloperId(project.developer_id || '');
    setFormLocationId(project.location_id || '');
    setFormLocationSearch('');
    setFormProjectStatus(project.project_status);
    setFormOpenSaleAt(project.open_sale_at ? project.open_sale_at.slice(0, 10) : '');
    setFormIsFeatured(project.is_featured);
    setFormIsHot(project.is_hot || false);
    setFormIsPublished(project.is_published || false);
    setFormSortOrder(project.sort_order || 0);
    setFormDeveloper(project.developer || 'Masterise Homes');
    setFormScale(project.scale || '');
    setFormHandoverYear(project.handover_year || '');
    setFormHandoverTime(project.handover_time || '');
    setFormLocation(project.location || '');
    setFormLocationDescription(project.location_description || '');
    setFormAddress(project.address || '');
    setFormProvince(project.province || '');
    setFormDistrict(project.district || '');
    setFormWard(project.ward || '');
    setFormLat(project.lat || '');
    setFormLng(project.lng || '');
    setFormPriceMin(project.price_min ? Number(project.price_min) / 1_000_000_000 : '');
    setFormPriceMax(project.price_max ? Number(project.price_max) / 1_000_000_000 : '');
    setFormPricePerSqmMin(project.price_per_sqm_min ? Number(project.price_per_sqm_min) / 1_000_000 : '');
    setFormPricePerSqmMax(project.price_per_sqm_max ? Number(project.price_per_sqm_max) / 1_000_000 : '');
    setFormPriceText(project.price_text || '');
    setFormAreaMin(project.area_min ? Number(project.area_min) : '');
    setFormAreaMax(project.area_max ? Number(project.area_max) : '');
    setFormAreaText(project.area_text || '');
    setFormAreaSize(project.area_size || '');
    setFormLegalStatus(project.legal_status || '');
    setFormOwnershipType(project.ownership_type || '');
    setFormConstructionDensity(project.construction_density || '');
    setFormTotalArea(project.total_area || '');
    setFormTotalUnits(project.total_units || '');
    setFormTotalBlocks(project.total_blocks || '');
    setFormTotalFloors(project.total_floors || '');
    setFormDescription(project.description || '');
    setFormContent(project.content || '');
    setFormAmenities(asStrings(project.amenities).join(', '));
    setFormCategoryIds(project.categories ? project.categories.map(c => c.id) : []);
    setFormHighlightPoints(asStrings(project.highlight_points).join('\n'));
    setFormNearbyPlaces(asStrings(project.nearby_places).join('\n'));
    setFormPaymentPolicy(project.payment_policy || '');
    setFormSalesPolicy(project.sales_policy || '');
    setFormBookingPolicy(project.booking_policy || '');
    setFormThumbnail(project.thumbnail || '');
    setFormBannerImage(project.banner_image || '');
    setFormGallery(asStrings(project.gallery));
    setFormDetailGallery(asStrings(project.detail_gallery));
    setFormBrochureUrl(project.brochure_url || '');
    setFormVideoUrl(project.video_url || '');
    setFormVirtualTourUrl(project.virtual_tour_url || '');
    setFormMapImageUrl(project.map_image_url || '');
    setFormSeoTitle(project.seo_meta?.title || '');
    setFormSeoDescription(project.seo_meta?.description || '');
    setFormSeoKeywords(project.seo_meta?.keywords || '');
    setFormHeroSubtitle(project.hero_subtitle || '');
    setFormBadgeText(project.badge_text || '');
    setFormGalleryLabel(project.gallery_label || '');
    setFormGalleryTitle(project.gallery_title || '');
    setFormGalleryDescription(project.gallery_description || '');
    setFormDetailGalleryLabel(project.detail_gallery_label || '');
    setFormDetailGalleryTitle(project.detail_gallery_title || '');
    setFormDetailGalleryDescription(project.detail_gallery_description || '');
    setFormSectionTitles(normalizeProjectSectionTitles(project.section_titles));
    setFormSchemaPrice(project.schema_price || '');
    setFormSchemaPriceCurrency(project.schema_price_currency || 'VND');
    setFormSchemaAvailability(project.schema_availability || '');
    setFormQuickCards(loadHeroQuickCardItems(project.quick_cards, project.ownership_type));
    setFormProjectFacts(loadIconValueItems(project.project_facts, 'MapPin'));
    setFormProjectStats(loadStatItems(project.project_stats));
    setFormConnectivity(loadConnectivityItems(project.connectivity));
    setFormAmenityDetails(loadAmenityItems(project.amenity_details));
    setFormInvestmentReasons(loadReasonItems(project.investment_reasons));
    setFormProjectTestimonials(loadTestimonialItems(project.project_testimonials));
    setFormProjectFaqs(loadFaqItems(project.project_faqs));
    setFormFloorPlanGroups(normalizeFloorPlanGroups(project.floor_plan_groups, project.floor_tabs, project.floor_plans));
    setFormHandoverStandards(loadHandoverStandardItems(project.handover_standards));
    setFormPriceRows(loadPriceRowItems(project.price_rows));
    setFormPolicyCards(loadPolicyItems(project.policy_cards));
    setFormProjectTimeline(loadTimelineItems(project.project_timeline));
  };

  // Open Form for Edit
  const handleEditOpen = async (listProject: Project) => {
    setEditLoadingProjectId(listProject.id);
    try {
      const response = await api.get<Project>(`/admin/projects/${listProject.id}`);
      const project = response.data || listProject;
      debugProjectSave('[PROJECT_ADMIN_DETAIL_BEFORE_EDIT]', response);
      setEditingProject(project);
      setActiveTab('overview');
      setFormError('');
      setFieldErrors({});
      setLastSavedAt('');
      fillProjectForm(project);
      setIsFormOpen(true);
    } catch (error) {
      toast.error('Chưa tải được dữ liệu mới nhất từ API Admin. Hãy deploy backend và clear route cache cho /admin/projects/{id}.');
      console.error('Unable to fetch admin project detail before edit:', error);
    } finally {
      setEditLoadingProjectId(null);
    }
  };

  // Create or Update Project Mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (mode: ProjectSaveMode) => {
      const amenitiesArr = formAmenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      
      const highlightsArr = formHighlightPoints
        .split('\n')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      const nearbyArr = formNearbyPlaces
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      const quickCards = cleanArray(formQuickCards, item => Boolean(item.label || item.value));
      const projectFacts = cleanArray(formProjectFacts, item => Boolean(item.label || item.value));
      const projectStats = cleanArray(formProjectStats, item => Boolean(item.value || item.label));
      const connectivity = cleanArray(formConnectivity, item => Boolean(item.time || item.label));
      const amenityDetails = cleanArray(formAmenityDetails, item => Boolean(item.title || item.description || item.image));
      const investmentReasons = cleanArray(formInvestmentReasons, item => Boolean(item.title || item.description));
      const projectTestimonials = cleanArray(formProjectTestimonials, item => Boolean(item.name || item.content));
      const projectFaqs = cleanArray(formProjectFaqs, item => Boolean(item.question || item.answer));
      const floorPlanGroups = formFloorPlanGroups
        .filter(group => group.label.trim())
        .map(group => ({
          ...group,
          label: group.label.trim(),
          tabs: group.tabs
            .filter(tab => tab.label.trim())
            .map(tab => ({
              ...tab,
              label: tab.label.trim(),
              items: tab.items
                .filter(item => Boolean(item.name.trim() || item.area.trim() || item.images.length))
                .map(item => ({ ...item, images: uniqueFloorPlanImages(item.images) })),
            })),
        }));
      const handoverStandards = cleanArray(formHandoverStandards, item => Boolean(item.title || item.description || item.image));
      const priceRows = cleanArray(formPriceRows, item => Boolean(
        item.productType || item.area || item.price || item.payment || item.status || item.note || item.title || item.description || item.image_url || item.file_url
      )).map(item => ({
        kind: item.kind,
        product_type: item.productType,
        area: item.area,
        price: item.price,
        payment: item.payment,
        status: item.status,
        note: item.note,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        file_url: item.file_url,
        file_type: item.file_type,
        file_size: item.file_size,
        button_label: item.button_label,
        highlight: item.highlight,
      }));
      const policyCards = cleanArray(formPolicyCards, item => Boolean(item.title || item.description || item.image_url || item.file_url || item.bullets.length))
        .map(item => ({
          title: item.title,
          description: item.description,
          icon: item.icon,
          image_url: item.image_url,
          badge: item.badge,
          bullets: item.bullets,
          cta_label: item.cta_label,
          cta_url: item.cta_url,
          file_url: item.file_url,
        }));
      const projectTimeline = cleanArray(formProjectTimeline, item => Boolean(item.date || item.title));
      const gallery = asStrings(formGallery);
      const detailGallery = asStrings(formDetailGallery);
      const slugValue = formSlug.trim() || slugifyProjectName(formName);
      const shouldPublish = mode === 'publish' ? true : mode === 'draft' ? false : formIsPublished;

      const payload = {
        name: formName,
        slug: slugValue,
        code: formCode || null,
        project_label: formProjectLabel || null,
        developer_id: formDeveloperId !== '' ? Number(formDeveloperId) : null,
        location_id: formLocationId !== '' ? Number(formLocationId) : null,
        project_status: formProjectStatus,
        open_sale_at: formOpenSaleAt || null,
        is_featured: formIsFeatured,
        is_hot: formIsHot,
        is_published: shouldPublish ? true : false,
        sort_order: Number(formSortOrder),
        developer: formDeveloper,
        scale: formScale,
        handover_year: formHandoverYear !== '' ? Number(formHandoverYear) : null,
        handover_time: formHandoverTime || null,
        
        location: formLocation,
        location_description: formLocationDescription || null,
        address: formAddress || null,
        province: formProvince || null,
        district: formDistrict || null,
        ward: formWard || null,
        lat: formLat !== '' ? Number(formLat) : null,
        lng: formLng !== '' ? Number(formLng) : null,
        
        price_min: formPriceMin !== '' ? Number(formPriceMin) * 1_000_000_000 : null,
        price_max: formPriceMax !== '' ? Number(formPriceMax) * 1_000_000_000 : null,
        price_per_sqm_min: formPricePerSqmMin !== '' ? Number(formPricePerSqmMin) * 1_000_000 : null,
        price_per_sqm_max: formPricePerSqmMax !== '' ? Number(formPricePerSqmMax) * 1_000_000 : null,
        price_text: formPriceText,
        area_min: formAreaMin !== '' ? Number(formAreaMin) : null,
        area_max: formAreaMax !== '' ? Number(formAreaMax) : null,
        area_text: formAreaText || null,
        area_size: formAreaSize,
        
        legal_status: formLegalStatus || null,
        ownership_type: formOwnershipType || null,
        construction_density: formConstructionDensity || null,
        total_area: formTotalArea || null,
        total_units: formTotalUnits !== '' ? Number(formTotalUnits) : null,
        total_blocks: formTotalBlocks !== '' ? Number(formTotalBlocks) : null,
        total_floors: formTotalFloors !== '' ? Number(formTotalFloors) : null,
        
        description: formDescription,
        content: formContent,
        hero_subtitle: formHeroSubtitle || null,
        badge_text: formBadgeText || null,
        amenities: amenitiesArr,
        quick_cards: quickCards,
        project_facts: projectFacts,
        project_stats: projectStats,
        connectivity,
        amenity_details: amenityDetails,
        investment_reasons: investmentReasons,
        project_testimonials: projectTestimonials,
        project_faqs: projectFaqs,
        floor_plan_groups: floorPlanGroups,
        handover_standards: handoverStandards,
        price_rows: priceRows,
        policy_cards: policyCards,
        project_timeline: projectTimeline,
        category_ids: formCategoryIds,
        highlight_points: highlightsArr,
        nearby_places: nearbyArr,
        payment_policy: formPaymentPolicy || null,
        sales_policy: formSalesPolicy || null,
        booking_policy: formBookingPolicy || null,
        
        thumbnail: formThumbnail,
        banner_image: formBannerImage || null,
        gallery,
        gallery_label: formGalleryLabel || null,
        gallery_title: formGalleryTitle || null,
        gallery_description: formGalleryDescription || null,
        detail_gallery: detailGallery,
        detail_gallery_label: formDetailGalleryLabel || null,
        detail_gallery_title: formDetailGalleryTitle || null,
        detail_gallery_description: formDetailGalleryDescription || null,
        section_titles: formSectionTitles,
        brochure_url: formBrochureUrl,
        video_url: formVideoUrl || null,
        virtual_tour_url: formVirtualTourUrl || null,
        map_image_url: formMapImageUrl || null,
        
        seo_title: formSeoTitle || formName,
        seo_description: formSeoDescription || formDescription,
        seo_keywords: formSeoKeywords,
        schema_price: formSchemaPrice || null,
        schema_price_currency: formSchemaPriceCurrency || 'VND',
        schema_availability: formSchemaAvailability || null,
      };

      debugProjectSave('[PROJECT_SAVE_PAYLOAD]', payload);
      debugProjectSave('[GALLERY_IN_PAYLOAD]', payload.gallery);
      debugProjectSave('[LIVING_SECTION_PAYLOAD]', {
        gallery_label: payload.gallery_label,
        gallery_title: payload.gallery_title,
        gallery_description: payload.gallery_description,
      });

      if (editingProject) {
        return api.put<Project>(`/projects/${editingProject.id}`, payload);
      }

      return api.post<Project>('/projects', payload);
    },
    onSuccess: async (response, mode) => {
      debugProjectSave('[PROJECT_SAVE_RESPONSE]', response);
      const savedProject = response.data;
      let freshProject = savedProject;

      if (savedProject?.id) {
        const freshResponse = await api.get<Project>(`/admin/projects/${savedProject.id}`);
        debugProjectSave('[PROJECT_FRESH_DETAIL_AFTER_SAVE]', freshResponse);
        freshProject = freshResponse.data || savedProject;

        queryClient.setQueriesData({ queryKey: ['admin-projects'] }, (oldData: unknown) => {
          const current = oldData as { data?: Project[] } | undefined;
          if (!current?.data) return oldData;
          const exists = current.data.some(project => project.id === freshProject.id);
          return {
            ...current,
            data: exists
              ? current.data.map(project => project.id === freshProject.id ? { ...project, ...freshProject } : project)
              : [freshProject, ...current.data],
          };
        });

        setEditingProject(freshProject);
        fillProjectForm(freshProject);
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      await queryClient.refetchQueries({ queryKey: ['admin-projects'], type: 'active' });
      setFormError('');
      setFieldErrors({});
      setLastSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      if (mode === 'preview') {
        const slugValue = freshProject?.slug || formSlug.trim() || slugifyProjectName(formName);
        window.open(`/admin/du-an/xem-truoc/${slugValue}`, '_blank', 'noopener,noreferrer');
      } else {
        toast.success(mode === 'publish'
          ? 'Đã xuất bản dự án thành công. Dữ liệu mới đã được tải lại từ máy chủ.'
          : mode === 'draft' ? 'Đã lưu nháp dự án thành công. Dữ liệu mới đã được tải lại từ máy chủ.' : 'Đã lưu thay đổi thành công. Dữ liệu mới đã được tải lại từ máy chủ.'
        );
      }
    },
    onError: (err: unknown) => {
      const normalized = normalizeApiErrors(err);
      setFormError(normalized.message);
      setFieldErrors(normalized.fieldErrors);
      const firstField = Object.keys(normalized.fieldErrors)[0];
      if (firstField) {
        const targetTab = fieldTabMap[firstField] || 'overview';
        setActiveTab(targetTab);
        setActiveChecklistTarget({ tab: targetTab, field: firstField });
        window.setTimeout(() => {
          document.querySelector(`[data-project-field="${firstField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
    }
  });

  // Delete Project Mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Đã xóa dự án thành công.');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
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
    if (mediaSelectorTarget && typeof mediaSelectorTarget === 'object') {
      const selectedUrl = Array.isArray(url) ? url[0] : url;
      if (!selectedUrl) return;
      if (mediaSelectorTarget.group === 'amenityDetails') {
        setFormAmenityDetails(items => items.map((item, index) =>
          index === mediaSelectorTarget.index ? { ...item, [mediaSelectorTarget.field]: selectedUrl } : item
        ));
      } else if (mediaSelectorTarget.group === 'handoverStandards') {
        setFormHandoverStandards(items => items.map((item, index) =>
          index === mediaSelectorTarget.index ? { ...item, [mediaSelectorTarget.field]: selectedUrl } : item
        ));
      } else if (mediaSelectorTarget.group === 'projectTestimonials') {
        setFormProjectTestimonials(items => items.map((item, index) =>
          index === mediaSelectorTarget.index ? { ...item, [mediaSelectorTarget.field]: selectedUrl } : item
        ));
      } else if (mediaSelectorTarget.group === 'floorPlanGroups') {
        const selectedImages = uniqueFloorPlanImages(Array.isArray(url) ? url : [url]);
        setFormFloorPlanGroups(groups => groups.map((group, groupIndex) =>
          groupIndex !== mediaSelectorTarget.groupIndex ? group : {
            ...group,
            tabs: group.tabs.map((tab, tabIndex) =>
              tabIndex !== mediaSelectorTarget.tabIndex ? tab : {
                ...tab,
                items: tab.items.map((item, itemIndex) =>
                  itemIndex === mediaSelectorTarget.itemIndex && selectedImages.length
                    ? { ...item, images: selectedImages }
                    : item
                ),
              }
            ),
          }
        ));
      } else if (mediaSelectorTarget.group === 'priceRows') {
        setFormPriceRows(items => items.map((item, index) =>
          index === mediaSelectorTarget.index
            ? {
                ...item,
                [mediaSelectorTarget.field]: selectedUrl,
                ...(mediaSelectorTarget.field === 'file_url' ? { file_type: inferFileType(selectedUrl) } : {}),
              }
            : item
        ));
      } else if (mediaSelectorTarget.group === 'policyCards') {
        setFormPolicyCards(items => items.map((item, index) =>
          index === mediaSelectorTarget.index ? { ...item, [mediaSelectorTarget.field]: selectedUrl } : item
        ));
      }
      setMediaSelectorTarget(null);
      return;
    }
    if (mediaSelectorTarget === 'thumbnail') {
      setFormThumbnail(url as string);
    } else if (mediaSelectorTarget === 'banner') {
      setFormBannerImage(url as string);
    } else if (mediaSelectorTarget === 'brochure') {
      setFormBrochureUrl(url as string);
    } else if (mediaSelectorTarget === 'map') {
      setFormMapImageUrl(url as string);
    } else if (mediaSelectorTarget === 'gallery') {
      const selectedArr = Array.isArray(url) ? url : [url];
      setFormGallery(asStrings(selectedArr));
      setActiveChecklistTarget({ tab: 'gallery', field: selectedArr.length ? undefined : 'gallery' });
    } else if (mediaSelectorTarget === 'detailGallery') {
      const selectedArr = Array.isArray(url) ? url : [url];
      setFormDetailGallery(asStrings(selectedArr));
    }
    setMediaSelectorTarget(null);
  };

  // Project Category CRUD Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      return api.post('/project-categories', { name, slug: slug || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-project-categories'] });
      setNewCategoryName('');
      setNewCategorySlug('');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, slug }: { id: number; name: string; slug: string }) => {
      return api.put(`/project-categories/${id}`, { name, slug: slug || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setEditingCategoryId(null);
      setEditingCategoryName('');
      setEditingCategorySlug('');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/project-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    }
  });

  const projects = projectsData?.data || [];
  const meta = projectsData?.meta;
  const categories = categoriesData || [];

  const inputClass = 'w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746]';
  const repeaterCardClass = 'rounded-xl border border-[#E8DCCB] bg-[#FBF8F2]/60 p-3 space-y-3';
  const removeButtonClass = 'px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 rounded-lg';
  const addButtonClass = 'px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors';

  const updateListItem = <T,>(items: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, patch: Partial<T>) => {
    setter(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const removeListItem = <T,>(items: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
      setter(items.filter((_, itemIndex) => itemIndex !== index));
    }
  };

  const moveListItem = <T,>(items: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
    setter(nextItems);
  };

  const createEmptyFloorPlan = (): FloorPlanItem => ({
    key: createFloorPlanKey('item'),
    productType: '',
    name: '',
    area: '',
    totalArea: '',
    description: '',
    price: '',
    bedrooms: '',
    status: '',
    images: [],
  });

  const createEmptyFloorTab = (): FloorPlanTab => ({
    key: createFloorPlanKey('tab'),
    label: 'Sản phẩm',
    items: [],
  });

  const createEmptyFloorGroup = (): FloorPlanGroup => ({
    key: createFloorPlanKey('group'),
    label: 'Mặt bằng',
    tabs: [createEmptyFloorTab()],
  });

  const updateFloorGroup = (groupIndex: number, updater: (group: FloorPlanGroup) => FloorPlanGroup) => {
    setFormFloorPlanGroups(groups => groups.map((group, index) => index === groupIndex ? updater(group) : group));
  };

  const updateFloorTab = (groupIndex: number, tabIndex: number, updater: (tab: FloorPlanTab) => FloorPlanTab) => {
    updateFloorGroup(groupIndex, group => ({
      ...group,
      tabs: group.tabs.map((tab, index) => index === tabIndex ? updater(tab) : tab),
    }));
  };

  const updateFloorItem = (groupIndex: number, tabIndex: number, itemIndex: number, patch: Partial<FloorPlanItem>) => {
    updateFloorTab(groupIndex, tabIndex, tab => ({
      ...tab,
      items: tab.items.map((item, index) => index === itemIndex ? { ...item, ...patch } : item),
    }));
  };

  const moveNestedItem = <T,>(items: T[], index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return items;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    return next;
  };

  const sectionNote = (text: string) => (
    <p className="rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-4 py-3 text-xs leading-5 text-[#8C7A6B]">
      {text}
    </p>
  );

  const buildChecklistItem = (
    key: ProjectAdminTab,
    label: string,
    missingFields: (string | null)[],
    optional = false,
    targetField?: string
  ): SectionChecklistItem => {
    const missing = missingFields.filter(Boolean) as string[];
    return {
      key,
      label,
      status: missing.length ? (optional ? 'optional' : 'missing') : 'complete',
      missingFields: missing,
      targetTab: key,
      targetField: missing.length ? targetField : undefined,
    };
  };

  const completionItems: SectionChecklistItem[] = [
    buildChecklistItem('overview', 'Tổng quan', [
      !formName.trim() ? 'Tên dự án' : null,
      !(formSlug.trim() || slugifyProjectName(formName)) ? 'Đường dẫn tĩnh' : null,
      !formDescription.trim() ? 'Mô tả ngắn' : null,
    ], false, !formName.trim() ? 'name' : !formDescription.trim() ? 'description' : 'slug'),
    buildChecklistItem('hero', 'Hero & Thông tin nhanh', [
      !formBannerImage ? 'Ảnh Hero' : null,
      !(formHeroSubtitle.trim() || formDescription.trim()) ? 'Dòng mô tả dưới tên dự án' : null,
      !formQuickCards.length ? 'Thông tin nhanh trong hộp Hero' : null,
      !formProjectFacts.length ? 'Thông tin tổng quan dưới Hero' : null,
    ], false, !formBannerImage ? 'banner_image' : 'quick_cards'),
    buildChecklistItem('gallery', 'Không gian sống', [
      !formGalleryLabel.trim() ? 'Nhãn section' : null,
      !formGalleryTitle.trim() ? 'Tiêu đề section' : null,
      !formGalleryDescription.trim() ? 'Mô tả section' : null,
      !formGallery.length ? 'Danh sách ảnh không gian sống' : null,
    ], false, !formGallery.length ? 'gallery' : !formGalleryTitle.trim() ? 'gallery_title' : 'gallery_label'),
    buildChecklistItem('location', 'Vị trí & Kết nối', [
      !(formLocation.trim() || formAddress.trim()) ? 'Địa chỉ/vị trí dự án' : null,
      !(formConnectivity.length || formMapImageUrl) ? 'Danh sách kết nối hoặc ảnh bản đồ' : null,
    ], false, !(formLocation.trim() || formAddress.trim()) ? 'location' : 'connectivity'),
    buildChecklistItem('amenities', 'Tiện ích nổi bật', [
      !formAmenityDetails.length ? 'Danh sách tiện ích nổi bật' : null,
    ], false, 'amenity_details'),
    buildChecklistItem('floor', 'Sản phẩm & Mặt bằng', [
      !formFloorPlanGroups.length ? 'Nhóm mặt bằng' : null,
      !formFloorPlanGroups.some(group => group.tabs.some(tab => tab.items.length)) ? 'Danh sách mặt bằng' : null,
    ], false, 'floor_plans'),
    buildChecklistItem('handover', 'Tiêu chuẩn bàn giao', [
      !formHandoverStandards.length ? 'Danh sách tiêu chuẩn bàn giao' : null,
    ], true, 'handover_standards'),
    buildChecklistItem('pricingPolicy', 'Bảng giá & Chính sách', [
      !(formPriceRows.length || formPolicyCards.length || formPriceText.trim()) ? 'Bảng giá hoặc chính sách bán hàng' : null,
    ], false, 'price_rows'),
    buildChecklistItem('timeline', 'Tiến độ thi công', [
      !formProjectTimeline.length ? 'Tiến độ thi công' : null,
    ], true, 'project_timeline'),
    buildChecklistItem('investment', 'Đầu tư & Đánh giá', [
      !(formInvestmentReasons.length || formProjectTestimonials.length) ? 'Lý do đầu tư hoặc đánh giá khách hàng' : null,
    ], true, 'investment_reasons'),
    buildChecklistItem('faq', 'Câu hỏi thường gặp', [
      !formProjectFaqs.length ? 'Danh sách câu hỏi thường gặp' : null,
    ], true, 'project_faqs'),
    buildChecklistItem('media', 'Ảnh, Video & Tài liệu', [
      !formThumbnail ? 'Ảnh đại diện' : null,
      !formBannerImage ? 'Ảnh Hero' : null,
      !formMapImageUrl ? 'Ảnh bản đồ' : null,
    ], false, !formThumbnail ? 'thumbnail' : !formBannerImage ? 'banner_image' : 'map_image_url'),
    buildChecklistItem('seo', 'SEO & Schema', [
      !formSeoTitle.trim() ? 'Tiêu đề SEO' : null,
      !formSeoDescription.trim() ? 'Mô tả SEO' : null,
    ], false, !formSeoTitle.trim() ? 'seo_title' : 'seo_description'),
    buildChecklistItem('vr360', 'VR 360', [
      !formVirtualTourUrl ? 'Đường dẫn VR 360' : null,
    ], true, 'virtual_tour_url'),
  ];
  const activeChecklistItem = completionItems.find(item => item.key === activeTab);
  const isFieldMissing = (field: string) =>
    activeChecklistTarget?.tab === activeTab && activeChecklistTarget.field === field && activeChecklistItem?.targetField === field;
  const highlightClass = (field: string) => isFieldMissing(field) ? ' ring-2 ring-amber-400 border-amber-400 bg-amber-50' : '';
  const checklistStatusLabel: Record<ChecklistStatus, string> = {
    complete: 'Đã đủ dữ liệu',
    missing: 'Còn thiếu dữ liệu',
    optional: 'Không bắt buộc',
    error: 'Có lỗi cần sửa',
  };
  const checklistStatusClass: Record<ChecklistStatus, string> = {
    complete: 'bg-emerald-50 text-emerald-700',
    missing: 'bg-amber-50 text-amber-700',
    optional: 'bg-gray-100 text-gray-600',
    error: 'bg-red-50 text-red-700',
  };
  const handleChecklistClick = (item: SectionChecklistItem) => {
    setActiveTab(item.targetTab);
    setActiveChecklistTarget({ tab: item.targetTab, field: item.targetField });
    window.setTimeout(() => {
      const target = item.targetField
        ? document.querySelector(`[data-project-field="${item.targetField}"]`)
        : document.querySelector(`[data-project-tab="${item.targetTab}"]`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const renderCompletionChecklist = () => (
    <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#1F1B16]">Checklist dữ liệu trước khi xuất bản</h4>
          <p className="mt-0.5 text-[11px] text-[#8C7A6B]">Mỗi mục tương ứng với một section ngoài trang chi tiết dự án.</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {completionItems.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => handleChecklistClick(item)}
            className="rounded-xl border border-[#E8DCCB]/80 bg-[#FBF8F2]/50 px-3 py-2 text-left transition hover:border-[#B88746] hover:bg-white"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#1F1B16]">{item.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${checklistStatusClass[item.status]}`}>
                {checklistStatusLabel[item.status]}
              </span>
            </div>
            {item.missingFields.length ? (
              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#8C7A6B]">
                Thiếu: {item.missingFields.join(', ')}
              </p>
            ) : null}
          </button>
        ))}
      </div>
      {formIsPublished && completionItems.some((item) => item.status === 'missing') ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          Dự án còn thiếu một số thông tin quan trọng. Hãy bổ sung trước khi xuất bản để trang chi tiết hiển thị đầy đủ.
        </p>
      ) : null}
    </div>
  );

  const getPublishMissingFields = () => completionItems
    .filter(item => item.status === 'missing')
    .flatMap(item => item.missingFields.map(field => `${item.label}: ${field}`));

  const handleSaveProject = (mode: ProjectSaveMode) => {
    setFormError('');
    setFieldErrors({});

    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên dự án trước khi lưu.');
      setFieldErrors({ name: 'Tên dự án: Vui lòng nhập tên dự án.' });
      setActiveTab('overview');
      return;
    }

    if (!formSlug.trim()) {
      setFormSlug(slugifyProjectName(formName));
    }

    const willBePublished = mode === 'publish' || (mode !== 'draft' && formIsPublished);
    if (willBePublished && (!selectedLocation || !selectedLocation.region)) {
      const message = 'Dự án phải chọn một vị trí đã được gán vùng miền trước khi xuất bản.';
      setFormError(message);
      setFieldErrors({ location_id: message });
      setActiveTab('overview');
      return;
    }

    if (mode === 'publish') {
      const missingFields = getPublishMissingFields();
      if (missingFields.length > 0) {
        const confirmed = window.confirm(
          `Dự án còn thiếu một số thông tin quan trọng:\n\n- ${missingFields.join('\n- ')}\n\nBạn vẫn muốn xuất bản dự án này?`
        );
        if (!confirmed) {
          setFormError(`Dự án còn thiếu thông tin trước khi xuất bản: ${missingFields.join(', ')}.`);
          return;
        }
      }
      setFormIsPublished(true);
    }

    saveProjectMutation.mutate(mode);
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const pathname = new URL(url, window.location.origin).pathname;
      return decodeURIComponent(pathname.split('/').filter(Boolean).pop() || 'Ảnh đã chọn');
    } catch {
      return url.split('/').filter(Boolean).pop() || 'Ảnh đã chọn';
    }
  };

  const getShortUrl = (url: string) => url.length > 64 ? `${url.slice(0, 34)}...${url.slice(-22)}` : url;

  const renderImageListManager = ({
    field,
    title,
    description,
    emptyText,
    images,
    setImages,
    target,
    compact = false,
  }: {
    field: string;
    title: string;
    description: string;
    emptyText: string;
    images: string[];
    setImages: React.Dispatch<React.SetStateAction<string[]>>;
    target: BaseMediaTarget;
    compact?: boolean;
  }) => (
    <div data-project-field={field} className={`space-y-3 rounded-xl border bg-[#FBF8F2]/60 p-4 ${highlightClass(field) || 'border-[#E8DCCB]'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold text-[#1F1B16]">{title}</p>
          <p className="mt-1 text-[11px] text-[#8C7A6B]">
            {images.length ? `Đang chọn ${images.length} ảnh. ${description}` : emptyText}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.length ? (
            <button
              type="button"
              onClick={() => setImages([])}
              className="px-3 py-1.5 border border-red-200 bg-white text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              Bỏ chọn tất cả
            </button>
          ) : null}
          <button type="button" onClick={() => setMediaSelectorTarget(target)} className={addButtonClass}>Thêm ảnh</button>
        </div>
      </div>

      {images.length ? (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {images.map((imgUrl, idx) => (
            <div key={`${imgUrl}-${idx}`} className="overflow-hidden rounded-xl border border-[#E8DCCB] bg-white">
              <div className="aspect-video overflow-hidden bg-[#FBF8F2]">
                <img src={imgUrl} alt={`${title} ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <div>
                  <p className="truncate text-[11px] font-bold text-[#1F1B16]" title={getFileNameFromUrl(imgUrl)}>
                    {idx + 1}. {getFileNameFromUrl(imgUrl)}
                  </p>
                  <p className="mt-0.5 break-all text-[10px] leading-4 text-[#8C7A6B]" title={imgUrl}>
                    {getShortUrl(imgUrl)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => moveListItem(images, setImages, idx, -1)} disabled={idx === 0} className={removeButtonClass}>Đưa lên</button>
                  <button type="button" onClick={() => moveListItem(images, setImages, idx, 1)} disabled={idx === images.length - 1} className={removeButtonClass}>Đưa xuống</button>
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, itemIndex) => itemIndex !== idx))}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-3 w-3" />
                    Xóa ảnh
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );

  const renderGalleryManager = (compact = false) => renderImageListManager({
    field: 'gallery',
    title: 'Ảnh Không gian sống',
    description: 'Thứ tự ảnh bên dưới sẽ dùng cho section Không gian sống phía trên trang chi tiết.',
    emptyText: 'Chưa có ảnh Không gian sống. Bấm "Thêm ảnh" để chọn ảnh từ Media Library.',
    images: formGallery,
    setImages: setFormGallery,
    target: 'gallery',
    compact,
  });

  const renderDetailGalleryManager = (compact = false) => renderImageListManager({
    field: 'detail_gallery',
    title: 'Album ảnh cuối trang chi tiết',
    description: 'Thứ tự ảnh bên dưới chỉ dùng cho album cuối trang chi tiết, không ảnh hưởng section Không gian sống.',
    emptyText: 'Chưa có ảnh album cuối trang. Bấm "Thêm ảnh" để chọn ảnh từ Media Library.',
    images: formDetailGallery,
    setImages: setFormDetailGallery,
    target: 'detailGallery',
    compact,
  });
  const getMediaSelectorSelectedUrls = () => {
    if (mediaSelectorTarget === 'gallery') return formGallery;
    if (mediaSelectorTarget === 'detailGallery') return formDetailGallery;
    if (mediaSelectorTarget === 'thumbnail') return formThumbnail ? [formThumbnail] : [];
    if (mediaSelectorTarget === 'banner') return formBannerImage ? [formBannerImage] : [];
    if (mediaSelectorTarget === 'map') return formMapImageUrl ? [formMapImageUrl] : [];
    if (mediaSelectorTarget === 'brochure') return formBrochureUrl ? [formBrochureUrl] : [];
    if (mediaSelectorTarget && typeof mediaSelectorTarget === 'object') {
      if (mediaSelectorTarget.group === 'amenityDetails') {
        return formAmenityDetails[mediaSelectorTarget.index]?.image ? [formAmenityDetails[mediaSelectorTarget.index].image] : [];
      }
      if (mediaSelectorTarget.group === 'handoverStandards') {
        return formHandoverStandards[mediaSelectorTarget.index]?.image ? [formHandoverStandards[mediaSelectorTarget.index].image] : [];
      }
      if (mediaSelectorTarget.group === 'projectTestimonials') {
        return formProjectTestimonials[mediaSelectorTarget.index]?.avatar ? [formProjectTestimonials[mediaSelectorTarget.index].avatar] : [];
      }
      if (mediaSelectorTarget.group === 'floorPlanGroups') {
        return formFloorPlanGroups[mediaSelectorTarget.groupIndex]
          ?.tabs[mediaSelectorTarget.tabIndex]
          ?.items[mediaSelectorTarget.itemIndex]
          ?.images || [];
      }
      if (mediaSelectorTarget.group === 'priceRows') {
        const item = formPriceRows[mediaSelectorTarget.index];
        const value = mediaSelectorTarget.field === 'image_url' ? item?.image_url : item?.file_url;
        return value ? [value] : [];
      }
      if (mediaSelectorTarget.group === 'policyCards') {
        const item = formPolicyCards[mediaSelectorTarget.index];
        const value = mediaSelectorTarget.field === 'image_url' ? item?.image_url : item?.file_url;
        return value ? [value] : [];
      }
    }
    return [];
  };

  const renderIconValueRepeater = (
    title: string,
    items: IconValueItem[],
    setter: React.Dispatch<React.SetStateAction<IconValueItem[]>>,
    emptyItem: IconValueItem
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#8C7A6B]">{title}</label>
        <button type="button" onClick={() => setter([...items, emptyItem])} className={addButtonClass}>Thêm dòng</button>
      </div>
      {items.length === 0 ? <p className="text-xs text-[#8C7A6B]">Chưa có dữ liệu. Bấm “Thêm dòng” để nhập.</p> : null}
      {items.map((item, index) => (
        <div key={index} className={repeaterCardClass}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-2">
            <input value={item.label} onChange={(e) => updateListItem(items, setter, index, { label: e.target.value })} className={inputClass} placeholder="Tên hiển thị, ví dụ: Quy mô" />
            <input value={item.value} onChange={(e) => updateListItem(items, setter, index, { value: e.target.value })} className={inputClass} placeholder="Giá trị, ví dụ: 3,5 ha" />
            <input value={item.icon} onChange={(e) => updateListItem(items, setter, index, { icon: e.target.value })} className={inputClass} placeholder="Icon" />
            <div className="flex gap-1">
              <button type="button" onClick={() => moveListItem(items, setter, index, -1)} disabled={index === 0} className={removeButtonClass}>Lên</button>
              <button type="button" onClick={() => moveListItem(items, setter, index, 1)} disabled={index === items.length - 1} className={removeButtonClass}>Xuống</button>
              <button type="button" onClick={() => removeListItem(items, setter, index)} className={removeButtonClass}>Xóa</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFloorPlanRepeater = () => (
    <div data-project-field="floor_plans" className={`space-y-3 rounded-xl border bg-[#FBF8F2]/40 p-3 ${highlightClass('floor_plans') || 'border-[#E8DCCB]'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-xs font-semibold text-[#8C7A6B]">Mặt bằng phân cấp</label>
          <p className="mt-0.5 text-[11px] text-[#8C7A6B]">Nhóm cha → tab con → mặt bằng → nhiều ảnh. Đổi tên không làm thay đổi khóa liên kết.</p>
        </div>
        <button type="button" onClick={() => setFormFloorPlanGroups(groups => [...groups, createEmptyFloorGroup()])} className={addButtonClass}>
          Thêm nhóm mặt bằng
        </button>
      </div>

      {!formFloorPlanGroups.length ? <p className="text-xs text-[#8C7A6B]">Chưa có nhóm mặt bằng.</p> : null}
      {formFloorPlanGroups.map((group, groupIndex) => {
        const groupItemCount = group.tabs.reduce((total, tab) => total + tab.items.length, 0);
        return (
          <details key={group.key} open className="rounded-2xl border border-[#D9C7AF] bg-white p-3">
            <summary className="cursor-pointer text-sm font-bold text-[#1F1B16]">
              {group.label || 'Nhóm chưa đặt tên'} · {group.tabs.length} tab · {groupItemCount} mặt bằng
            </summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                <div>
                  <input value={group.label} onChange={(event) => updateFloorGroup(groupIndex, current => ({ ...current, label: event.target.value }))} className={inputClass} placeholder="Tên nhóm, ví dụ: Căn hộ" />
                  <p className="mt-1 text-[10px] text-[#8C7A6B]">Khóa ổn định: {group.key}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => setFormFloorPlanGroups(groups => moveNestedItem(groups, groupIndex, -1))} disabled={groupIndex === 0} className={removeButtonClass}>Lên</button>
                  <button type="button" onClick={() => setFormFloorPlanGroups(groups => moveNestedItem(groups, groupIndex, 1))} disabled={groupIndex === formFloorPlanGroups.length - 1} className={removeButtonClass}>Xuống</button>
                  <button type="button" onClick={() => updateFloorGroup(groupIndex, current => ({ ...current, tabs: [...current.tabs, createEmptyFloorTab()] }))} className={addButtonClass}>Thêm tab</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!groupItemCount || window.confirm(`Xóa nhóm này sẽ xóa ${groupItemCount} mặt bằng. Bạn có chắc chắn?`)) {
                        setFormFloorPlanGroups(groups => groups.filter((_, index) => index !== groupIndex));
                      }
                    }}
                    className={removeButtonClass}
                  >Xóa nhóm</button>
                </div>
              </div>

              {!group.tabs.length ? <p className="text-xs text-[#8C7A6B]">Nhóm này chưa có tab con.</p> : null}
              {group.tabs.map((tab, tabIndex) => (
                <details key={tab.key} open className="ml-0 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2]/60 p-3 md:ml-4">
                  <summary className="cursor-pointer text-xs font-semibold text-[#6F5B49]">
                    {tab.label || 'Tab chưa đặt tên'} · {tab.items.length} mặt bằng
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                      <div>
                        <input value={tab.label} onChange={(event) => updateFloorTab(groupIndex, tabIndex, current => ({ ...current, label: event.target.value }))} className={inputClass} placeholder="Tên tab, ví dụ: 2 phòng ngủ" />
                        <p className="mt-1 text-[10px] text-[#8C7A6B]">Khóa ổn định: {tab.key}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => updateFloorGroup(groupIndex, current => ({ ...current, tabs: moveNestedItem(current.tabs, tabIndex, -1) }))} disabled={tabIndex === 0} className={removeButtonClass}>Lên</button>
                        <button type="button" onClick={() => updateFloorGroup(groupIndex, current => ({ ...current, tabs: moveNestedItem(current.tabs, tabIndex, 1) }))} disabled={tabIndex === group.tabs.length - 1} className={removeButtonClass}>Xuống</button>
                        <button type="button" onClick={() => updateFloorTab(groupIndex, tabIndex, current => ({ ...current, items: [...current.items, createEmptyFloorPlan()] }))} className={addButtonClass}>Thêm mặt bằng</button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!tab.items.length || window.confirm(`Xóa tab này sẽ xóa ${tab.items.length} mặt bằng. Bạn có chắc chắn?`)) {
                              updateFloorGroup(groupIndex, current => ({ ...current, tabs: current.tabs.filter((_, index) => index !== tabIndex) }));
                            }
                          }}
                          className={removeButtonClass}
                        >Xóa tab</button>
                      </div>
                    </div>

                    {!tab.items.length ? <p className="text-xs text-[#8C7A6B]">Tab này chưa có mặt bằng.</p> : null}
                    {tab.items.map((item, itemIndex) => (
                      <div key={item.key} className={`${repeaterCardClass} ml-0 md:ml-4`}>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input value={item.name} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { name: event.target.value })} className={inputClass} placeholder="Tên mặt bằng *" />
                          <input value={item.productType} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { productType: event.target.value })} className={inputClass} placeholder="Loại sản phẩm" />
                          <input value={item.area} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { area: event.target.value })} className={inputClass} placeholder="Diện tích" />
                          <input value={item.totalArea} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { totalArea: event.target.value })} className={inputClass} placeholder="Tổng diện tích sàn" />
                          <input value={item.price} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { price: event.target.value })} className={inputClass} placeholder="Giá" />
                          <input value={item.bedrooms} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { bedrooms: event.target.value })} className={inputClass} placeholder="Phòng ngủ" />
                          <input value={item.status} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { status: event.target.value })} className={inputClass} placeholder="Trạng thái" />
                          <p className="self-center text-[10px] text-[#8C7A6B]">Khóa: {item.key}</p>
                          <textarea value={item.description} onChange={(event) => updateFloorItem(groupIndex, tabIndex, itemIndex, { description: event.target.value })} className={`${inputClass} md:col-span-2`} rows={3} placeholder="Mô tả" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-[#8C7A6B]">{item.images.length ? `${item.images.length} ảnh · ảnh số 1 là thumbnail` : 'Chưa chọn ảnh'}</p>
                            <button type="button" onClick={() => setMediaSelectorTarget({ group: 'floorPlanGroups', groupIndex, tabIndex, itemIndex, field: 'images' })} className={addButtonClass}>Chọn nhiều ảnh</button>
                          </div>
                          <AdminImagePreview
                            value={item.images}
                            label="Chưa chọn ảnh mặt bằng"
                            multiple
                            size="sm"
                            onRemove={(_, imageIndex) => updateFloorItem(groupIndex, tabIndex, itemIndex, { images: item.images.filter((__, index) => index !== imageIndex) })}
                          />
                          {item.images.length > 1 ? (
                            <div className="space-y-1">
                              {item.images.map((image, imageIndex) => (
                                <div key={`${image}-${imageIndex}`} className="flex min-w-0 items-center gap-2 text-[10px] text-[#8C7A6B]">
                                  <span className="w-6 shrink-0">#{imageIndex + 1}</span>
                                  <span className="min-w-0 flex-1 truncate">{image}</span>
                                  <button type="button" onClick={() => updateFloorItem(groupIndex, tabIndex, itemIndex, { images: moveNestedItem(item.images, imageIndex, -1) })} disabled={imageIndex === 0} className={removeButtonClass}>Lên</button>
                                  <button type="button" onClick={() => updateFloorItem(groupIndex, tabIndex, itemIndex, { images: moveNestedItem(item.images, imageIndex, 1) })} disabled={imageIndex === item.images.length - 1} className={removeButtonClass}>Xuống</button>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <button type="button" onClick={() => updateFloorTab(groupIndex, tabIndex, current => ({ ...current, items: moveNestedItem(current.items, itemIndex, -1) }))} disabled={itemIndex === 0} className={removeButtonClass}>Đưa lên</button>
                          <button type="button" onClick={() => updateFloorTab(groupIndex, tabIndex, current => ({ ...current, items: moveNestedItem(current.items, itemIndex, 1) }))} disabled={itemIndex === tab.items.length - 1} className={removeButtonClass}>Đưa xuống</button>
                          <button type="button" onClick={() => updateFloorTab(groupIndex, tabIndex, current => ({ ...current, items: current.items.filter((_, index) => index !== itemIndex) }))} className={removeButtonClass}>Xóa mặt bằng</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );

  const renderTextPairRepeater = <T extends Record<string, string>>(
    title: string,
    items: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    emptyItem: T,
    fields: { key: keyof T; label: string; wide?: boolean; mediaTarget?: RepeaterMediaTarget['group'] }[]
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#8C7A6B]">{title}</label>
        <button type="button" onClick={() => setter([...items, emptyItem])} className={addButtonClass}>Thêm dòng</button>
      </div>
      {items.length === 0 ? <p className="text-xs text-[#8C7A6B]">Chưa có dữ liệu. Bấm “Thêm dòng” để nhập.</p> : null}
      {items.map((item, index) => (
        <div key={index} className={repeaterCardClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fields.map(field => {
              const fieldName = String(field.key);
              const mediaGroup = field.mediaTarget ?? null;

              if (field.wide) {
                return (
                  <textarea key={fieldName} value={item[field.key]} onChange={(e) => updateListItem(items, setter, index, { [field.key]: e.target.value } as Partial<T>)} rows={3} className={`${inputClass} md:col-span-2`} placeholder={field.label} />
                );
              }

              if (mediaGroup) {
                return (
                  <div key={fieldName} className="md:col-span-2">
                    <AdminMediaField
                      label={field.label}
                      value={item[field.key]}
                      onChange={(url) => updateListItem(items, setter, index, { [field.key]: url } as Partial<T>)}
                      onOpenMediaLibrary={() => setMediaSelectorTarget({ group: mediaGroup, index, field: fieldName as 'image' | 'avatar' } as RepeaterMediaTarget)}
                      size="sm"
                    />
                  </div>
                );
              }

              return (
                <input key={fieldName} value={item[field.key]} onChange={(e) => updateListItem(items, setter, index, { [field.key]: e.target.value } as Partial<T>)} className={inputClass} placeholder={field.label} />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => moveListItem(items, setter, index, -1)} disabled={index === 0} className={removeButtonClass}>Đưa lên</button>
            <button type="button" onClick={() => moveListItem(items, setter, index, 1)} disabled={index === items.length - 1} className={removeButtonClass}>Đưa xuống</button>
            <button type="button" onClick={() => removeListItem(items, setter, index)} className={removeButtonClass}>Xóa dòng này</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPricingPolicyEditor = () => (
    <div className="space-y-5">
      {sectionNote('Quản lý bảng giá, ảnh bảng giá, tài liệu giá và chính sách bán hàng. Có thể nhập từng dòng hoặc chọn ảnh/PDF từ Media Library để tiết kiệm thời gian.')}

      <div className="rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2] p-4">
        <h3 className="text-sm font-bold text-[#1F1B16]">Giá dùng cho bộ lọc và thẻ dự án</h3>
        <p className="mt-1 text-xs text-[#8C7A6B]">Giá khởi điểm được dùng để lọc và sắp xếp dự án ngoài website.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá khởi điểm (tỷ đồng)</label>
            <input type="number" min="0" step="0.1" value={formPriceMin} onChange={(e) => setFormPriceMin(e.target.value !== '' ? Number(e.target.value) : '')} className={inputClass} placeholder="Ví dụ: 5.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá cao nhất (tỷ đồng)</label>
            <input type="number" min={formPriceMin === '' ? 0 : formPriceMin} step="0.1" value={formPriceMax} onChange={(e) => setFormPriceMax(e.target.value !== '' ? Number(e.target.value) : '')} className={inputClass} placeholder="Có thể để trống" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá hiển thị</label>
            <input value={formPriceText} onChange={(e) => setFormPriceText(e.target.value)} className={inputClass} placeholder="Ví dụ: Từ 5,5 tỷ/căn" />
            <p className="mt-1 text-[11px] text-[#8C7A6B]">Để trống sẽ tự tạo từ giá khởi điểm.</p>
          </div>
        </div>
        {formPriceMin !== '' ? (
          <div className="mt-3 rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-xs text-[#6F5B49]">
            <strong>{formPriceMin} tỷ</strong>
            <span className="mx-2 text-[#C2AA8C]">•</span>
            Tương đương {formatVnd(Number(formPriceMin) * 1_000_000_000)}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
        <h3 className="text-sm font-bold text-[#1F1B16]">Giá theo m²</h3>
        <p className="mt-1 text-xs text-[#8C7A6B]">Đơn vị nhập: triệu đồng/m². Giá này không tham gia bộ lọc tổng giá.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá/m² thấp nhất (triệu đồng/m²)</label>
            <input type="number" min="0" step="0.1" value={formPricePerSqmMin} onChange={(e) => setFormPricePerSqmMin(e.target.value !== '' ? Number(e.target.value) : '')} className={inputClass} placeholder="Ví dụ: 100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá/m² cao nhất (triệu đồng/m²)</label>
            <input type="number" min={formPricePerSqmMin === '' ? 0 : formPricePerSqmMin} step="0.1" value={formPricePerSqmMax} onChange={(e) => setFormPricePerSqmMax(e.target.value !== '' ? Number(e.target.value) : '')} className={inputClass} placeholder="Có thể để trống" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1F1B16]">Bảng giá & tài liệu giá</h3>
            <p className="mt-1 text-xs text-[#8C7A6B]">Thêm dòng giá thủ công hoặc chọn ảnh/PDF/Excel từ Media Library.</p>
            <p className="mt-1 text-[11px] text-[#8C7A6B]">Bảng giá chi tiết chỉ dùng để trình bày theo từng loại sản phẩm, không điều khiển bộ lọc dự án.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFormPriceRows(items => [...items, createPriceItem('row')])} className={addButtonClass}>Thêm dòng giá</button>
            <button type="button" onClick={() => setFormPriceRows(items => [...items, createPriceItem('image')])} className={addButtonClass}>Thêm ảnh bảng giá</button>
            <button type="button" onClick={() => setFormPriceRows(items => [...items, createPriceItem('file')])} className={addButtonClass}>Thêm file</button>
            <button type="button" onClick={() => setFormPriceRows(items => [...items, createPriceItem('note')])} className={addButtonClass}>Thêm ghi chú</button>
          </div>
        </div>

        {formPriceRows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#E8DCCB] bg-[#FBF8F2] p-5 text-center text-xs text-[#8C7A6B]">
            Chưa có bảng giá. Bạn có thể nhập từng dòng hoặc upload ảnh/PDF bảng giá.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {formPriceRows.map((item, index) => (
              <div key={index} className={repeaterCardClass}>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#B88746]">
                    {item.kind === 'row' ? 'Dòng giá' : item.kind === 'image' ? 'Ảnh bảng giá' : item.kind === 'file' ? 'File bảng giá' : 'Ghi chú'}
                  </span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveListItem(formPriceRows, setFormPriceRows, index, -1)} className={removeButtonClass}>Lên</button>
                    <button type="button" onClick={() => moveListItem(formPriceRows, setFormPriceRows, index, 1)} className={removeButtonClass}>Xuống</button>
                    <button type="button" onClick={() => removeListItem(formPriceRows, setFormPriceRows, index)} className={removeButtonClass}>Xóa</button>
                  </div>
                </div>

                {item.kind === 'row' ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input value={item.productType} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { productType: e.target.value })} className={inputClass} placeholder="Loại sản phẩm" />
                    <input value={item.area} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { area: e.target.value })} className={inputClass} placeholder="Diện tích" />
                    <input value={item.price} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { price: e.target.value })} className={inputClass} placeholder="Giá tham khảo" />
                    <input value={item.payment} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { payment: e.target.value })} className={inputClass} placeholder="Thanh toán" />
                    <input value={item.status} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { status: e.target.value })} className={inputClass} placeholder="Trạng thái" />
                    <input value={item.note} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { note: e.target.value })} className={inputClass} placeholder="Ghi chú" />
                  </div>
                ) : null}

                {item.kind === 'image' ? (
                  <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                    <div className="overflow-hidden rounded-xl border border-[#E8DCCB] bg-white">
                      {item.image_url ? <img src={item.image_url} alt={item.title || 'Ảnh bảng giá'} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center text-xs text-[#8C7A6B]">Chưa chọn ảnh</div>}
                      <div className="flex gap-2 p-2">
                        <button type="button" onClick={() => setMediaSelectorTarget({ group: 'priceRows', index, field: 'image_url' })} className={addButtonClass}>Chọn ảnh</button>
                        {item.image_url ? <a href={item.image_url} target="_blank" rel="noreferrer" className={removeButtonClass}>Mở</a> : null}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input value={item.title} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { title: e.target.value })} className={inputClass} placeholder="Tiêu đề ảnh bảng giá" />
                      <textarea value={item.description} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { description: e.target.value })} rows={3} className={inputClass} placeholder="Mô tả ảnh bảng giá" />
                      <input value={item.button_label} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { button_label: e.target.value })} className={inputClass} placeholder="Nhãn nút, ví dụ: Xem ảnh lớn" />
                    </div>
                  </div>
                ) : null}

                {item.kind === 'file' ? (
                  <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                    <div className="rounded-xl border border-[#E8DCCB] bg-white p-3">
                      <p className="truncate text-xs font-bold text-[#1F1B16]">{item.file_url ? getFileName(item.file_url) : 'Chưa chọn file'}</p>
                      <p className="mt-1 text-[10px] text-[#8C7A6B]">{item.file_type}</p>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => setMediaSelectorTarget({ group: 'priceRows', index, field: 'file_url' })} className={addButtonClass}>Chọn file</button>
                        {item.file_url ? <a href={item.file_url} target="_blank" rel="noreferrer" className={removeButtonClass}>Mở</a> : null}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input value={item.title} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { title: e.target.value })} className={inputClass} placeholder="Tiêu đề tài liệu" />
                      <textarea value={item.description} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { description: e.target.value })} rows={3} className={inputClass} placeholder="Mô tả tài liệu" />
                      <input value={item.file_size} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { file_size: e.target.value })} className={inputClass} placeholder="Dung lượng, ví dụ: 2.8MB" />
                    </div>
                  </div>
                ) : null}

                {item.kind === 'note' ? (
                  <div className="space-y-2">
                    <input value={item.title} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { title: e.target.value })} className={inputClass} placeholder="Tiêu đề ghi chú" />
                    <textarea value={item.description} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { description: e.target.value })} rows={3} className={inputClass} placeholder="Nội dung ghi chú" />
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1F1B16]">
                      <input type="checkbox" checked={item.highlight} onChange={(e) => updateListItem(formPriceRows, setFormPriceRows, index, { highlight: e.target.checked })} />
                      Làm nổi bật ghi chú
                    </label>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1F1B16]">Chính sách bán hàng</h3>
            <p className="mt-1 text-xs text-[#8C7A6B]">Mỗi chính sách có thể chọn ảnh, file đính kèm và nhập bullet dễ hiểu.</p>
          </div>
          <button type="button" onClick={() => setFormPolicyCards(items => [...items, createPolicyItem()])} className={addButtonClass}>Thêm chính sách</button>
        </div>

        {formPolicyCards.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#E8DCCB] bg-[#FBF8F2] p-5 text-center text-xs text-[#8C7A6B]">
            Chưa có chính sách bán hàng. Thêm chính sách với ảnh minh họa để khách dễ hiểu hơn.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {formPolicyCards.map((item, index) => (
              <div key={index} className={repeaterCardClass}>
                <div className="flex justify-between gap-2">
                  <span className="text-xs font-bold text-[#1F1B16]">Chính sách {index + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveListItem(formPolicyCards, setFormPolicyCards, index, -1)} className={removeButtonClass}>Lên</button>
                    <button type="button" onClick={() => moveListItem(formPolicyCards, setFormPolicyCards, index, 1)} className={removeButtonClass}>Xuống</button>
                    <button type="button" onClick={() => removeListItem(formPolicyCards, setFormPolicyCards, index)} className={removeButtonClass}>Xóa</button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <div className="overflow-hidden rounded-xl border border-[#E8DCCB] bg-white">
                    {item.image_url ? <img src={item.image_url} alt={item.title || 'Ảnh chính sách'} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center text-xs text-[#8C7A6B]">Chưa chọn ảnh</div>}
                    <div className="flex gap-2 p-2">
                      <button type="button" onClick={() => setMediaSelectorTarget({ group: 'policyCards', index, field: 'image_url' })} className={addButtonClass}>Chọn ảnh</button>
                      {item.image_url ? <a href={item.image_url} target="_blank" rel="noreferrer" className={removeButtonClass}>Mở</a> : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input value={item.badge} onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { badge: e.target.value })} className={inputClass} placeholder="Badge, ví dụ: Ưu đãi" />
                    <input value={item.icon} onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { icon: e.target.value })} className={inputClass} placeholder="Icon" />
                    <input value={item.title} onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { title: e.target.value })} className={inputClass} placeholder="Tiêu đề chính sách" />
                    <input value={item.cta_label} onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { cta_label: e.target.value })} className={inputClass} placeholder="Nhãn CTA" />
                    <textarea value={item.description} onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { description: e.target.value })} rows={3} className={`${inputClass} md:col-span-2`} placeholder="Mô tả chính sách" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#8C7A6B]">Bullet chính sách</label>
                    <button type="button" onClick={() => updateListItem(formPolicyCards, setFormPolicyCards, index, { bullets: [...item.bullets, ''] })} className={addButtonClass}>Thêm bullet</button>
                  </div>
                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <input
                        value={bullet}
                        onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { bullets: item.bullets.map((value, i) => i === bulletIndex ? e.target.value : value) })}
                        className={inputClass}
                        placeholder="Nội dung bullet"
                      />
                      <button type="button" onClick={() => updateListItem(formPolicyCards, setFormPolicyCards, index, { bullets: item.bullets.filter((_, i) => i !== bulletIndex) })} className={removeButtonClass}>Xóa</button>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <input value={item.cta_url} onChange={(e) => updateListItem(formPolicyCards, setFormPolicyCards, index, { cta_url: e.target.value })} className={inputClass} placeholder="Link CTA nếu có" />
                  <button type="button" onClick={() => setMediaSelectorTarget({ group: 'policyCards', index, field: 'file_url' })} className={addButtonClass}>Chọn file</button>
                  {item.file_url ? <a href={item.file_url} target="_blank" rel="noreferrer" className={removeButtonClass}>{getFileName(item.file_url)}</a> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

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
            Quản lý loại hình dự án
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
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
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
                  <th className="px-6 py-4">Loại hình</th>
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getProjectStatusColor(project.project_status).admin}`}>
                        {getProjectStatusLabel(project.project_status)}
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
                        disabled={editLoadingProjectId === project.id}
                        className="p-1.5 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors inline-flex items-center disabled:opacity-50"
                        title="Sửa dự án"
                      >
                        {editLoadingProjectId === project.id ? (
                          <span className="h-4 w-4 rounded-full border-2 border-[#B88746] border-t-transparent animate-spin" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
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
          <div className="fixed inset-0 z-40 flex items-center justify-center p-3">
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
              className="relative z-10 flex h-[calc(100vh-24px)] w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl border border-[#E8DCCB] bg-white text-[#1F1B16] shadow-2xl"
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

              <div className="flex min-h-0 flex-1">
              {/* Section sidebar */}
              <div className="flex w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r border-[#E8DCCB]/70 bg-[#FBF8F2]/70 p-3 text-xs select-none">
                {[
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'hero', label: 'Hero & Thông tin nhanh' },
                  { id: 'gallery', label: 'Không gian sống' },
                  { id: 'location', label: 'Vị trí & Kết nối' },
                  { id: 'amenities', label: 'Tiện ích nổi bật' },
                  { id: 'floor', label: 'Sản phẩm & Mặt bằng' },
                  { id: 'handover', label: 'Tiêu chuẩn bàn giao' },
                  { id: 'pricingPolicy', label: 'Bảng giá & Chính sách' },
                  { id: 'timeline', label: 'Tiến độ thi công' },
                  { id: 'investment', label: 'Đầu tư & Đánh giá' },
                  { id: 'faq', label: 'Câu hỏi thường gặp' },
                  { id: 'media', label: 'Ảnh, Video & Tài liệu' },
                  { id: 'seo', label: 'SEO & Schema' },
                  { id: 'vr360', label: 'VR 360' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProjectAdminTab)}
                    className={`rounded-xl px-3 py-2.5 text-left font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-[#B88746] shadow-sm'
                        : 'text-[#8C7A6B] hover:bg-white/70 hover:text-[#1F1B16]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Scrollable Fields */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-bold">{formError}</p>
                    {Object.keys(fieldErrors).length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                        {Object.entries(fieldErrors).map(([field, message]) => (
                          <li key={field}>{message}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
                {activeChecklistItem ? (
                  <div
                    data-project-tab={activeTab}
                    className={`rounded-2xl border p-4 text-sm ${
                      activeChecklistItem.missingFields.length
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    <p className="font-bold">
                      {activeChecklistItem.missingFields.length
                        ? `Mục ${activeChecklistItem.label} còn thiếu dữ liệu:`
                        : `Mục ${activeChecklistItem.label} đã đủ dữ liệu cần thiết.`}
                    </p>
                    {activeChecklistItem.missingFields.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                        {activeChecklistItem.missingFields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
                
                {/* TAB 1: General Info */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý thông tin cơ bản của dự án, mô tả dùng cho card và nội dung giới thiệu chi tiết trên trang dự án.')}
                    {renderCompletionChecklist()}
                    <div className="rounded-2xl border border-[#E8DCCB] bg-[#FBF8F2]/50 p-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-[#1F1B16]">Tiêu đề section ngoài client</h3>
                        <p className="mt-1 text-xs text-[#8C7A6B]">
                          Nhập chữ hoa/thường thế nào thì trang chi tiết dự án hiển thị đúng như vậy. Ô nhãn nhỏ có thể bỏ trống.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {projectSectionTitleLabels.map((item) => (
                          <div key={item.key} className="rounded-xl border border-[#E8DCCB] bg-white p-3">
                            <p className="mb-2 text-xs font-bold text-[#1F1B16]">{item.label}</p>
                            <div className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr]">
                              <input
                                value={formSectionTitles[item.key]?.eyebrow || ''}
                                onChange={(e) => setFormSectionTitles(prev => ({
                                  ...prev,
                                  [item.key]: { ...prev[item.key], eyebrow: e.target.value }
                                }))}
                                className={inputClass}
                                placeholder="Nhãn nhỏ"
                              />
                              <textarea
                                value={formSectionTitles[item.key]?.title || ''}
                                onChange={(e) => setFormSectionTitles(prev => ({
                                  ...prev,
                                  [item.key]: { ...prev[item.key], title: e.target.value }
                                }))}
                                rows={item.key === 'contact' ? 2 : 1}
                                className={inputClass}
                                placeholder="Tiêu đề hiển thị"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Name, Slug, Code */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mã dự án (Code)</label>
                        <input
                          type="text"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: TGC-2026"
                        />
                      </div>
                    </div>

                    <div data-project-field="project_label">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn hiển thị trên thẻ dự án</label>
                      <input
                        type="text"
                        maxLength={80}
                        value={formProjectLabel}
                        onChange={(e) => setFormProjectLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: Mới ra mắt, Phiên bản giới hạn, Tâm điểm đầu tư"
                      />
                      <p className="mt-1 text-[10px] leading-4 text-[#8C7A6B]">
                        Nhãn marketing ngắn hiển thị trên card hoặc Hero. Không dùng để lọc dự án và không thay thế trạng thái dự án.
                      </p>
                    </div>

                    {/* Developer dropdown, Developer name, Location dropdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Liên kết Chủ đầu tư</label>
                        <select
                          value={formDeveloperId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormDeveloperId(val !== '' ? Number(val) : '');
                            // Auto sync default name string if matching
                            const found = developersSelect.find(d => d.id === Number(val));
                            if (found) setFormDeveloper(found.name);
                          }}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="">-- Chọn Chủ đầu tư --</option>
                          {developersSelect.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên chủ đầu tư hiển thị</label>
                        <input
                          type="text"
                          value={formDeveloper}
                          onChange={(e) => setFormDeveloper(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Masterise Homes"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Liên kết Vị trí/Khu vực</label>
                        <input
                          type="search"
                          value={formLocationSearch}
                          onChange={(event) => setFormLocationSearch(event.target.value)}
                          className="mb-2 w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Tìm tên vị trí, tỉnh, quận hoặc vùng miền..."
                        />
                        <select
                          value={formLocationId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormLocationId(val !== '' ? Number(val) : '');
                            const found = locationsSelect.find(l => l.id === Number(val));
                            if (found) {
                              setFormLocation(found.address || found.name);
                              if (found.province) setFormProvince(found.province);
                              if (found.district) setFormDistrict(found.district);
                              if (found.ward) setFormWard(found.ward);
                            }
                          }}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        >
                          <option value="">-- Chọn Vị trí khu vực --</option>
                          {filteredLocationOptions.map(l => (
                            <option key={l.id} value={l.id} disabled={!l.region}>
                              {l.name} — {l.province || 'Chưa rõ tỉnh'} — {l.region?.name || 'Chưa gán vùng'}
                            </option>
                          ))}
                        </select>
                        {selectedLocation?.region ? (
                          <p className="mt-2 text-xs font-semibold text-emerald-700">
                            Vùng miền tự động: {selectedLocation.region.name}
                          </p>
                        ) : formLocationId !== '' ? (
                          <p className="mt-2 text-xs font-semibold text-red-600">
                            Vị trí này chưa có vùng miền. <a href="/admin/locations" className="underline">Mở Quản lý vị trí</a> để cập nhật.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-[#8C7A6B]">Vùng miền được lấy tự động theo vị trí đã chọn.</p>
                        )}
                      </div>
                    </div>

                    {/* Handover Year, Handover Time, Construction Density */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Thời gian bàn giao chi tiết</label>
                        <input
                          type="text"
                          value={formHandoverTime}
                          onChange={(e) => setFormHandoverTime(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: Quý IV/2026, Đã bàn giao..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mật độ xây dựng</label>
                        <input
                          type="text"
                          value={formConstructionDensity}
                          onChange={(e) => setFormConstructionDensity(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 23.5%"
                        />
                      </div>
                    </div>

                    {/* Scale, Area size, Total area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Quy mô diện tích chung</label>
                        <input
                          type="text"
                          value={formAreaSize}
                          onChange={(e) => setFormAreaSize(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 117.4 ha"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tổng diện tích đất cụ thể</label>
                        <input
                          type="text"
                          value={formTotalArea}
                          onChange={(e) => setFormTotalArea(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 1,174,000 m2"
                        />
                      </div>
                    </div>

                    {/* Legal Status, Ownership Type, Sort Order */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Pháp lý dự án</label>
                        <input
                          type="text"
                          value={formLegalStatus}
                          onChange={(e) => setFormLegalStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: Đã phê duyệt 1/500, Sổ hồng lâu dài"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Hình thức sở hữu</label>
                        <input
                          type="text"
                          value={formOwnershipType}
                          onChange={(e) => setFormOwnershipType(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: Lâu dài đối với người Việt"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Thứ tự sắp xếp hiển thị</label>
                        <input
                          type="number"
                          value={formSortOrder}
                          onChange={(e) => setFormSortOrder(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="0"
                        />
                        <p className="mt-1 text-[10px] leading-4 text-[#8C7A6B]">
                          Dùng cho trang chủ và trang dự án: số nhỏ hơn hiển thị trước. Nếu dự án có nhãn Hot, Hot vẫn được ưu tiên lên đầu nhóm nổi bật.
                        </p>
                      </div>
                    </div>

                    {/* Total units, Total blocks, Total floors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tổng số căn hộ/sản phẩm</label>
                        <input
                          type="number"
                          value={formTotalUnits}
                          onChange={(e) => setFormTotalUnits(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 1800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tổng số block/tòa</label>
                        <input
                          type="number"
                          value={formTotalBlocks}
                          onChange={(e) => setFormTotalBlocks(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Số tầng cao tối đa</label>
                        <input
                          type="number"
                          value={formTotalFloors}
                          onChange={(e) => setFormTotalFloors(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: 40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trạng thái dự án *</label>
                      <select
                        value={formProjectStatus}
                        onChange={(e) => setFormProjectStatus(e.target.value as ProjectStatus)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                      >
                        {PROJECT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10px] leading-4 text-[#8C7A6B]">
                        Trạng thái này được dùng cho badge, bộ lọc và hiển thị công khai của dự án.
                        Tiến độ xây dựng chi tiết được quản lý tại tab “Tiến độ thi công”.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Thời gian mở bán</label>
                        <input
                          type="date"
                          value={formOpenSaleAt}
                          onChange={(e) => setFormOpenSaleAt(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        />
                      </div>
                    </div>

                    {/* Featured Checkbox & Publish Checkbox */}
                    <div className="space-y-2 border-t border-b border-[#E8DCCB]/40 py-3">
                      <p className="text-[11px] leading-5 text-[#8C7A6B]">
                        Trang chủ mục "Dự án nổi bật" chỉ lấy các dự án đã bật Nổi bật. Dự án Hot sẽ lên trước, sau đó sắp xếp theo "Thứ tự sắp xếp hiển thị".
                      </p>
                      <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="formIsHot"
                          checked={formIsHot}
                          onChange={(e) => setFormIsHot(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB]"
                        />
                        <label htmlFor="formIsHot" className="text-xs font-semibold text-[#1F1B16] cursor-pointer">
                          Gắn nhãn <b>Hot</b>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="formIsPublished"
                          checked={formIsPublished}
                          onChange={(e) => setFormIsPublished(e.target.checked)}
                          className="w-4 h-4 rounded text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB]"
                        />
                        <label htmlFor="formIsPublished" className="text-xs font-semibold text-[#1F1B16] cursor-pointer">
                          Xuất bản công khai dự án lên website
                        </label>
                      </div>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Loại hình dự án *</label>
                      <p className="mb-2 text-[10px] leading-4 text-[#8C7A6B]">
                        Dùng để phân loại và lọc dự án trên trang danh sách dự án. Có thể chọn nhiều loại hình.
                      </p>
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
                    {sectionNote('Phần này hiển thị ở section “Vị trí chiến lược / Kết nối toàn diện”, bao gồm vị trí, mô tả, tọa độ, ảnh bản đồ và danh sách kết nối.')}
                    {/* Location and Region */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ đầy đủ hiển thị (location)</label>
                        <input
                          type="text"
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Vùng miền (tự động theo vị trí)</label>
                        <div className={`min-h-10 rounded-xl border px-3 py-2 text-sm ${selectedLocation?.region ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                          {selectedLocation?.region?.name || 'Chưa xác định — hãy chọn vị trí đã có vùng miền'}
                        </div>
                        <p className="mt-1 text-xs text-[#8C7A6B]">Không thể nhập tay; thay đổi vùng tại module Quản lý vị trí.</p>
                      </div>
                    </div>

                    {/* Location Description */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả vị trí chiến lược (Hiển thị ở cột bên trái bản đồ dự án)</label>
                      <textarea
                        value={formLocationDescription}
                        onChange={(e) => setFormLocationDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: Tọa lạc tại trung tâm TP. Thủ Đức, kết nối nhanh đến trung tâm và các khu vực trọng điểm..."
                      />
                    </div>

                    {/* Address components */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ số/đường</label>
                        <input
                          type="text"
                          value={formAddress}
                          onChange={(e) => setFormAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Số 2 Tôn Đức Thắng"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Phường/Xã</label>
                        <input
                          type="text"
                          value={formWard}
                          onChange={(e) => setFormWard(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Phường Bến Nghé"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Quận/Huyện</label>
                        <input
                          type="text"
                          value={formDistrict}
                          onChange={(e) => setFormDistrict(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Quận 1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tỉnh/Thành phố</label>
                        <input
                          type="text"
                          value={formProvince}
                          onChange={(e) => setFormProvince(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="TP. Hồ Chí Minh"
                        />
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="space-y-2 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2]/60 p-4">
                      <label className="block text-xs font-semibold text-[#8C7A6B]">Ảnh bản đồ hiển thị ngoài trang chi tiết</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-28 h-20 rounded-xl border border-[#E8DCCB] bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {formMapImageUrl ? (
                            formMapImageUrl.endsWith('.svg') ? (
                              <div className="w-full h-full p-1 bg-white">
                                <img src={formMapImageUrl} alt="Xem trước ảnh bản đồ" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <img src={formMapImageUrl} alt="Xem trước ảnh bản đồ" className="w-full h-full object-cover" />
                            )
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#B88746]/40" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={formMapImageUrl}
                            className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-xs focus:outline-none"
                            placeholder="Chọn ảnh bản đồ từ Media Library"
                            readOnly
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setMediaSelectorTarget('map')}
                              className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              Chọn ảnh bản đồ
                            </button>
                            {formMapImageUrl ? (
                              <button
                                type="button"
                                onClick={() => setFormMapImageUrl('')}
                                className={removeButtonClass}
                              >
                                Xóa ảnh bản đồ
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderTextPairRepeater('Danh sách kết nối', formConnectivity, setFormConnectivity, { time: '', label: '' }, [
                      { key: 'time', label: 'Thời gian di chuyển, ví dụ: 5 phút' },
                      { key: 'label', label: 'Điểm đến, ví dụ: Đến trung tâm Quận 1' },
                    ])}
                  </div>
                )}

                {/* TAB 3: Description & Amenities */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {sectionNote('Nội dung ở đây chỉ dùng cho tổng quan dự án. Không nhập bảng giá, mặt bằng, tiện ích hoặc chính sách vào phần giới thiệu.')}
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
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung chi tiết (Rich Text Editor)</label>
                      <RichTextEditor
                        value={formContent}
                        onChange={setFormContent}
                        placeholder="Nội dung đầy đủ của dự án (Giới thiệu, quy mô chi tiết, hạ tầng...)"
                      />
                    </div>

                  </div>
                )}

                {false && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Dòng mô tả dưới tên dự án</label>
                        <input value={formHeroSubtitle} onChange={(e) => setFormHeroSubtitle(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="Ví dụ: Biểu tượng sống mới tại trung tâm thành phố" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn nổi bật trên hero</label>
                        <input value={formBadgeText} onChange={(e) => setFormBadgeText(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="Ví dụ: Dự án hạng sang" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn nhỏ của thư viện ảnh</label>
                        <input value={formGalleryLabel} onChange={(e) => setFormGalleryLabel(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="Ví dụ: Không gian sống" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề thư viện ảnh</label>
                        <input value={formGalleryTitle} onChange={(e) => setFormGalleryTitle(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="Ví dụ: Bộ sưu tập hình ảnh dự án" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tình trạng schema Google</label>
                        <input value={formSchemaAvailability} onChange={(e) => setFormSchemaAvailability(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="Ví dụ: https://schema.org/InStock" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả thư viện ảnh</label>
                      <textarea value={formGalleryDescription} onChange={(e) => setFormGalleryDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá schema Google</label>
                        <input value={formSchemaPrice} onChange={(e) => setFormSchemaPrice(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="Ví dụ: 8900000000" />
                        <p className="mt-1 text-[11px] text-[#8C7A6B]">Để trống sẽ tự dùng giá khởi điểm.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Đơn vị tiền tệ schema</label>
                        <input value={formSchemaPriceCurrency} onChange={(e) => setFormSchemaPriceCurrency(e.target.value)} className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none" placeholder="VND" />
                      </div>
                    </div>
                    {renderIconValueRepeater('Thẻ thông tin nhanh', formQuickCards, setFormQuickCards, { label: '', value: '', icon: 'LandPlot' })}
                    {renderIconValueRepeater('Thông tin tổng quan dự án', formProjectFacts, setFormProjectFacts, { label: '', value: '', icon: 'MapPin' })}
                    {renderTextPairRepeater('Chỉ số nổi bật', formProjectStats, setFormProjectStats, { value: '', label: '' }, [
                      { key: 'value', label: 'Giá trị, ví dụ: 3,5 ha' },
                      { key: 'label', label: 'Nhãn, ví dụ: Quy mô dự án' },
                    ])}
                    {renderTextPairRepeater('Kết nối vị trí', formConnectivity, setFormConnectivity, { time: '', label: '' }, [
                      { key: 'time', label: 'Thời gian, ví dụ: 5 phút' },
                      { key: 'label', label: 'Địa điểm, ví dụ: Đến trung tâm thương mại' },
                    ])}
                    {renderTextPairRepeater('Tiện ích chi tiết', formAmenityDetails, setFormAmenityDetails, { title: '', description: '', image: '', icon: 'Sparkles' }, [
                      { key: 'title', label: 'Tên tiện ích' },
                      { key: 'icon', label: 'Icon' },
                      { key: 'image', label: 'Ảnh tiện ích', mediaTarget: 'amenityDetails' },
                      { key: 'description', label: 'Mô tả tiện ích', wide: true },
                    ])}
                    {renderTextPairRepeater('Lý do nên đầu tư', formInvestmentReasons, setFormInvestmentReasons, { title: '', description: '', icon: 'TrendingUp' }, [
                      { key: 'title', label: 'Tiêu đề' },
                      { key: 'icon', label: 'Icon' },
                      { key: 'description', label: 'Mô tả lý do', wide: true },
                    ])}
                    {renderTextPairRepeater('Đánh giá khách hàng', formProjectTestimonials, setFormProjectTestimonials, { name: '', role: '', content: '', avatar: '' }, [
                      { key: 'name', label: 'Tên khách hàng' },
                      { key: 'role', label: 'Vai trò, ví dụ: Nhà đầu tư' },
                      { key: 'avatar', label: 'Ảnh đại diện khách hàng', mediaTarget: 'projectTestimonials' },
                      { key: 'content', label: 'Nội dung đánh giá', wide: true },
                    ])}
                    {renderTextPairRepeater('Câu hỏi thường gặp của dự án', formProjectFaqs, setFormProjectFaqs, { question: '', answer: '' }, [
                      { key: 'question', label: 'Câu hỏi' },
                      { key: 'answer', label: 'Câu trả lời', wide: true },
                    ])}
                  </div>
                )}

                {activeTab === 'hero' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này hiển thị ở đầu trang chi tiết dự án, gồm ảnh Hero, nhãn nổi bật, mô tả ngắn, hộp thông tin nhanh, thanh tổng quan và dãy chỉ số nổi bật. Hộp thông tin nhanh nên dùng “Sở hữu / Lâu dài” thay cho “Giá tham khảo” để tránh trùng với section Sản phẩm & Bảng giá.')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Dòng mô tả dưới tên dự án</label>
                        <input value={formHeroSubtitle} onChange={(e) => setFormHeroSubtitle(e.target.value)} className={inputClass} placeholder="Ví dụ: Trung tâm mới của TP. Thủ Đức" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn nổi bật trên Hero</label>
                        <input value={formBadgeText} onChange={(e) => setFormBadgeText(e.target.value)} className={inputClass} placeholder="Ví dụ: Dự án đô thị biểu tượng" />
                      </div>
                    </div>
                    {renderIconValueRepeater('Thông tin nhanh trong hộp Hero (dùng Sở hữu thay cho Giá tham khảo)', formQuickCards, setFormQuickCards, { label: '', value: '', icon: 'LandPlot' })}
                    {renderIconValueRepeater('Thông tin tổng quan dưới Hero', formProjectFacts, setFormProjectFacts, { label: '', value: '', icon: 'MapPin' })}
                    {renderTextPairRepeater('Chỉ số nổi bật', formProjectStats, setFormProjectStats, { value: '', label: '' }, [
                      { key: 'value', label: 'Con số hiển thị, ví dụ: 117,4 ha' },
                      { key: 'label', label: 'Nhãn mô tả, ví dụ: Quy mô đô thị' },
                    ])}
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý section “Không gian sống” và thư viện ảnh hiển thị ngay dưới dãy chỉ số nổi bật. Ảnh được chọn trong tab “Ảnh, Video & Tài liệu”.')}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div data-project-field="gallery_label">
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn section</label>
                        <input value={formGalleryLabel} onChange={(e) => setFormGalleryLabel(e.target.value)} className={`${inputClass}${highlightClass('gallery_label')}`} placeholder="Ví dụ: Kiến tạo chuẩn mực sống mới" />
                      </div>
                      <div data-project-field="gallery_title" className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề section</label>
                        <input value={formGalleryTitle} onChange={(e) => setFormGalleryTitle(e.target.value)} className={`${inputClass}${highlightClass('gallery_title')}`} placeholder="Ví dụ: Không gian sống đẳng cấp quốc tế" />
                      </div>
                    </div>
                    <div data-project-field="gallery_description">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả section</label>
                      <textarea value={formGalleryDescription} onChange={(e) => setFormGalleryDescription(e.target.value)} rows={3} className={`${inputClass}${highlightClass('gallery_description')}`} placeholder="Nhập mô tả ngắn cho section không gian sống" />
                    </div>
                    {renderGalleryManager()}
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này hiển thị ở section “Tiện ích nổi bật”. Không nhập thêm danh sách tiện ích dạng chữ ở nơi khác để tránh trùng lặp ngoài Client.')}
                    {renderTextPairRepeater('Tiện ích nổi bật', formAmenityDetails, setFormAmenityDetails, { title: '', description: '', image: '', icon: 'Sparkles' }, [
                      { key: 'title', label: 'Tên tiện ích' },
                      { key: 'icon', label: 'Biểu tượng' },
                      { key: 'image', label: 'Ảnh tiện ích', mediaTarget: 'amenityDetails' },
                      { key: 'description', label: 'Mô tả tiện ích', wide: true },
                    ])}
                  </div>
                )}

                {activeTab === 'floor' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý cấu trúc Nhóm cha → Tab con → Mặt bằng → Nhiều ảnh. Phiên bản này sắp xếp bằng nút Lên/Xuống và dùng Media Library hiện có.')}
                    {renderFloorPlanRepeater()}
                  </div>
                )}

                {activeTab === 'handover' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý section “Tiêu chuẩn bàn giao” hiển thị ngay dưới mục Mặt bằng ngoài Client. Có thể thêm nhiều hạng mục, chọn ảnh từ Media Library và chỉnh thứ tự bằng nút đưa lên/đưa xuống.')}
                    {renderTextPairRepeater('Tiêu chuẩn bàn giao', formHandoverStandards, setFormHandoverStandards, { title: '', description: '', image: '', icon: 'ClipboardCheck' }, [
                      { key: 'title', label: 'Hạng mục, ví dụ: Sàn, tường, thiết bị vệ sinh' },
                      { key: 'icon', label: 'Biểu tượng' },
                      { key: 'image', label: 'Ảnh minh họa tiêu chuẩn bàn giao', mediaTarget: 'handoverStandards' },
                      { key: 'description', label: 'Mô tả tiêu chuẩn bàn giao', wide: true },
                    ])}
                  </div>
                )}

                {activeTab === 'pricingPolicy' && (
                  renderPricingPolicyEditor()
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này hiển thị ở section “Tiến độ thi công”. Nếu chưa nhập dữ liệu, Client sẽ ẩn section này.')}
                    {renderTextPairRepeater('Tiến độ thi công', formProjectTimeline, setFormProjectTimeline, { date: '', title: '' }, [
                      { key: 'date', label: 'Mốc thời gian, ví dụ: Quý 1/2026' },
                      { key: 'title', label: 'Nội dung tiến độ' },
                    ])}
                  </div>
                )}

                {activeTab === 'investment' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý hai section “Vì sao nên đầu tư?” và “Khách hàng nói gì?”. Không có dữ liệu thì Client sẽ ẩn section tương ứng.')}
                    {renderTextPairRepeater('Lý do nên đầu tư', formInvestmentReasons, setFormInvestmentReasons, { title: '', description: '', icon: 'TrendingUp' }, [
                      { key: 'title', label: 'Tiêu đề' },
                      { key: 'icon', label: 'Biểu tượng' },
                      { key: 'description', label: 'Mô tả lý do', wide: true },
                    ])}
                    {renderTextPairRepeater('Đánh giá khách hàng', formProjectTestimonials, setFormProjectTestimonials, { name: '', role: '', content: '', avatar: '' }, [
                      { key: 'name', label: 'Tên khách hàng' },
                      { key: 'role', label: 'Vai trò, ví dụ: Nhà đầu tư' },
                      { key: 'avatar', label: 'Ảnh đại diện khách hàng', mediaTarget: 'projectTestimonials' },
                      { key: 'content', label: 'Nội dung đánh giá', wide: true },
                    ])}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý FAQ riêng của từng dự án. Nếu chưa có FAQ, Client sẽ ẩn section câu hỏi thường gặp.')}
                    {renderTextPairRepeater('Câu hỏi thường gặp của dự án', formProjectFaqs, setFormProjectFaqs, { question: '', answer: '' }, [
                      { key: 'question', label: 'Câu hỏi' },
                      { key: 'answer', label: 'Câu trả lời', wide: true },
                    ])}
                  </div>
                )}

                {/* TAB 4: Media Assets */}
                {activeTab === 'media' && (
                  <div className="space-y-6">
                    <AdminMediaField
                      label="Ảnh đại diện hiển thị (Thumbnail)"
                      value={formThumbnail}
                      onChange={setFormThumbnail}
                      onOpenMediaLibrary={() => setMediaSelectorTarget('thumbnail')}
                      placeholder="Chọn ảnh đại diện từ Media Library hoặc dán URL"
                      size="md"
                    />

                    <AdminMediaField
                      label="Ảnh Hero / Banner dự án"
                      value={formBannerImage}
                      onChange={setFormBannerImage}
                      onOpenMediaLibrary={() => setMediaSelectorTarget('banner')}
                      placeholder="Chọn ảnh Hero từ Media Library hoặc dán URL"
                      size="lg"
                    />

                    <AdminMediaField
                      label="Ảnh bản đồ dự án"
                      value={formMapImageUrl}
                      onChange={setFormMapImageUrl}
                      onOpenMediaLibrary={() => setMediaSelectorTarget('map')}
                      placeholder="Chọn ảnh bản đồ từ Media Library hoặc dán URL"
                      description="Hỗ trợ SVG, WebP, PNG, JPG. Khuyến nghị ảnh ngang 16:9 hoặc 4:3, tối thiểu 1600px chiều ngang. Client sẽ fit toàn bộ ảnh và cho bấm phóng to."
                      size="lg"
                    />

                    <div className="space-y-4 rounded-2xl border border-[#E8DCCB] bg-white p-4">
                      <div>
                        <h3 className="text-sm font-bold text-[#1F1B16]">Album ảnh cuối trang chi tiết</h3>
                        <p className="mt-1 text-xs text-[#8C7A6B]">
                          Ảnh ở đây chỉ hiển thị thành album ở gần cuối trang chi tiết dự án, không ảnh hưởng section Không gian sống phía trên.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#8C7A6B]">Nhãn nhỏ của album</label>
                          <input
                            value={formDetailGalleryLabel}
                            onChange={(e) => setFormDetailGalleryLabel(e.target.value)}
                            className={inputClass}
                            placeholder="Ví dụ: Thư viện hình ảnh"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#8C7A6B]">Tiêu đề album</label>
                          <input
                            value={formDetailGalleryTitle}
                            onChange={(e) => setFormDetailGalleryTitle(e.target.value)}
                            className={inputClass}
                            placeholder="Ví dụ: Bộ sưu tập hình ảnh dự án"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-semibold text-[#8C7A6B]">Mô tả album</label>
                          <textarea
                            value={formDetailGalleryDescription}
                            onChange={(e) => setFormDetailGalleryDescription(e.target.value)}
                            rows={3}
                            className={inputClass}
                            placeholder="Nhập mô tả ngắn cho album cuối trang chi tiết"
                          />
                        </div>
                      </div>
                      {renderDetailGalleryManager(true)}
                    </div>

                    <AdminMediaField
                      label="Tài liệu Brochure / PDF"
                      value={formBrochureUrl}
                      onChange={setFormBrochureUrl}
                      onOpenMediaLibrary={() => setMediaSelectorTarget('brochure')}
                      placeholder="URL file PDF hoặc ảnh brochure"
                      description="Nếu là ảnh sẽ hiển thị thumbnail; nếu là PDF sẽ hiển thị biểu tượng tệp."
                      size="sm"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AdminMediaField
                        label="Video giới thiệu"
                        value={formVideoUrl}
                        onChange={setFormVideoUrl}
                        placeholder="https://www.youtube.com/watch?v=..."
                        description="Có thể dán link YouTube, Vimeo hoặc video đã upload."
                        size="sm"
                      />
                      <AdminMediaField
                        label="Link tham quan thực tế ảo"
                        value={formVirtualTourUrl}
                        onChange={setFormVirtualTourUrl}
                        placeholder="https://my.matterport.com/show/?m=..."
                        description="Dùng cho tour 360/3D nếu dự án có sẵn link ngoài."
                        size="sm"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 5: SEO Configurations */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    {sectionNote('Phần này quản lý metadata và dữ liệu Schema cho trang chi tiết dự án. Nếu thiếu giá hợp lệ, Client không render giá giả trong Schema.')}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giá Schema</label>
                        <input value={formSchemaPrice} onChange={(e) => setFormSchemaPrice(e.target.value)} className={inputClass} placeholder="Ví dụ: 8900000000" />
                        <p className="mt-1 text-[11px] text-[#8C7A6B]">Để trống sẽ tự dùng giá khởi điểm.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Đơn vị tiền tệ Schema</label>
                        <input value={formSchemaPriceCurrency} onChange={(e) => setFormSchemaPriceCurrency(e.target.value)} className={inputClass} placeholder="Ví dụ: VND" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trạng thái Schema</label>
                        <select value={formSchemaAvailability} onChange={(e) => setFormSchemaAvailability(e.target.value)} className={inputClass}>
                          <option value="">Không render trạng thái</option>
                          <option value="https://schema.org/InStock">Còn hàng</option>
                          <option value="https://schema.org/OutOfStock">Hết hàng</option>
                          <option value="https://schema.org/PreOrder">Đang mở bán</option>
                          <option value="https://schema.org/LimitedAvailability">Liên hệ để biết thêm</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'vr360' && (
                  <VR360Tab 
                    projectId={editingProject?.id}
                    projectName={editingProject?.name || ''}
                  />
                )}

              </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t border-[#E8DCCB] flex flex-col gap-3 bg-[#FBF8F2] sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DCCB] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                  {lastSavedAt ? (
                    <span className="mr-auto text-[11px] font-semibold text-emerald-700">Đã lưu lúc {lastSavedAt}</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleSaveProject(editingProject && formIsPublished ? 'save' : 'draft')}
                    disabled={saveProjectMutation.isPending || !formName.trim()}
                    className="px-5 py-2.5 border border-[#B88746] bg-white text-[#B88746] hover:bg-[#B88746]/5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {saveProjectMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-[#B88746] border-t-transparent rounded-full animate-spin" />}
                    {editingProject && formIsPublished ? 'Lưu thay đổi' : 'Lưu nháp'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProject('preview')}
                    disabled={saveProjectMutation.isPending || !formName.trim()}
                    className="px-5 py-2.5 border border-[#1F1B16] bg-white text-[#1F1B16] hover:bg-gray-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Lưu & xem trước
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProject('publish')}
                    disabled={saveProjectMutation.isPending || !formName.trim()}
                    className="px-6 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {saveProjectMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingProject && formIsPublished ? 'Cập nhật xuất bản' : 'Xuất bản'}
                  </button>
                </div>
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
                <h3 className="font-heading font-medium text-lg text-[#1F1B16]">Quản lý loại hình dự án</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Category Form */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input type="text" placeholder="Tên loại hình mới..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="px-3 py-2 border border-[#E8DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746] bg-[#FBF8F2]" />
                <input type="text" placeholder="Slug (tự sinh nếu trống)" value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} className="px-3 py-2 border border-[#E8DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B88746] bg-[#FBF8F2]" />
                <button
                  onClick={() => {
                    if (!newCategoryName.trim()) return;
                    createCategoryMutation.mutate({ name: newCategoryName, slug: newCategorySlug });
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
                  Chưa có loại hình dự án nào.
                </div>
              ) : (
                <div className="divide-y divide-[#E8DCCB]/60 max-h-[200px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-2.5 text-xs">
                      {editingCategoryId === cat.id ? (
                        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                          <input value={editingCategoryName} onChange={(event) => setEditingCategoryName(event.target.value)} className="rounded-lg border border-[#E8DCCB] px-2 py-1.5" aria-label="Tên loại hình" />
                          <input value={editingCategorySlug} onChange={(event) => setEditingCategorySlug(event.target.value)} className="rounded-lg border border-[#E8DCCB] px-2 py-1.5" aria-label="Slug loại hình" />
                          <div className="flex gap-1">
                            <button onClick={() => updateCategoryMutation.mutate({ id: cat.id, name: editingCategoryName, slug: editingCategorySlug })} disabled={!editingCategoryName.trim() || updateCategoryMutation.isPending} className="rounded-lg bg-[#B88746] px-2 py-1.5 font-bold text-white disabled:opacity-50">Lưu</button>
                            <button onClick={() => setEditingCategoryId(null)} className="rounded-lg border border-[#E8DCCB] px-2 py-1.5">Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="font-semibold">{cat.name}</span>
                            <span className="block text-[9px] text-[#8C7A6B]">/{cat.slug} (Có {cat.projects_count || 0} dự án)</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategorySlug(cat.slug); }} className="p-1 hover:bg-[#B88746]/10 text-[#B88746] rounded-lg transition-colors" aria-label={`Sửa ${cat.name}`}><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { if (window.confirm(`Xóa loại hình "${cat.name}"?`)) deleteCategoryMutation.mutate(cat.id); }} disabled={deleteCategoryMutation.isPending || (cat.projects_count || 0) > 0} className="p-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Xóa ${cat.name}`}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
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
            key={`${typeof mediaSelectorTarget === 'string' ? mediaSelectorTarget : mediaSelectorTarget.group === 'floorPlanGroups' ? `${mediaSelectorTarget.group}-${mediaSelectorTarget.groupIndex}-${mediaSelectorTarget.tabIndex}-${mediaSelectorTarget.itemIndex}` : `${mediaSelectorTarget.group}-${mediaSelectorTarget.index}`}-${getMediaSelectorSelectedUrls().join('|')}`}
            isOpen={mediaSelectorTarget !== null}
            onClose={() => setMediaSelectorTarget(null)}
            onSelect={handleMediaSelected}
            multiple={
              mediaSelectorTarget === 'gallery'
              || mediaSelectorTarget === 'detailGallery'
              || (typeof mediaSelectorTarget === 'object' && mediaSelectorTarget?.group === 'floorPlanGroups')
            }
            selectedUrls={getMediaSelectorSelectedUrls()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
