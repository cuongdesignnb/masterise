'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import { SystemSetting } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon, 
  HelpCircle, 
  Calendar, 
  Briefcase,
  Building2,
  Newspaper,
  Eye,
  EyeOff,
  Send,
  Search,
  FileText,
  BookOpen
} from 'lucide-react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import { defaultCollections } from '@/data/collectionsSeed';
import { pageService } from '@/services/pageService';
import { postService } from '@/services/postService';
import { projectService } from '@/services/projectService';

// Interfaces for structured settings
interface SlideItem {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface DepartmentItem {
  name: string;
  phone: string;
  email: string;
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'homepage' | 'about' | 'contact' | 'projects_page' | 'news_page' | 'smtp' | 'footer'>('general');
  const [mediaTarget, setMediaTarget] = useState<{ type: 'logo' | 'slide' | 'projects_hero_image' | 'projects_cta_image' | 'news_hero_image' | 'about_hero_image' | 'about_intro_image_0' | 'about_intro_image_1' | 'about_intro_image_2' | 'about_sustainability_image' | 'about_brand_story_image' | 'about_contact_cta_image' | 'about_collection_image'; index?: number } | null>(null);

  const [footerNavigation, setFooterNavigation] = useState<{ title: string; links: { label: string; href: string }[] }[]>([]);
  const [suggestTarget, setSuggestTarget] = useState<{ colIdx: number; linkIdx: number } | null>(null);
  const [suggestActiveTab, setSuggestActiveTab] = useState<'pages' | 'filters' | 'projects' | 'posts'>('pages');
  const [suggestSearch, setSuggestSearch] = useState('');

  // Fetch project categories for suggestions
  const { data: projectCategoriesData = [] } = useQuery({
    queryKey: ['admin-project-categories-select'],
    queryFn: async () => {
      const response = await api.get<{ id: number; name: string; slug: string }[]>('/project-categories');
      return response.data || [];
    }
  });

  // Fetch static pages for suggestions
  const { data: staticPagesData = [] } = useQuery({
    queryKey: ['admin-static-pages-select'],
    queryFn: async () => {
      const response = await pageService.getPages({ per_page: 100, status: 'published' });
      return response.data || [];
    }
  });

  // Fetch projects for suggestions
  const { data: projectsData = [] } = useQuery({
    queryKey: ['admin-projects-select'],
    queryFn: async () => {
      return await projectService.getProjects({ per_page: '100' });
    }
  });

  // Fetch post categories for suggestions
  const { data: postCategoriesData = [] } = useQuery({
    queryKey: ['admin-post-categories-select'],
    queryFn: async () => {
      const response = await api.get<{ id: number; name: string; slug: string }[]>('/post-categories');
      return response.data || [];
    }
  });

  // Fetch posts for suggestions
  const { data: postsResponse } = useQuery({
    queryKey: ['admin-posts-select'],
    queryFn: async () => {
      const response = await postService.getPosts({ per_page: 100, status: 'published' });
      return response;
    }
  });
  const postsData = (postsResponse?.data || []) as any[];

  // Form States
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [hotline, setHotline] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // SMTP settings states
  const [mailHost, setMailHost] = useState('');
  const [mailPort, setMailPort] = useState('587');
  const [mailUsername, setMailUsername] = useState('');
  const [mailPassword, setMailPassword] = useState('');
  const [mailEncryption, setMailEncryption] = useState('tls');
  const [mailFromAddress, setMailFromAddress] = useState('');
  const [mailFromName, setMailFromName] = useState('');
  const [mailReceiveAddress, setMailReceiveAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [zaloUrl, setZaloUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const [aboutMission, setAboutMission] = useState('');
  const [aboutVision, setAboutVision] = useState('');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // Projects Page states
  const [projectsHeroBadge, setProjectsHeroBadge] = useState('');
  const [projectsHeroTitle, setProjectsHeroTitle] = useState('');
  const [projectsHeroDesc, setProjectsHeroDesc] = useState('');
  const [projectsHeroPrimaryCta, setProjectsHeroPrimaryCta] = useState('');
  const [projectsHeroSecondaryCta, setProjectsHeroSecondaryCta] = useState('');
  const [projectsBrochureUrl, setProjectsBrochureUrl] = useState('');
  const [projectsHeroImage, setProjectsHeroImage] = useState('');
  const [projectsStats, setProjectsStats] = useState<{ value: string; label: string }[]>([
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
  ]);

  const [projectsCtaLabel, setProjectsCtaLabel] = useState('');
  const [projectsCtaTitle, setProjectsCtaTitle] = useState('');
  const [projectsCtaPrimaryBtn, setProjectsCtaPrimaryBtn] = useState('');
  const [projectsCtaSecondaryBtn, setProjectsCtaSecondaryBtn] = useState('');
  const [projectsCtaImage, setProjectsCtaImage] = useState('');

  // News Page states
  const [newsHeroBadge, setNewsHeroBadge] = useState('');
  const [newsHeroTitle, setNewsHeroTitle] = useState('');
  const [newsHeroDesc, setNewsHeroDesc] = useState('');
  const [newsHeroPrimaryCta, setNewsHeroPrimaryCta] = useState('');
  const [newsHeroSecondaryCta, setNewsHeroSecondaryCta] = useState('');
  const [newsHeroImage, setNewsHeroImage] = useState('');
  
  const [newsHeroHighlightLabel, setNewsHeroHighlightLabel] = useState('');
  const [newsHeroHighlightTitle, setNewsHeroHighlightTitle] = useState('');
  const [newsHeroHighlightCta, setNewsHeroHighlightCta] = useState('');

  const [newsCtaTitle, setNewsCtaTitle] = useState('');
  const [newsCtaDesc, setNewsCtaDesc] = useState('');
  const [newsCtaButton, setNewsCtaButton] = useState('');

  // About Page states
  const [aboutHeroBadge, setAboutHeroBadge] = useState('');
  const [aboutHeroTitle, setAboutHeroTitle] = useState('');
  const [aboutHeroDesc, setAboutHeroDesc] = useState('');
  const [aboutHeroPrimaryCta, setAboutHeroPrimaryCta] = useState('');
  const [aboutHeroSecondaryCta, setAboutHeroSecondaryCta] = useState('');
  const [aboutHeroImage, setAboutHeroImage] = useState('');
  const [aboutHeroStats, setAboutHeroStats] = useState<{ value: string; label: string; icon: string }[]>([
    { value: '', label: '', icon: '' },
    { value: '', label: '', icon: '' },
    { value: '', label: '', icon: '' },
    { value: '', label: '', icon: '' },
  ]);

  const [aboutIntroLabel, setAboutIntroLabel] = useState('');
  const [aboutIntroTitle, setAboutIntroTitle] = useState('');
  const [aboutIntroParagraphs, setAboutIntroParagraphs] = useState<string[]>(['', '']);
  const [aboutIntroButton, setAboutIntroButton] = useState('');
  const [aboutIntroImages, setAboutIntroImages] = useState<string[]>(['', '', '']);

  const [aboutMetricsList, setAboutMetricsList] = useState<{ value: string; label: string; icon: string }[]>([
    { value: '', label: '', icon: '' },
    { value: '', label: '', icon: '' },
    { value: '', label: '', icon: '' },
    { value: '', label: '', icon: '' },
  ]);

  const [aboutValuesList, setAboutValuesList] = useState<{ title: string; description: string; icon: string }[]>([
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
  ]);

  const [aboutAwardsList, setAboutAwardsList] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ]);

  const [aboutEcoList, setAboutEcoList] = useState<{ title: string; description: string; image: string }[]>([
    { title: '', description: '', image: '' },
    { title: '', description: '', image: '' },
    { title: '', description: '', image: '' },
    { title: '', description: '', image: '' },
    { title: '', description: '', image: '' },
  ]);
  const [aboutPartnersList, setAboutPartnersList] = useState<string>('');

  const [aboutSustTitle, setAboutSustTitle] = useState('');
  const [aboutSustImage, setAboutSustImage] = useState('');
  const [aboutSustPillars, setAboutSustPillars] = useState<{ title: string; description: string; icon: string }[]>([
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
  ]);

  const [aboutWhyChooseList, setAboutWhyChooseList] = useState<{ title: string; description: string; icon: string }[]>([
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
    { title: '', description: '', icon: '' },
  ]);

  const [aboutBrandTitle, setAboutBrandTitle] = useState('');
  const [aboutBrandDesc, setAboutBrandDesc] = useState('');
  const [aboutBrandBtn, setAboutBrandBtn] = useState('');
  const [aboutBrandImage, setAboutBrandImage] = useState('');

  const [aboutFaqsList, setAboutFaqsList] = useState<{ question: string; answer: string }[]>([]);

  const [aboutContactCtaLabel, setAboutContactCtaLabel] = useState('');
  const [aboutContactCtaTitle, setAboutContactCtaTitle] = useState('');
  const [aboutContactCtaDesc, setAboutContactCtaDesc] = useState('');
  const [aboutContactCtaImage, setAboutContactCtaImage] = useState('');

  const [aboutCollectionsList, setAboutCollectionsList] = useState<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    features: string[];
    link: string;
  }[]>([]);

  const [aboutSubTab, setAboutSubTab] = useState<'hero' | 'intro' | 'vision_mission' | 'values_awards' | 'eco_sustainability' | 'brand_faq' | 'contact_cta' | 'collections'>('hero');

  // Fetch settings list
  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get<SystemSetting[]>('/settings');
      return response.data;
    },
  });

  // Populate form states when settings load
  React.useEffect(() => {
    if (settingsList.length > 0) {
      const getVal = (key: string, type: 'string' | 'json' = 'string') => {
        const item = settingsList.find(s => s.key === key);
        if (!item || !item.value) return type === 'json' ? [] : '';
        if (type === 'json') {
          try {
            return JSON.parse(item.value);
          } catch (e) {
            return [];
          }
        }
        return item.value;
      };

      setCompanyName(getVal('company_name'));
      setCompanyAddress(getVal('company_address'));
      setHotline(getVal('hotline'));
      setEmail(getVal('email'));
      setLogoUrl(getVal('logo_url'));

      setMailHost(getVal('mail_host'));
      setMailPort(getVal('mail_port') || '587');
      setMailUsername(getVal('mail_username'));
      setMailPassword(getVal('mail_password'));
      setMailEncryption(getVal('mail_encryption') || 'tls');
      setMailFromAddress(getVal('mail_from_address'));
      setMailFromName(getVal('mail_from_name'));
      setMailReceiveAddress(getVal('mail_receive_address'));

      const social = getVal('social_links', 'json');
      setFacebookUrl(social?.facebook || '');
      setYoutubeUrl(social?.youtube || '');
      setZaloUrl(social?.zalo || '');
      setInstagramUrl(social?.instagram || '');
      setLinkedinUrl(social?.linkedin || '');

      setSlides(getVal('homepage_slides', 'json') || []);
      setFaqs(getVal('homepage_faq', 'json') || []);

      setAboutMission(getVal('about_mission') || 'Masterise Homes cam kết mang đến những trải nghiệm sống khác biệt thông qua sản phẩm chất lượng, dịch vụ tận tâm và những giá trị bền vững cho khách hàng, đối tác và cộng đồng.');
      setAboutVision(getVal('about_vision') || 'Chúng tôi hướng đến việc kiến tạo những công trình biểu tượng, nâng tầm chất lượng sống và góp phần xây dựng các đô thị hiện đại, bền vững cho tương lai.');
      
      const dbTimeline = getVal('about_timeline', 'json');
      setTimeline(
        dbTimeline && dbTimeline.length > 0
          ? dbTimeline
          : [
              { year: '2014', title: 'Thành lập Masterise Group', description: '' },
              { year: '2016', title: 'Bước chân vào lĩnh vực bất động sản', description: '' },
              { year: '2018', title: 'Ra mắt thương hiệu Masterise Homes', description: '' },
              { year: '2020', title: 'Mở rộng quy mô với nhiều dự án biểu tượng', description: '' },
              { year: '2022', title: 'Khẳng định vị thế nhà phát triển BĐS hàng hiệu hàng đầu', description: '' },
              { year: '2024+', title: 'Tiếp tục kiến tạo giá trị sống chuẩn quốc tế', description: '' },
            ]
      );

      setDepartments(getVal('contact_departments', 'json') || []);

      const dbFooterNav = getVal('footer_navigation', 'json');
      setFooterNavigation(
        dbFooterNav && dbFooterNav.length > 0
          ? dbFooterNav
          : [
              {
                title: 'MASTERISE HOMES',
                links: [
                  { label: 'Trang chủ', href: '/' },
                  { label: 'Giới thiệu', href: '/gioi-thieu' },
                  { label: 'Dự án', href: '/du-an' },
                  { label: 'Tin tức', href: '/tin-tuc' },
                  { label: 'Đầu tư', href: '/dau-tu' },
                  { label: 'Liên hệ', href: '/lien-he' }
                ]
              },
              {
                title: 'DỰ ÁN',
                links: [
                  { label: 'Masterise Collection', href: '/du-an?category=masterise-colletion' },
                  { label: 'Lumiere Series', href: '/du-an?category=lumiere-series' },
                  { label: 'Sắp mở bán', href: '/du-an?sales_status=coming_soon' },
                  { label: 'Đang mở bán', href: '/du-an?sales_status=selling' }
                ]
              },
              {
                title: 'THÔNG TIN',
                links: [
                  { label: 'Tin tức', href: '/tin-tuc' },
                  { label: 'Đầu tư', href: '/dau-tu' },
                  { label: 'Chuyên trang', href: '/chuyen-trang' },
                  { label: 'Chính sách bảo mật', href: '/chuyen-trang/chinh-sach-bao-mat' },
                  { label: 'Điều khoản sử dụng', href: '/chuyen-trang/dieu-khoan-su-dung' }
                ]
              }
            ]
      );

      // Projects Page Hero
      const projHero = getVal('projects_page_hero', 'json');
      setProjectsHeroBadge(projHero?.badge || 'DANH MỤC DỰ ÁN');
      setProjectsHeroTitle(projHero?.title || 'Khám phá bộ sưu tập dự án Masterise Homes');
      setProjectsHeroDesc(projHero?.description || 'Tuyển chọn những dự án bất động sản hàng hiệu tại các vị trí chiến lược, kiến tạo chuẩn sống quốc tế và giá trị bền vững cho tương lai.');
      setProjectsHeroPrimaryCta(projHero?.primaryCta || 'Khám phá dự án');
      setProjectsHeroSecondaryCta(projHero?.secondaryCta || 'Tải brochure tổng hợp');
      setProjectsBrochureUrl(projHero?.brochureUrl || '');
      setProjectsHeroImage(projHero?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1400&auto=format&fit=crop');
      setProjectsStats(projHero?.overview || [
        { value: '15+', label: 'Dự án đang triển khai' },
        { value: '30.000+', label: 'Sản phẩm điển hình' },
        { value: '8', label: 'Tỉnh & Thành phố' },
        { value: '100+', label: 'Giải thưởng quốc tế' },
      ]);

      // Projects Page CTA
      const projCta = getVal('projects_page_cta', 'json');
      setProjectsCtaLabel(projCta?.label || 'TƯ VẤN DỰ ÁN MIỄN PHÍ');
      setProjectsCtaTitle(projCta?.title || 'Nhận tư vấn lựa chọn dự án phù hợp và báo giá tốt nhất từ chuyên gia');
      setProjectsCtaPrimaryBtn(projCta?.primaryButton || 'Nhận tư vấn ngay');
      setProjectsCtaSecondaryBtn(projCta?.secondaryButton || 'Tải catalogue dự án');
      setProjectsCtaImage(projCta?.image || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop');

      // News Page Hero
      const nHero = getVal('news_page_hero', 'json');
      setNewsHeroBadge(nHero?.badge || 'CẬP NHẬT MỚI NHẤT');
      setNewsHeroTitle(nHero?.title || 'Tin tức & Góc nhìn thị trường');
      setNewsHeroDesc(nHero?.description || 'Cập nhật những thông tin mới nhất về dự án, xu hướng thị trường, pháp lý, kiến trúc và phong cách sống từ Masterise Homes.');
      setNewsHeroPrimaryCta(nHero?.primaryCta || 'Khám phá bài viết mới nhất');
      setNewsHeroSecondaryCta(nHero?.secondaryCta || 'Nhận bản tin định kỳ');
      setNewsHeroImage(nHero?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop');
      setNewsHeroHighlightLabel(nHero?.highlight?.label || 'Điểm nhấn hôm nay');
      setNewsHeroHighlightTitle(nHero?.highlight?.title || 'The Global City: Tiếp tục khẳng định vị thế trung tâm mới của TP. Thủ Đức');
      setNewsHeroHighlightCta(nHero?.highlight?.cta || 'Đọc ngay');

      // News Page CTA
      const nCta = getVal('news_page_cta', 'json');
      setNewsCtaTitle(nCta?.title || 'Đồng hành cùng Masterise Homes');
      setNewsCtaDesc(nCta?.description || 'Khám phá các dự án biểu tượng và phong cách sống khác biệt được kiến tạo bởi Masterise Homes.');
      setNewsCtaButton(nCta?.button || 'Khám phá dự án');

      // About Page Hero
      const aHero = getVal('about_page_hero', 'json');
      setAboutHeroBadge(aHero?.badge || 'KIẾN TẠO CHUẨN SỐNG QUỐC TẾ');
      setAboutHeroTitle(aHero?.title || 'Về Masterise Homes');
      setAboutHeroDesc(aHero?.description || 'Kiến tạo những không gian sống hàng hiệu, nâng tầm trải nghiệm và giá trị sống của người Việt, góp phần định hình diện mạo đô thị hiện đại và bền vững.');
      setAboutHeroPrimaryCta(aHero?.primaryCta || 'Khám phá hành trình');
      setAboutHeroSecondaryCta(aHero?.secondaryCta || 'Khám phá dự án');
      setAboutHeroImage(aHero?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop');
      setAboutHeroStats(aHero?.statsCard || [
        { value: '10+', label: 'Năm kinh nghiệm phát triển BĐS', icon: 'BadgeCheck' },
        { value: '60+', label: 'Dự án đã triển khai trên toàn quốc', icon: 'Building2' },
        { value: '50.000+', label: 'Khách hàng tin tưởng và lựa chọn', icon: 'UsersRound' },
        { value: '20+', label: 'Tỉnh & Thành phố hiện diện', icon: 'Map' },
      ]);

      // About Page Intro & Metrics
      const aIntro = getVal('about_page_intro', 'json');
      setAboutIntroLabel(aIntro?.label || 'VỀ MASTERISE HOMES');
      setAboutIntroTitle(aIntro?.title || 'Kiến tạo chuẩn sống quốc tế tại Việt Nam');
      setAboutIntroParagraphs(aIntro?.paragraphs || [
        'Masterise Homes là nhà phát triển bất động sản hàng hiệu tiên phong tại Việt Nam, thuộc Masterise Group. Chúng tôi không ngừng kiến tạo những sản phẩm và dịch vụ xuất sắc, mang trải nghiệm sống xứng tầm quốc tế đến với khách hàng.',
        'Với triết lý Customer Centricity và năng lực quốc tế, Masterise Homes hợp tác cùng các đối tác danh tiếng thế giới để phát triển những công trình biểu tượng, bền vững theo thời gian, góp phần nâng tầm chất lượng sống và giá trị cộng đồng.'
      ]);
      setAboutIntroButton(aIntro?.button || 'Tìm hiểu thêm về chúng tôi');
      setAboutIntroImages(aIntro?.images || [
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=80&w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=900&auto=format&fit=crop'
      ]);

      const aMetrics = getVal('about_page_metrics', 'json');
      setAboutMetricsList(aMetrics.length > 0 ? aMetrics : [
        { value: "10+", label: "Năm kinh nghiệm", icon: "CalendarCheck" },
        { value: "60+", label: "Dự án đã triển khai", icon: "Building2" },
        { value: "50.000+", label: "Khách hàng tin tưởng", icon: "UsersRound" },
        { value: "20+", label: "Tỉnh & Thành phố", icon: "MapPinned" },
      ]);

      // About Page Values & Awards
      const aValues = getVal('about_page_values', 'json');
      setAboutValuesList(aValues.length > 0 ? aValues : [
        { title: "Khách hàng là trung tâm", description: "Thấu hiểu và đặt lợi ích khách hàng lên hàng đầu.", icon: "HeartHandshake" },
        { title: "Chất lượng xuất sắc", description: "Cam kết chất lượng trong từng sản phẩm và dịch vụ.", icon: "Gem" },
        { title: "Đổi mới sáng tạo", description: "Không ngừng đổi mới để kiến tạo giá trị khác biệt.", icon: "Sparkles" },
        { title: "Tinh thần hợp tác", description: "Hợp tác bền vững cùng đối tác và cộng đồng.", icon: "Handshake" },
        { title: "Phát triển bền vững", description: "Hài hòa giữa phát triển kinh tế, môi trường và xã hội.", icon: "Leaf" },
        { title: "Chính trực minh bạch", description: "Hành động minh bạch, trung thực và trách nhiệm.", icon: "ShieldCheck" },
      ]);

      const aAwards = getVal('about_page_awards', 'json');
      setAboutAwardsList(aAwards.length > 0 ? aAwards : [
        { title: "Top 10", description: "Nhà phát triển bất động sản hàng đầu Việt Nam giai đoạn 2019–2022." },
        { title: "Vietnam Property Awards", description: "Nhà phát triển BĐS hạng sang tốt nhất Việt Nam." },
        { title: "DOT Property Vietnam Awards", description: "Best Luxury Developer Vietnam." },
        { title: "Asia Pacific Property Awards", description: "Nhiều giải thưởng danh giá khu vực Châu Á – Thái Bình Dương." },
        { title: "Forbes Vietnam Top 50", description: "Ghi nhận năng lực thương hiệu và tăng trưởng bền vững." }
      ]);

      // About Page Ecosystem & Partners
      const aEco = getVal('about_page_ecosystem', 'json');
      setAboutEcoList(aEco?.ecosystem || [
        { title: "Căn hộ hạng sang", description: "Không gian sống đẳng cấp, tiện ích chuẩn quốc tế.", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=900&auto=format&fit=crop" },
        { title: "Biệt thự cao cấp", description: "Kiến trúc tinh tế, không gian sống riêng tư và sang trọng.", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=900&auto=format&fit=crop" },
        { title: "Shophouse", description: "Vị trí đắc địa, gia tăng giá trị đầu tư bền vững.", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=900&auto=format&fit=crop" },
        { title: "Branded Residences", description: "Bất động sản hàng hiệu, xứng tầm quốc tế.", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=900&auto=format&fit=crop" },
        { title: "Bất động sản nghỉ dưỡng", description: "Trải nghiệm nghỉ dưỡng đẳng cấp, hòa mình thiên nhiên.", image: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=80&w=900&auto=format&fit=crop" }
      ]);
      const partnersList = aEco?.partners || ["Marriott International", "Techcombank", "Samsung", "Mace", "KONE", "AkzoNobel"];
      setAboutPartnersList(partnersList.join(', '));

      // About Page Project Collections
      const aCol = getVal('about_page_collections', 'json');
      setAboutCollectionsList(aCol && aCol.length > 0 ? aCol : defaultCollections);

      // About Page Sustainability & Why Choose
      const aSust = getVal('about_page_sustainability', 'json');
      setAboutSustTitle(aSust?.title || 'Phát triển bền vững – Cam kết vì tương lai');
      setAboutSustImage(aSust?.image || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop');
      setAboutSustPillars(aSust?.pillars || [
        { title: "Môi trường xanh", description: "Ứng dụng giải pháp xanh, tiết kiệm năng lượng và vật liệu thân thiện môi trường trong tất cả dự án.", icon: "Leaf" },
        { title: "Trách nhiệm cộng đồng", description: "Đồng hành cùng cộng đồng qua các hoạt động giáo dục, y tế, an sinh và phát triển bền vững.", icon: "UsersRound" },
        { title: "Quản trị minh bạch", description: "Quản trị doanh nghiệp minh bạch, tuân thủ chuẩn mực quốc tế và pháp luật.", icon: "SearchCheck" }
      ]);

      const aWhyChoose = getVal('about_page_why_choose', 'json');
      setAboutWhyChooseList(aWhyChoose.length > 0 ? aWhyChoose : [
        { title: "Thương hiệu uy tín", description: "Thuộc Masterise Group", icon: "BadgeCheck" },
        { title: "Sản phẩm hàng hiệu", description: "Chất lượng vượt trội", icon: "Gem" },
        { title: "Vị trí đắc địa", description: "Kết nối thuận tiện", icon: "MapPin" },
        { title: "Tiện ích đẳng cấp", description: "Trải nghiệm khác biệt", icon: "Sparkles" },
        { title: "Tiềm năng tăng giá", description: "Bền vững", icon: "TrendingUp" },
        { title: "Dịch vụ tận tâm", description: "Đồng hành dài lâu", icon: "Handshake" }
      ]);

      // About Page Brand Story & FAQs
      const aBrand = getVal('about_page_brand_story', 'json');
      setAboutBrandTitle(aBrand?.title || 'Câu chuyện thương hiệu');
      setAboutBrandDesc(aBrand?.description || 'Mỗi công trình của Masterise Homes là kết tinh của tầm nhìn, đam mê và khát vọng nâng tầm chuẩn sống của người Việt. Chúng tôi không chỉ xây dựng nhà, mà kiến tạo phong cách sống, những cộng đồng thịnh vượng và di sản bền vững cho tương lai.');
      setAboutBrandBtn(aBrand?.button || 'Khám phá thêm');
      setAboutBrandImage(aBrand?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop');

      const aFaqs = getVal('about_page_faqs', 'json');
      setAboutFaqsList(aFaqs.length > 0 ? aFaqs : [
        { question: "Masterise Homes là ai?", answer: "Masterise Homes là nhà phát triển bất động sản hàng hiệu tại Việt Nam, tập trung kiến tạo các không gian sống cao cấp, bền vững và chuẩn quốc tế." },
        { question: "Masterise Homes phát triển những loại hình bất động sản nào?", answer: "Masterise Homes phát triển căn hộ hạng sang, biệt thự, shophouse, branded residences và bất động sản nghỉ dưỡng." },
        { question: "Các dự án của Masterise Homes có gì khác biệt?", answer: "Các dự án chú trọng vị trí chiến lược, thiết kế cao cấp, tiện ích toàn diện, vận hành chuyên nghiệp và giá trị bền vững." },
        { question: "Quy trình mua nhà tại Masterise Homes như thế nào?", answer: "Khách hàng được tư vấn sản phẩm, tham quan dự án, nhận chính sách bán hàng và thực hiện giao dịch theo quy trình minh bạch." },
        { question: "Chính sách bảo hành và dịch vụ hậu mãi ra sao?", answer: "Masterise Homes chú trọng dịch vụ hậu mãi, bảo hành and chăm sóc khách hàng theo từng dự án và chính sách công bố." }
      ]);

      // About Page Contact CTA
      const aContactCta = getVal('about_page_contact_cta', 'json');
      setAboutContactCtaLabel(aContactCta?.label || 'LIÊN HỆ TƯ VẤN');
      setAboutContactCtaTitle(aContactCta?.title || 'Đồng hành cùng bạn kiến tạo chuẩn sống');
      setAboutContactCtaDesc(aContactCta?.description || 'Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng giải đáp và tư vấn giải pháp phù hợp nhất.');
      setAboutContactCtaImage(aContactCta?.image || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop');
    }
  }, [settingsList]);

  // Bulk update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        settings: [
          { key: 'company_name', value: companyName, type: 'string' },
          { key: 'company_address', value: companyAddress, type: 'string' },
          { key: 'hotline', value: hotline, type: 'string' },
          { key: 'email', value: email, type: 'string' },
          { key: 'logo_url', value: logoUrl, type: 'string' },
          { key: 'mail_host', value: mailHost, type: 'string' },
          { key: 'mail_port', value: mailPort, type: 'string' },
          { key: 'mail_username', value: mailUsername, type: 'string' },
          { key: 'mail_password', value: mailPassword, type: 'string' },
          { key: 'mail_encryption', value: mailEncryption, type: 'string' },
          { key: 'mail_from_address', value: mailFromAddress, type: 'string' },
          { key: 'mail_from_name', value: mailFromName, type: 'string' },
          { key: 'mail_receive_address', value: mailReceiveAddress, type: 'string' },
          { 
            key: 'social_links', 
            value: { facebook: facebookUrl, youtube: youtubeUrl, zalo: zaloUrl, instagram: instagramUrl, linkedin: linkedinUrl }, 
            type: 'json' 
          },
          { key: 'homepage_slides', value: slides, type: 'json' },
          { key: 'homepage_faq', value: faqs, type: 'json' },
          { key: 'about_mission', value: aboutMission, type: 'string' },
          { key: 'about_vision', value: aboutVision, type: 'string' },
          { key: 'about_timeline', value: timeline, type: 'json' },
          { key: 'contact_departments', value: departments, type: 'json' },
          { 
            key: 'projects_page_hero', 
            value: { 
              breadcrumb: ["Trang chủ", "Dự án"], 
              badge: projectsHeroBadge, 
              title: projectsHeroTitle, 
              description: projectsHeroDesc, 
              primaryCta: projectsHeroPrimaryCta, 
              secondaryCta: projectsHeroSecondaryCta, 
              brochureUrl: projectsBrochureUrl,
              image: projectsHeroImage,
              overview: projectsStats
            }, 
            type: 'json' 
          },
          { 
            key: 'projects_page_cta', 
            value: { 
              label: projectsCtaLabel, 
              title: projectsCtaTitle, 
              primaryButton: projectsCtaPrimaryBtn, 
              secondaryButton: projectsCtaSecondaryBtn, 
              brochureUrl: projectsBrochureUrl,
              image: projectsCtaImage 
            }, 
            type: 'json' 
          },
          { 
            key: 'news_page_hero', 
            value: { 
              breadcrumb: ["Trang chủ", "Tin tức"], 
              badge: newsHeroBadge, 
              title: newsHeroTitle, 
              description: newsHeroDesc, 
              primaryCta: newsHeroPrimaryCta, 
              secondaryCta: newsHeroSecondaryCta, 
              image: newsHeroImage,
              highlight: {
                label: newsHeroHighlightLabel,
                title: newsHeroHighlightTitle,
                cta: newsHeroHighlightCta
              }
            }, 
            type: 'json' 
          },
          { 
            key: 'news_page_cta', 
            value: { 
              title: newsCtaTitle, 
              description: newsCtaDesc, 
              button: newsCtaButton 
            }, 
            type: 'json' 
          },
          {
            key: 'about_page_hero',
            value: {
              breadcrumb: ["Trang chủ", "Giới thiệu"],
              badge: aboutHeroBadge,
              title: aboutHeroTitle,
              description: aboutHeroDesc,
              primaryCta: aboutHeroPrimaryCta,
              secondaryCta: aboutHeroSecondaryCta,
              image: aboutHeroImage,
              statsCard: aboutHeroStats
            },
            type: 'json'
          },
          {
            key: 'about_page_intro',
            value: {
              label: aboutIntroLabel,
              title: aboutIntroTitle,
              paragraphs: aboutIntroParagraphs,
              button: aboutIntroButton,
              images: aboutIntroImages
            },
            type: 'json'
          },
          {
            key: 'about_page_metrics',
            value: aboutMetricsList,
            type: 'json'
          },
          {
            key: 'about_page_values',
            value: aboutValuesList,
            type: 'json'
          },
          {
            key: 'about_page_awards',
            value: aboutAwardsList,
            type: 'json'
          },
          {
            key: 'about_page_ecosystem',
            value: {
              ecosystem: aboutEcoList,
              partners: aboutPartnersList.split(',').map(s => s.trim()).filter(Boolean)
            },
            type: 'json'
          },
          {
            key: 'about_page_collections',
            value: aboutCollectionsList,
            type: 'json'
          },
          {
            key: 'about_page_sustainability',
            value: {
              title: aboutSustTitle,
              image: aboutSustImage,
              pillars: aboutSustPillars
            },
            type: 'json'
          },
          {
            key: 'about_page_why_choose',
            value: aboutWhyChooseList,
            type: 'json'
          },
          {
            key: 'about_page_brand_story',
            value: {
              title: aboutBrandTitle,
              description: aboutBrandDesc,
              button: aboutBrandBtn,
              image: aboutBrandImage
            },
            type: 'json'
          },
          {
            key: 'about_page_faqs',
            value: aboutFaqsList,
            type: 'json'
          },
          {
            key: 'about_page_contact_cta',
            value: {
              label: aboutContactCtaLabel,
              title: aboutContactCtaTitle,
              description: aboutContactCtaDesc,
              image: aboutContactCtaImage
            },
            type: 'json'
          },
          {
            key: 'footer_navigation',
            value: footerNavigation,
            type: 'json'
          }
        ]
      };

      return api.put('/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      toast.success('Đã lưu tất cả các cấu hình cài đặt thành công!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi cập nhật cài đặt.');
    }
  });

  const handleTestEmail = async () => {
    if (!mailHost || !mailPort || !mailUsername || !mailPassword || !mailReceiveAddress) {
      toast.warning('Vui lòng điền đầy đủ các thông tin: Máy chủ, Cổng, Tài khoản, Mật khẩu và Email nhận để chạy thử nghiệm.');
      return;
    }

    setTestEmailLoading(true);
    try {
      const response = await api.post('/settings/test-email', {
        mail_host: mailHost,
        mail_port: mailPort,
        mail_username: mailUsername,
        mail_password: mailPassword,
        mail_encryption: mailEncryption,
        mail_from_address: mailFromAddress,
        mail_from_name: mailFromName,
        mail_receive_address: mailReceiveAddress
      });

      if (response.success) {
        toast.success(response.message || 'Gửi email thử nghiệm thành công! Vui lòng kiểm tra hộp thư của bạn.');
      } else {
        toast.error('Gửi email thử nghiệm thất bại: ' + (response.message || 'Lỗi không xác định'));
      }
    } catch (err: any) {
      toast.error('Lỗi thử nghiệm SMTP: ' + (err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ SMTP.'));
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Media selector callback
  const handleMediaSelected = (url: string | string[]) => {
    if (!mediaTarget) return;
    if (mediaTarget.type === 'logo') {
      setLogoUrl(url as string);
    } else if (mediaTarget.type === 'slide' && mediaTarget.index !== undefined) {
      const idx = mediaTarget.index;
      setSlides(prev => prev.map((s, i) => i === idx ? { ...s, image: url as string } : s));
    } else if (mediaTarget.type === 'projects_hero_image') {
      setProjectsHeroImage(url as string);
    } else if (mediaTarget.type === 'projects_cta_image') {
      setProjectsCtaImage(url as string);
    } else if (mediaTarget.type === 'news_hero_image') {
      setNewsHeroImage(url as string);
    } else if (mediaTarget.type === 'about_hero_image') {
      setAboutHeroImage(url as string);
    } else if (mediaTarget.type === 'about_intro_image_0') {
      setAboutIntroImages(prev => prev.map((img, i) => i === 0 ? (url as string) : img));
    } else if (mediaTarget.type === 'about_intro_image_1') {
      setAboutIntroImages(prev => prev.map((img, i) => i === 1 ? (url as string) : img));
    } else if (mediaTarget.type === 'about_intro_image_2') {
      setAboutIntroImages(prev => prev.map((img, i) => i === 2 ? (url as string) : img));
    } else if (mediaTarget.type === 'about_sustainability_image') {
      setAboutSustImage(url as string);
    } else if (mediaTarget.type === 'about_brand_story_image') {
      setAboutBrandImage(url as string);
    } else if (mediaTarget.type === 'about_contact_cta_image') {
      setAboutContactCtaImage(url as string);
    } else if (mediaTarget.type === 'about_collection_image' && mediaTarget.index !== undefined) {
      const idx = mediaTarget.index;
      setAboutCollectionsList(prev => prev.map((col, i) => i === idx ? { ...col, image: url as string } : col));
    }
  };

  // List Builders functions
  const addSlide = () => {
    setSlides([...slides, { title: '', subtitle: '', image: '', link: '' }]);
  };

  const removeSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const handleSlideChange = (idx: number, field: keyof SlideItem, val: string) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleFaqChange = (idx: number, field: keyof FaqItem, val: string) => {
    setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };

  const addTimeline = () => {
    setTimeline([...timeline, { year: '', title: '', description: '' }]);
  };

  const removeTimeline = (idx: number) => {
    setTimeline(timeline.filter((_, i) => i !== idx));
  };

  const handleTimelineChange = (idx: number, field: keyof TimelineItem, val: string) => {
    setTimeline(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };

  const addDepartment = () => {
    setDepartments([...departments, { name: '', phone: '', email: '' }]);
  };

  const removeDepartment = (idx: number) => {
    setDepartments(departments.filter((_, i) => i !== idx));
  };

  const handleDepartmentChange = (idx: number, field: keyof DepartmentItem, val: string) => {
    setDepartments(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Cài đặt hệ thống</h1>
          <p className="text-sm text-[#8C7A6B]">Quản lý thông tin doanh nghiệp, banner trang chủ, lịch sử phát triển và các phòng ban liên hệ</p>
        </div>
        <button
          onClick={() => updateSettingsMutation.mutate()}
          disabled={updateSettingsMutation.isPending}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] hover:bg-[#1F1B16] text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateSettingsMutation.isPending ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-1.5 text-xs overflow-x-auto select-none gap-1 shrink-0">
        {[
          { id: 'general', label: 'Thông tin chung & MXH', icon: Settings },
          { id: 'homepage', label: 'Cấu hình Trang chủ', icon: ImageIcon },
          { id: 'about', label: 'Cấu hình Giới thiệu', icon: Calendar },
          { id: 'contact', label: 'Cấu hình Liên hệ', icon: Briefcase },
          { id: 'projects_page', label: 'Cấu hình trang Dự án', icon: Building2 },
          { id: 'news_page', label: 'Cấu hình trang Tin tức', icon: Newspaper },
          { id: 'smtp', label: 'Cấu hình SMTP & Email', icon: Mail },
          { id: 'footer', label: 'Cấu hình Footer', icon: LinkIcon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#B88746] shadow-sm'
                  : 'text-[#8C7A6B] hover:text-[#1F1B16] hover:bg-white/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Form Card */}
      {isLoading ? (
        <div className="p-20 text-center bg-white border border-[#E8DCCB] rounded-2xl flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-3 border-[#B88746] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#8C7A6B]">Đang tải cấu hình cài đặt...</span>
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: General & Contact Info */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B88746]" />
                Thông tin doanh nghiệp chính
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên công ty *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Ví dụ: Công ty Cổ phần Masterise Homes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Số hotline (Tổng đài) *</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Ví dụ: 028 39159159"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Địa chỉ trụ sở *</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="Địa chỉ trụ sở chính..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Email liên hệ chung *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="info@masterisehomes.com"
                  />
                </div>
              </div>

              {/* Logo Company */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#8C7A6B]">Logo công ty</label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-16 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] overflow-hidden flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Company Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#B88746]/40" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-xs focus:outline-none"
                      placeholder="URL logo công ty"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaTarget({ type: 'logo' })}
                      className="px-3 py-1.5 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Chọn logo từ Thư viện
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 pt-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#B88746]" />
                Kênh Mạng xã hội (Social Media)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Trang Facebook (URL)</label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Kênh Youtube (URL)</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tài khoản Zalo (URL/Sđt)</label>
                  <input
                    type="text"
                    value={zaloUrl}
                    onChange={(e) => setZaloUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://zalo.me/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Instagram (URL)</label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">LinkedIn (URL)</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Homepage Config */}
          {activeTab === 'homepage' && (
            <div className="space-y-8">
              
              {/* Homepage Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                  <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#B88746]" />
                    Banner Hero Slider (Trang chủ)
                  </h3>
                  <button
                    type="button"
                    onClick={addSlide}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Banner Slide
                  </button>
                </div>

                {slides.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                    Chưa có banner nào. Hãy nhấn nút để thêm slide.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slides.map((slide, idx) => (
                      <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 grid grid-cols-1 md:grid-cols-12 gap-4 relative group">
                        
                        {/* Slide Image selection */}
                        <div className="md:col-span-3 space-y-2">
                          <div className="aspect-video w-full rounded-lg border border-[#E8DCCB] bg-white overflow-hidden flex items-center justify-center relative">
                            {slide.image ? (
                              <img src={slide.image} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-[#B88746]/40" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setMediaTarget({ type: 'slide', index: idx })}
                            className="w-full px-2 py-1 bg-white hover:bg-gray-100 border border-[#E8DCCB] text-[10px] font-bold rounded text-center transition-colors"
                          >
                            Chọn ảnh Banner
                          </button>
                        </div>

                        {/* Slide Info */}
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-0.5">Tiêu đề Banner</label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Tiêu đề chính lớn..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-0.5">Mô tả phụ</label>
                            <input
                              type="text"
                              value={slide.subtitle}
                              onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Dòng chữ phụ phía trên..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-0.5">Link liên kết nút (URL)</label>
                            <input
                              type="text"
                              value={slide.link}
                              onChange={(e) => handleSlideChange(idx, 'link', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Ví dụ: /du-an/the-global-city"
                            />
                          </div>
                        </div>

                        {/* Action delete */}
                        <div className="md:col-span-1 flex items-center justify-end md:justify-center">
                          <button
                            type="button"
                            onClick={() => removeSlide(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa banner slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQs Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2 pt-4">
                  <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#B88746]" />
                    Câu hỏi thường gặp FAQs (Trang chủ)
                  </h3>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Câu hỏi
                  </button>
                </div>

                {faqs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                    Chưa có câu hỏi nào. Nhấn để tạo mới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <div>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white font-semibold focus:outline-none"
                              placeholder="Câu hỏi: Ví dụ: Masterise Homes là ai?"
                            />
                          </div>
                          <div>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              placeholder="Câu trả lời cụ thể..."
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: About Us Config */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Sub-tabs selector for About page */}
              <div className="flex bg-[#FBF8F2] border border-[#E8DCCB] rounded-xl p-1 text-xs overflow-x-auto select-none gap-1 shrink-0">
                {[
                  { id: 'hero', label: '1. Banner & Stats', icon: ImageIcon },
                  { id: 'intro', label: '2. Giới thiệu & Số liệu', icon: Settings },
                  { id: 'vision_mission', label: '3. Tầm nhìn & Cột mốc', icon: Calendar },
                  { id: 'values_awards', label: '4. Giá trị & Giải thưởng', icon: HelpCircle },
                  { id: 'eco_sustainability', label: '5. Hệ sinh thái & Bền vững', icon: Briefcase },
                  { id: 'brand_faq', label: '6. Câu chuyện & FAQs', icon: HelpCircle },
                  { id: 'contact_cta', label: '7. Banner liên hệ', icon: Mail },
                  { id: 'collections', label: '8. Dòng sản phẩm', icon: Building2 },
                ].map(sub => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setAboutSubTab(sub.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        aboutSubTab === sub.id
                          ? 'bg-white text-[#B88746] shadow-sm'
                          : 'text-[#8C7A6B] hover:text-[#1F1B16] hover:bg-white/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              {/* Sub-tab 1: Hero */}
              {aboutSubTab === 'hero' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">1. Banner đầu trang & Stats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Badge (Nhãn nhỏ)</label>
                      <input
                        type="text"
                        value={aboutHeroBadge}
                        onChange={(e) => setAboutHeroBadge(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh nền Banner</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aboutHeroImage}
                          onChange={(e) => setAboutHeroImage(e.target.value)}
                          className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaTarget({ type: 'about_hero_image' })}
                          className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                        >
                          Chọn ảnh
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề Banner chính</label>
                      <input
                        type="text"
                        value={aboutHeroTitle}
                        onChange={(e) => setAboutHeroTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả chi tiết</label>
                      <textarea
                        value={aboutHeroDesc}
                        onChange={(e) => setAboutHeroDesc(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nút hành động chính</label>
                      <input
                        type="text"
                        value={aboutHeroPrimaryCta}
                        onChange={(e) => setAboutHeroPrimaryCta(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nút hành động phụ</label>
                      <input
                        type="text"
                        value={aboutHeroSecondaryCta}
                        onChange={(e) => setAboutHeroSecondaryCta(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h5 className="text-xs font-bold text-[#1F1B16] mb-3">Thông số nổi bật trên banner (4 stats card)</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {aboutHeroStats.map((stat, idx) => (
                        <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 space-y-2">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Số liệu</label>
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...aboutHeroStats];
                                newStats[idx].value = e.target.value;
                                setAboutHeroStats(newStats);
                              }}
                              className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Nhãn mô tả</label>
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...aboutHeroStats];
                                newStats[idx].label = e.target.value;
                                setAboutHeroStats(newStats);
                              }}
                              className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Icon (tên lucide-react)</label>
                            <input
                              type="text"
                              value={stat.icon}
                              onChange={(e) => {
                                const newStats = [...aboutHeroStats];
                                newStats[idx].icon = e.target.value;
                                setAboutHeroStats(newStats);
                              }}
                              className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Intro & Metrics */}
              {aboutSubTab === 'intro' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">2. Giới thiệu chung & Số liệu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn tiêu đề nhỏ</label>
                      <input
                        type="text"
                        value={aboutIntroLabel}
                        onChange={(e) => setAboutIntroLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút hành động</label>
                      <input
                        type="text"
                        value={aboutIntroButton}
                        onChange={(e) => setAboutIntroButton(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề chính phần giới thiệu</label>
                      <input
                        type="text"
                        value={aboutIntroTitle}
                        onChange={(e) => setAboutIntroTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-xs font-semibold text-[#8C7A6B] -mb-1">Các đoạn văn bản giới thiệu</label>
                      {aboutIntroParagraphs.map((para, idx) => (
                        <textarea
                          key={idx}
                          value={para}
                          onChange={(e) => {
                            const newParas = [...aboutIntroParagraphs];
                            newParas[idx] = e.target.value;
                            setAboutIntroParagraphs(newParas);
                          }}
                          rows={3}
                          placeholder={`Đoạn văn ${idx + 1}...`}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                        />
                      ))}
                    </div>

                    {/* Intro collage images */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-xs font-semibold text-[#8C7A6B]">Bộ 3 ảnh Collage</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aboutIntroImages.map((img, idx) => (
                          <div key={idx} className="p-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 space-y-2">
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Ảnh {idx + 1}</span>
                            <div className="aspect-video w-full rounded border border-[#E8DCCB] overflow-hidden bg-white mb-2 relative">
                              {img ? (
                                <img src={img} alt={`Collage ${idx}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#8C7A6B]/50">Trống</div>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={img}
                                onChange={(e) => {
                                  const newImgs = [...aboutIntroImages];
                                  newImgs[idx] = e.target.value;
                                  setAboutIntroImages(newImgs);
                                }}
                                className="flex-1 px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setMediaTarget({ type: `about_intro_image_${idx}` as any })}
                                className="px-2 py-1 bg-[#1F1B16] hover:bg-[#B88746] text-white text-[10px] font-bold rounded transition-all"
                              >
                                Chọn
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#E8DCCB]/60 pt-6">
                    <h5 className="text-xs font-bold text-[#1F1B16] mb-3">Thông số Metrics chung (Dải strip số liệu dưới phần giới thiệu)</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {aboutMetricsList.map((metric, idx) => (
                        <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 space-y-2">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Số liệu</label>
                            <input
                              type="text"
                              value={metric.value}
                              onChange={(e) => {
                                const newMetrics = [...aboutMetricsList];
                                newMetrics[idx].value = e.target.value;
                                setAboutMetricsList(newMetrics);
                              }}
                              className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Nhãn mô tả</label>
                            <input
                              type="text"
                              value={metric.label}
                              onChange={(e) => {
                                const newMetrics = [...aboutMetricsList];
                                newMetrics[idx].label = e.target.value;
                                setAboutMetricsList(newMetrics);
                              }}
                              className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Icon (tên lucide-react)</label>
                            <input
                              type="text"
                              value={metric.icon}
                              onChange={(e) => {
                                const newMetrics = [...aboutMetricsList];
                                newMetrics[idx].icon = e.target.value;
                                setAboutMetricsList(newMetrics);
                              }}
                              className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Vision & Mission (keep existing) */}
              {aboutSubTab === 'vision_mission' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">3. Tầm nhìn, Sứ mệnh & Cột mốc Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Sứ mệnh (Mission)</label>
                      <textarea
                        value={aboutMission}
                        onChange={(e) => setAboutMission(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        placeholder="Nhập sứ mệnh của công ty..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tầm nhìn (Vision)</label>
                      <textarea
                        value={aboutVision}
                        onChange={(e) => setAboutVision(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        placeholder="Nhập tầm nhìn dài hạn..."
                      />
                    </div>
                  </div>

                  {/* Timeline list builder */}
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                      <h5 className="text-xs font-bold text-[#1F1B16] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#B88746]" />
                        Dòng lịch sử cột mốc (Timeline)
                      </h5>
                      <button
                        type="button"
                        onClick={addTimeline}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm Cột mốc
                      </button>
                    </div>

                    {timeline.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                        Chưa có cột mốc thời gian nào.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {timeline.map((time, idx) => (
                          <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="md:col-span-1">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Năm</label>
                                <input
                                  type="text"
                                  value={time.year}
                                  onChange={(e) => handleTimelineChange(idx, 'year', e.target.value)}
                                  className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                                  placeholder="Ví dụ: 2020"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Tiêu đề cột mốc</label>
                                <input
                                  type="text"
                                  value={time.title}
                                  onChange={(e) => handleTimelineChange(idx, 'title', e.target.value)}
                                  className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-semibold"
                                  placeholder="Ví dụ: Thành lập Masterise Homes..."
                                />
                              </div>
                              <div className="md:col-span-4">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Chi tiết mô tả</label>
                                <textarea
                                  value={time.description || ''}
                                  onChange={(e) => handleTimelineChange(idx, 'description', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                                  placeholder="Nội dung cụ thể cột mốc lịch sử..."
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTimeline(idx)}
                              className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Values & Awards */}
              {aboutSubTab === 'values_awards' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">4. Giá trị cốt lõi & Giải thưởng</h4>
                  
                  {/* Core values list */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-[#1F1B16]">Giá trị cốt lõi (6 giá trị chính)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aboutValuesList.map((val, idx) => (
                        <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 space-y-2">
                          <span className="block text-[9px] font-bold text-gray-500 uppercase">Giá trị {idx + 1}</span>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[8px] font-semibold text-[#8C7A6B]">Tiêu đề</label>
                              <input
                                type="text"
                                value={val.title}
                                onChange={(e) => {
                                  const newList = [...aboutValuesList];
                                  newList[idx].title = e.target.value;
                                  setAboutValuesList(newList);
                                }}
                                className="w-full px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-semibold text-[#8C7A6B]">Icon</label>
                              <input
                                type="text"
                                value={val.icon}
                                onChange={(e) => {
                                  const newList = [...aboutValuesList];
                                  newList[idx].icon = e.target.value;
                                  setAboutValuesList(newList);
                                }}
                                className="w-full px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none font-mono"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[8px] font-semibold text-[#8C7A6B]">Mô tả</label>
                              <textarea
                                value={val.description}
                                onChange={(e) => {
                                  const newList = [...aboutValuesList];
                                  newList[idx].description = e.target.value;
                                  setAboutValuesList(newList);
                                }}
                                rows={2}
                                className="w-full px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Awards list */}
                  <div className="space-y-4 border-t border-[#E8DCCB]/60 pt-6">
                    <h5 className="text-xs font-bold text-[#1F1B16]">Giải thưởng & Thành tựu tiêu biểu</h5>
                    <div className="space-y-3">
                      {aboutAwardsList.map((award, idx) => (
                        <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 flex gap-3">
                          <span className="self-center text-xs font-bold text-[#B88746]"># {idx + 1}</span>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-1">
                              <label className="block text-[9px] font-bold text-gray-500 uppercase">Tên giải thưởng/Tổ chức</label>
                              <input
                                type="text"
                                value={award.title}
                                onChange={(e) => {
                                  const newList = [...aboutAwardsList];
                                  newList[idx].title = e.target.value;
                                  setAboutAwardsList(newList);
                                }}
                                className="w-full px-2.5 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[9px] font-bold text-gray-500 uppercase">Nội dung chi tiết giải thưởng</label>
                              <input
                                type="text"
                                value={award.description}
                                onChange={(e) => {
                                  const newList = [...aboutAwardsList];
                                  newList[idx].description = e.target.value;
                                  setAboutAwardsList(newList);
                                }}
                                className="w-full px-2.5 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Eco & Sustainability */}
              {aboutSubTab === 'eco_sustainability' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">5. Hệ sinh thái & Phát triển bền vững</h4>
                  
                  {/* Ecosystem */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-[#1F1B16]">Hệ sinh thái sản phẩm (Ecosystem - 5 mục)</h5>
                    <div className="space-y-3">
                      {aboutEcoList.map((eco, idx) => (
                        <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-32 aspect-video md:aspect-[4/3] rounded border border-[#E8DCCB] bg-white overflow-hidden flex-shrink-0 relative">
                            {eco.image ? (
                              <img src={eco.image} alt={eco.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C7A6B]/50">Không có ảnh</div>
                            )}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase">Tên phân khúc/Loại hình</label>
                              <input
                                type="text"
                                value={eco.title}
                                onChange={(e) => {
                                  const newList = [...aboutEcoList];
                                  newList[idx].title = e.target.value;
                                  setAboutEcoList(newList);
                                }}
                                className="w-full px-2.5 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase">Đường dẫn ảnh</label>
                              <input
                                type="text"
                                value={eco.image}
                                onChange={(e) => {
                                  const newList = [...aboutEcoList];
                                  newList[idx].image = e.target.value;
                                  setAboutEcoList(newList);
                                }}
                                className="w-full px-2.5 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-bold text-gray-500 uppercase">Mô tả phân khúc</label>
                              <textarea
                                value={eco.description}
                                onChange={(e) => {
                                  const newList = [...aboutEcoList];
                                  newList[idx].description = e.target.value;
                                  setAboutEcoList(newList);
                                }}
                                rows={2}
                                className="w-full px-2.5 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Partners list */}
                  <div className="space-y-4 border-t border-[#E8DCCB]/60 pt-6">
                    <h5 className="text-xs font-bold text-[#1F1B16]">Đối tác chiến lược (Danh sách các đối tác, phân cách bằng dấu phẩy)</h5>
                    <div>
                      <input
                        type="text"
                        value={aboutPartnersList}
                        onChange={(e) => setAboutPartnersList(e.target.value)}
                        placeholder="Ví dụ: Techcombank, Marriott International, Samsung, Mace"
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sustainability */}
                  <div className="space-y-4 border-t border-[#E8DCCB]/60 pt-6">
                    <h5 className="text-xs font-bold text-[#1F1B16]">Phát triển bền vững (Sustainability)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề mục phát triển bền vững</label>
                        <input
                          type="text"
                          value={aboutSustTitle}
                          onChange={(e) => setAboutSustTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh minh họa phát triển bền vững</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aboutSustImage}
                            onChange={(e) => setAboutSustImage(e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setMediaTarget({ type: 'about_sustainability_image' })}
                            className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                          >
                            Chọn ảnh
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="block text-xs font-semibold text-[#8C7A6B]">3 Trụ cột bền vững</label>
                      {aboutSustPillars.map((pillar, idx) => (
                        <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 space-y-2">
                          <span className="block text-[9px] font-bold text-gray-500 uppercase">Trụ cột {idx + 1}</span>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[8px] font-semibold text-[#8C7A6B]">Tiêu đề</label>
                              <input
                                type="text"
                                value={pillar.title}
                                onChange={(e) => {
                                  const newList = [...aboutSustPillars];
                                  newList[idx].title = e.target.value;
                                  setAboutSustPillars(newList);
                                }}
                                className="w-full px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-semibold text-[#8C7A6B]">Icon</label>
                              <input
                                type="text"
                                value={pillar.icon}
                                onChange={(e) => {
                                  const newList = [...aboutSustPillars];
                                  newList[idx].icon = e.target.value;
                                  setAboutSustPillars(newList);
                                }}
                                className="w-full px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none font-mono"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[8px] font-semibold text-[#8C7A6B]">Nội dung mô tả</label>
                              <textarea
                                value={pillar.description}
                                onChange={(e) => {
                                  const newList = [...aboutSustPillars];
                                  newList[idx].description = e.target.value;
                                  setAboutSustPillars(newList);
                                }}
                                rows={2}
                                className="w-full px-2 py-1 border border-[#E8DCCB] rounded text-xs bg-white focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 6: Brand & FAQ */}
              {aboutSubTab === 'brand_faq' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">6. Câu chuyện & FAQs trang Giới thiệu</h4>
                  
                  {/* Brand story */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-[#1F1B16]">Câu chuyện thương hiệu</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề</label>
                        <input
                          type="text"
                          value={aboutBrandTitle}
                          onChange={(e) => setAboutBrandTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh minh họa câu chuyện</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aboutBrandImage}
                            onChange={(e) => setAboutBrandImage(e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setMediaTarget({ type: 'about_brand_story_image' })}
                            className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                          >
                            Chọn ảnh
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung câu chuyện</label>
                        <textarea
                          value={aboutBrandDesc}
                          onChange={(e) => setAboutBrandDesc(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút hành động</label>
                        <input
                          type="text"
                          value={aboutBrandBtn}
                          onChange={(e) => setAboutBrandBtn(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FAQs list builder */}
                  <div className="space-y-4 border-t border-[#E8DCCB]/60 pt-6">
                    <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                      <h5 className="text-xs font-bold text-[#1F1B16] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#B88746]" />
                        Câu hỏi thường gặp FAQ (Trang Giới thiệu)
                      </h5>
                      <button
                        type="button"
                        onClick={() => setAboutFaqsList([...aboutFaqsList, { question: '', answer: '' }])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm Câu hỏi
                      </button>
                    </div>

                    {aboutFaqsList.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                        Chưa có câu hỏi nào được tạo.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {aboutFaqsList.map((faq, idx) => (
                          <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                            <div className="flex-1 grid grid-cols-1 gap-2">
                              <div>
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const newList = [...aboutFaqsList];
                                    newList[idx].question = e.target.value;
                                    setAboutFaqsList(newList);
                                  }}
                                  className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white font-semibold focus:outline-none"
                                  placeholder="Câu hỏi..."
                                />
                              </div>
                              <div>
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const newList = [...aboutFaqsList];
                                    newList[idx].answer = e.target.value;
                                    setAboutFaqsList(newList);
                                  }}
                                  rows={2}
                                  className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                                  placeholder="Câu trả lời..."
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAboutFaqsList(aboutFaqsList.filter((_, i) => i !== idx))}
                              className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tab 7: Contact CTA */}
              {aboutSubTab === 'contact_cta' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">7. Banner liên hệ tư vấn cuối trang</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Badge (Nhãn nhỏ)</label>
                      <input
                        type="text"
                        value={aboutContactCtaLabel}
                        onChange={(e) => setAboutContactCtaLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh nền Banner</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aboutContactCtaImage}
                          onChange={(e) => setAboutContactCtaImage(e.target.value)}
                          className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaTarget({ type: 'about_contact_cta_image' })}
                          className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                        >
                          Chọn ảnh
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề lớn kêu gọi</label>
                      <input
                        type="text"
                        value={aboutContactCtaTitle}
                        onChange={(e) => setAboutContactCtaTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả ngắn</label>
                      <textarea
                        value={aboutContactCtaDesc}
                        onChange={(e) => setAboutContactCtaDesc(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 8: Collections */}
              {aboutSubTab === 'collections' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2">8. Các dòng sản phẩm chủ chốt (Brand Residence, Lumiere, Masteri)</h4>
                  
                  <div className="space-y-6">
                    {aboutCollectionsList.map((col, idx) => (
                      <div key={col.id} className="p-4 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#E8DCCB]/40 pb-2">
                          <h5 className="text-xs font-bold text-[#B88746]">
                            {idx + 1}. {col.id === 'brand-residence' ? 'Brand Residence' : col.id === 'lumiere-series' ? 'Lumiere Series' : 'Masteri Collection'}
                          </h5>
                          <span className="text-[10px] text-gray-500 uppercase font-mono">{col.id}</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-40 aspect-video md:aspect-[4/3] rounded border border-[#E8DCCB] bg-white overflow-hidden flex-shrink-0 relative">
                            {col.image ? (
                              <img src={col.image} alt={col.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C7A6B]/50">Không có ảnh</div>
                            )}
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Tiêu đề hiển thị</label>
                              <input
                                type="text"
                                value={col.title}
                                onChange={(e) => {
                                  const newList = [...aboutCollectionsList];
                                  newList[idx].title = e.target.value;
                                  setAboutCollectionsList(newList);
                                }}
                                className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Khẩu hiệu / Subtitle</label>
                              <input
                                type="text"
                                value={col.subtitle}
                                onChange={(e) => {
                                  const newList = [...aboutCollectionsList];
                                  newList[idx].subtitle = e.target.value;
                                  setAboutCollectionsList(newList);
                                }}
                                className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Đường dẫn ảnh bìa</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={col.image}
                                  onChange={(e) => {
                                    const newList = [...aboutCollectionsList];
                                    newList[idx].image = e.target.value;
                                    setAboutCollectionsList(newList);
                                  }}
                                  className="flex-1 px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setMediaTarget({ type: 'about_collection_image', index: idx })}
                                  className="px-3 py-1 bg-[#1F1B16] hover:bg-[#B88746] text-white text-[10px] font-bold rounded-lg transition-all"
                                >
                                  Chọn ảnh
                                </button>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Mô tả dòng sản phẩm</label>
                              <textarea
                                value={col.description}
                                onChange={(e) => {
                                  const newList = [...aboutCollectionsList];
                                  newList[idx].description = e.target.value;
                                  setAboutCollectionsList(newList);
                                }}
                                rows={3}
                                className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none resize-none leading-relaxed"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Đặc điểm nổi bật (Phân cách bằng dấu phẩy)</label>
                              <input
                                type="text"
                                value={col.features ? col.features.join(', ') : ''}
                                onChange={(e) => {
                                  const newList = [...aboutCollectionsList];
                                  newList[idx].features = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setAboutCollectionsList(newList);
                                }}
                                className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                                placeholder="Ví dụ: Vị trí độc bản, Quản lý chuẩn quốc tế"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Đường dẫn liên kết (Link)</label>
                              <input
                                type="text"
                                value={col.link || ''}
                                onChange={(e) => {
                                  const newList = [...aboutCollectionsList];
                                  newList[idx].link = e.target.value;
                                  setAboutCollectionsList(newList);
                                }}
                                className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                                placeholder="Ví dụ: /du-an?q=lumiere"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Contact Departments */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8DCCB]/60 pb-2">
                <h3 className="text-lg font-heading font-medium text-[#1F1B16] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#B88746]" />
                  Các phòng ban hỗ trợ (Contact Departments)
                </h3>
                <button
                  type="button"
                  onClick={addDepartment}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#B88746] hover:bg-[#1F1B16] text-white text-xs font-bold rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm Phòng ban
                </button>
              </div>

              {departments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E8DCCB] rounded-xl text-xs text-[#8C7A6B]">
                  Chưa có phòng ban liên hệ nào được định nghĩa.
                </div>
              ) : (
                <div className="space-y-3">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="p-4 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2]/30 flex gap-4 relative">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Tên phòng ban</label>
                          <input
                            type="text"
                            value={dept.name}
                            onChange={(e) => handleDepartmentChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-semibold"
                            placeholder="Ví dụ: Phòng Kinh doanh"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Hotline phòng ban</label>
                          <input
                            type="text"
                            value={dept.phone}
                            onChange={(e) => handleDepartmentChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                            placeholder="Ví dụ: 090 1234567"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Email phòng ban</label>
                          <input
                            type="email"
                            value={dept.email}
                            onChange={(e) => handleDepartmentChange(idx, 'email', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none"
                            placeholder="sales@masterisehomes.com"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDepartment(idx)}
                        className="self-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Projects Page Config */}
          {activeTab === 'projects_page' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#B88746]" />
                  Cấu hình Trang Dự án - Phần Hero Banner (Đầu trang)
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Badge (Nhãn nhỏ phía trên)</label>
                    <input
                      type="text"
                      value={projectsHeroBadge}
                      onChange={(e) => setProjectsHeroBadge(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh Banner chính</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectsHeroImage}
                        onChange={(e) => setProjectsHeroImage(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaTarget({ type: 'projects_hero_image' })}
                        className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Chọn ảnh
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề H1 chính</label>
                    <input
                      type="text"
                      value={projectsHeroTitle}
                      onChange={(e) => setProjectsHeroTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả giới thiệu chung</label>
                    <textarea
                      value={projectsHeroDesc}
                      onChange={(e) => setProjectsHeroDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút kêu gọi chính</label>
                    <input
                      type="text"
                      value={projectsHeroPrimaryCta}
                      onChange={(e) => setProjectsHeroPrimaryCta(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút kêu gọi phụ</label>
                    <input
                      type="text"
                      value={projectsHeroSecondaryCta}
                      onChange={(e) => setProjectsHeroSecondaryCta(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Link tải brochure tổng hợp</label>
                    <input
                      type="text"
                      value={projectsBrochureUrl}
                      onChange={(e) => setProjectsBrochureUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      placeholder="Ví dụ: /storage/media/masterise-brochure.pdf hoặc https://..."
                    />
                    <p className="mt-1 text-[10px] leading-4 text-[#8C7A6B]">
                      Dùng cho nút tải brochure ở Hero và banner CTA trang /du-an. Nếu để trống, nút sẽ đưa khách xuống form tư vấn.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-[#1F1B16] mb-3">Thông số tổng quan dự án (Overview Stats)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {projectsStats.map((stat, idx) => (
                      <div key={idx} className="p-3 border border-[#E8DCCB]/60 rounded-xl bg-[#FBF8F2]/30">
                        <span className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Thông số {idx + 1}</span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...projectsStats];
                              newStats[idx].value = e.target.value;
                              setProjectsStats(newStats);
                            }}
                            placeholder="Số liệu (Ví dụ: 15+)"
                            className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none font-semibold"
                          />
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...projectsStats];
                              newStats[idx].label = e.target.value;
                              setProjectsStats(newStats);
                            }}
                            placeholder="Nhãn (Ví dụ: Dự án)"
                            className="w-full px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs bg-white focus:outline-none text-[#8C7A6B]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2 mt-4">
                  <Building2 className="w-5 h-5 text-[#B88746]" />
                  Cấu hình Trang Dự án - Phần CTA Form Banner (Cuối trang)
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn tiêu đề nhỏ</label>
                    <input
                      type="text"
                      value={projectsCtaLabel}
                      onChange={(e) => setProjectsCtaLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh nền CTA</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectsCtaImage}
                        onChange={(e) => setProjectsCtaImage(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaTarget({ type: 'projects_cta_image' })}
                        className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Chọn ảnh
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề lớn kêu gọi</label>
                    <input
                      type="text"
                      value={projectsCtaTitle}
                      onChange={(e) => setProjectsCtaTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nút hành động chính</label>
                    <input
                      type="text"
                      value={projectsCtaPrimaryBtn}
                      onChange={(e) => setProjectsCtaPrimaryBtn(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nút hành động phụ</label>
                    <input
                      type="text"
                      value={projectsCtaSecondaryBtn}
                      onChange={(e) => setProjectsCtaSecondaryBtn(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: News Page Config */}
          {activeTab === 'news_page' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#B88746]" />
                  Cấu hình Trang Tin tức - Phần Hero Banner (Đầu trang)
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Badge (Nhãn nhỏ phía trên)</label>
                    <input
                      type="text"
                      value={newsHeroBadge}
                      onChange={(e) => setNewsHeroBadge(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Ảnh Banner chính</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newsHeroImage}
                        onChange={(e) => setNewsHeroImage(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaTarget({ type: 'news_hero_image' })}
                        className="px-4 py-2 bg-[#1F1B16] hover:bg-[#B88746] text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Chọn ảnh
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề H1 chính</label>
                    <input
                      type="text"
                      value={newsHeroTitle}
                      onChange={(e) => setNewsHeroTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả giới thiệu chung</label>
                    <textarea
                      value={newsHeroDesc}
                      onChange={(e) => setNewsHeroDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút kêu gọi chính</label>
                    <input
                      type="text"
                      value={newsHeroPrimaryCta}
                      onChange={(e) => setNewsHeroPrimaryCta(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút kêu gọi phụ</label>
                    <input
                      type="text"
                      value={newsHeroSecondaryCta}
                      onChange={(e) => setNewsHeroSecondaryCta(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 border border-[#E8DCCB]/60 p-4 rounded-xl bg-[#FBF8F2]/30">
                  <h4 className="text-sm font-semibold text-[#1F1B16] mb-3 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-[#B88746]" />
                    Bài viết điểm nhấn nổi bật trên Hero (Highlight Card)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nhãn điểm nhấn</label>
                      <input
                        type="text"
                        value={newsHeroHighlightLabel}
                        onChange={(e) => setNewsHeroHighlightLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                        placeholder="Ví dụ: Điểm nhấn hôm nay"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề bài viết nổi bật</label>
                      <input
                        type="text"
                        value={newsHeroHighlightTitle}
                        onChange={(e) => setNewsHeroHighlightTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                        placeholder="Ví dụ: The Global City: Tiếp tục khẳng định vị thế..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text link hành động</label>
                      <input
                        type="text"
                        value={newsHeroHighlightCta}
                        onChange={(e) => setNewsHeroHighlightCta(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-white text-sm focus:outline-none"
                        placeholder="Ví dụ: Đọc ngay"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2 mt-4">
                  <Newspaper className="w-5 h-5 text-[#B88746]" />
                  Cấu hình Trang Tin tức - Phần CTA Banner (Cuối trang)
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tiêu đề lớn kêu gọi</label>
                    <input
                      type="text"
                      value={newsCtaTitle}
                      onChange={(e) => setNewsCtaTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mô tả phụ</label>
                    <textarea
                      value={newsCtaDesc}
                      onChange={(e) => setNewsCtaDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Text nút bấm hành động</label>
                    <input
                      type="text"
                      value={newsCtaButton}
                      onChange={(e) => setNewsCtaButton(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SMTP Config Form */}
                <div className="lg:col-span-2 space-y-6 bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#B88746]" />
                      Thông tin Cấu hình SMTP
                    </h3>
                    <p className="text-xs text-[#8C7A6B] mt-1">Các thông số này dùng để kết nối với máy chủ gửi thư.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Máy chủ SMTP (SMTP Host) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={mailHost}
                        onChange={(e) => setMailHost(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Cổng SMTP (SMTP Port) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={mailPort}
                        onChange={(e) => setMailPort(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: 587 hoặc 465"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Giao thức mã hóa (Encryption)</label>
                      <select
                        value={mailEncryption}
                        onChange={(e) => setMailEncryption(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                      >
                        <option value="tls">TLS (Khuyên dùng cho Port 587)</option>
                        <option value="ssl">SSL (Khuyên dùng cho Port 465)</option>
                        <option value="none">None (Không mã hóa)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tài khoản SMTP (SMTP Username) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={mailUsername}
                        onChange={(e) => setMailUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                        placeholder="Ví dụ: email_cua_ban@gmail.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Mật khẩu SMTP (SMTP Password) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={mailPassword}
                          onChange={(e) => setMailPassword(e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Mật khẩu ứng dụng (App Password)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#1F1B16]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8DCCB]/60">
                    <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-[#B88746]" />
                      Thông tin Gửi & Nhận Thư
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Tên người gửi hiển thị (From Name)</label>
                        <input
                          type="text"
                          value={mailFromName}
                          onChange={(e) => setMailFromName(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: Masterise Homes"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Email gửi đi hiển thị (From Address)</label>
                        <input
                          type="email"
                          value={mailFromAddress}
                          onChange={(e) => setMailFromAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Ví dụ: no-reply@masterisehomes.com"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Email nhận thông báo <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          value={mailReceiveAddress}
                          onChange={(e) => setMailReceiveAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
                          placeholder="Nhập địa chỉ nhận tất cả các mail thông báo từ các form khách hàng"
                        />
                        <p className="text-[10px] text-[#8C7A6B] mt-1">Khi có bất kỳ khách hàng nào đăng ký form tư vấn hoặc đặt lịch hẹn tham quan, thông tin sẽ được tự động gửi tới email này.</p>
                      </div>
                    </div>
                  </div>

                  {/* Connection Test Actions */}
                  <div className="pt-4 border-t border-[#E8DCCB]/60 flex items-center justify-between gap-4">
                    <span className="text-xs text-[#8C7A6B] italic">Lưu ý: Bấm lưu tất cả thay đổi sau khi chạy thử nghiệm thành công.</span>
                    <button
                      type="button"
                      disabled={testEmailLoading}
                      onClick={handleTestEmail}
                      className="flex items-center gap-2 px-4 py-2 border border-[#B88746] hover:bg-[#B88746]/10 text-[#B88746] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {testEmailLoading ? 'Đang gửi thử...' : 'Gửi Thử Email'}
                    </button>
                  </div>
                </div>

                {/* SMTP Guide Sidebar */}
                <div className="space-y-6">
                  <div className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-6">
                    <h4 className="text-sm font-semibold text-[#1F1B16] flex items-center gap-2 mb-3">
                      <HelpCircle className="w-4 h-4 text-[#B88746]" />
                      Hướng dẫn Cài đặt SMTP Gmail
                    </h4>
                    
                    <div className="text-xs text-[#4A453F] space-y-3.5 leading-relaxed">
                      <p>Để hệ thống có thể tự động gửi email thông báo, bạn cần sử dụng một tài khoản email (khuyên dùng Gmail) làm cổng gửi thư.</p>
                      
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Truy cập <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="text-[#B88746] hover:underline font-semibold">Tài khoản Google</a> của bạn.</li>
                        <li>Đi tới mục <strong>Bảo mật (Security)</strong> và bật <strong>Xác minh 2 bước (2-Step Verification)</strong>.</li>
                        <li>Sau khi bật, nhấp vào mục <strong>Mật khẩu ứng dụng (App passwords)</strong> ở phía cuối trang cấu hình Xác minh 2 bước.</li>
                        <li>Chọn ứng dụng là <i>Khác (Tự điền tên)</i>, đặt tên bất kỳ (Ví dụ: <code>Website BDS</code>) và bấm <strong>Tạo</strong>.</li>
                        <li>Google sẽ cung cấp một dãy mật khẩu gồm <strong>16 chữ cái</strong> (màu vàng). Copy mật khẩu này và dán vào ô <strong>Mật khẩu SMTP</strong> bên cạnh.</li>
                      </ol>

                      <div className="bg-white/80 p-3 rounded-lg border border-[#E8DCCB] text-[11px] space-y-1">
                        <strong className="text-[#1F1B16]">Thông số chuẩn cho Gmail:</strong><br/>
                        • Máy chủ: <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-800">smtp.gmail.com</code><br/>
                        • Cổng: <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-800">587</code><br/>
                        • Mã hóa: <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-800">TLS</code><br/>
                        • Tài khoản: Địa chỉ Gmail của bạn
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-medium text-[#1F1B16] border-b border-[#E8DCCB]/60 pb-2 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-[#B88746]" />
                    Cấu hình Liên kết Chân trang (Footer Navigation)
                  </h3>
                  <p className="text-xs text-[#8C7A6B] mt-1">
                    Quản lý danh sách các cột liên kết được hiển thị tại chân trang của website. Bấm lưu thay đổi ở trên cùng để áp dụng.
                  </p>
                </div>

                {/* Columns List */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {footerNavigation.map((col, colIdx) => (
                    <div key={colIdx} className="border border-[#E8DCCB] rounded-2xl p-5 bg-[#FBF8F2] relative space-y-4">
                      {/* Column Header */}
                      <div className="flex items-center justify-between border-b border-[#E8DCCB]/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white bg-[#B88746] px-2 py-0.5 rounded-md">Cột {colIdx + 1}</span>
                          <input
                            type="text"
                            value={col.title}
                            onChange={(e) => {
                              const newCols = [...footerNavigation];
                              newCols[colIdx].title = e.target.value;
                              setFooterNavigation(newCols);
                            }}
                            className="bg-white px-2 py-1 border border-[#E8DCCB] rounded-lg text-xs font-bold focus:outline-none focus:border-[#B88746] w-36"
                            placeholder="Tiêu đề cột"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa cột này cùng tất cả liên kết bên trong?')) {
                              setFooterNavigation(footerNavigation.filter((_, i) => i !== colIdx));
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          title="Xóa cột này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Links container */}
                      <div className="space-y-3">
                        {col.links.map((link, linkIdx) => (
                          <div key={linkIdx} className="bg-white border border-[#E8DCCB]/60 rounded-xl p-3 space-y-2 relative shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#8C7A6B] font-semibold">Liên kết {linkIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCols = [...footerNavigation];
                                  newCols[colIdx].links = newCols[colIdx].links.filter((_, i) => i !== linkIdx);
                                  setFooterNavigation(newCols);
                                }}
                                className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                                title="Xóa liên kết"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="block text-[9px] font-bold text-[#8C7A6B] uppercase mb-0.5">Tên hiển thị</label>
                                <input
                                  type="text"
                                  value={link.label}
                                  onChange={(e) => {
                                    const newCols = [...footerNavigation];
                                    newCols[colIdx].links[linkIdx].label = e.target.value;
                                    setFooterNavigation(newCols);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-[#E8DCCB] rounded-lg text-xs focus:outline-none focus:border-[#B88746]"
                                  placeholder="Ví dụ: Lumiere Series"
                                />
                              </div>

                              <div className="relative">
                                <label className="block text-[9px] font-bold text-[#8C7A6B] uppercase mb-0.5 flex justify-between items-center">
                                  <span>Đường dẫn (URL)</span>
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    value={link.href}
                                    onChange={(e) => {
                                      const newCols = [...footerNavigation];
                                      newCols[colIdx].links[linkIdx].href = e.target.value;
                                      setFooterNavigation(newCols);
                                    }}
                                    className="flex-1 px-2.5 py-1.5 pr-14 border border-[#E8DCCB] rounded-lg text-xs focus:outline-none focus:border-[#B88746]"
                                    placeholder="Ví dụ: /du-an?category=lumiere-series"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSuggestTarget(suggestTarget?.colIdx === colIdx && suggestTarget?.linkIdx === linkIdx ? null : { colIdx, linkIdx })}
                                    className="absolute right-1 top-4.5 text-[#B88746] hover:text-[#1F1B16] text-[10px] font-bold bg-[#B88746]/10 hover:bg-[#B88746]/20 px-2 py-1 rounded-md border border-[#B88746]/20 transition-all select-none"
                                  >
                                    Gợi ý
                                  </button>
                                </div>

                                {/* Suggestion Popover */}
                                {suggestTarget?.colIdx === colIdx && suggestTarget?.linkIdx === linkIdx && (() => {
                                  const searchLower = suggestSearch.toLowerCase();

                                  const filteredPages = [
                                    { label: 'Trang chủ', href: '/' },
                                    { label: 'Giới thiệu', href: '/gioi-thieu' },
                                    { label: 'Dự án', href: '/du-an' },
                                    { label: 'Tin tức', href: '/tin-tuc' },
                                    { label: 'Đầu tư', href: '/dau-tu' },
                                    { label: 'Liên hệ', href: '/lien-he' },
                                    ...staticPagesData.map((p: any) => ({ label: p.title, href: `/chuyen-trang/${p.slug}` }))
                                  ].filter((p: any) => p.label.toLowerCase().includes(searchLower) || p.href.toLowerCase().includes(searchLower));

                                  const filteredStatuses = [
                                    { label: 'Sắp mở bán', href: '/du-an?sales_status=coming_soon' },
                                    { label: 'Đang mở bán', href: '/du-an?sales_status=selling' },
                                    { label: 'Đang bàn giao', href: '/du-an?sales_status=handing_over' },
                                    { label: 'Đã bàn giao', href: '/du-an?sales_status=handover' }
                                  ].filter((p: any) => p.label.toLowerCase().includes(searchLower));

                                  const filteredProjCats = projectCategoriesData.map((cat: any) => ({
                                    label: `Dòng SP: ${cat.name}`,
                                    href: `/du-an?category=${cat.slug}`
                                  })).filter((p: any) => p.label.toLowerCase().includes(searchLower));

                                  const filteredProjects = projectsData.map((p: any) => ({
                                    label: p.name,
                                    href: `/du-an/${p.slug}`
                                  })).filter((p: any) => p.label.toLowerCase().includes(searchLower));

                                  const filteredPostCats = postCategoriesData.map((cat: any) => ({
                                    label: `Danh mục tin: ${cat.name}`,
                                    href: `/tin-tuc?category=${cat.slug}`
                                  })).filter((p: any) => p.label.toLowerCase().includes(searchLower));

                                  const filteredPosts = postsData.map((p: any) => ({
                                    label: p.title,
                                    href: `/tin-tuc/${p.slug}`
                                  })).filter((p: any) => p.label.toLowerCase().includes(searchLower));

                                  return (
                                    <div className="absolute left-0 md:left-auto md:right-0 top-12 bg-white border border-[#E8DCCB] rounded-xl shadow-xl z-20 w-[320px] sm:w-[400px] p-3 text-xs text-left animate-fadeIn">
                                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#E8DCCB]/60">
                                        <span className="font-bold text-[#B88746]">Đề xuất liên kết</span>
                                        <button type="button" onClick={() => { setSuggestTarget(null); setSuggestSearch(''); }} className="text-[#8C7A6B] hover:text-[#1F1B16]">
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {/* Search input */}
                                      <div className="relative mb-2">
                                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7A6B]" />
                                        <input
                                          type="text"
                                          placeholder="Tìm nhanh liên kết..."
                                          value={suggestSearch}
                                          onChange={(e) => setSuggestSearch(e.target.value)}
                                          className="w-full pl-8 pr-6 py-1.5 border border-[#E8DCCB] rounded-lg text-xs bg-[#FBF8F2] focus:outline-none focus:border-[#B88746]"
                                        />
                                        {suggestSearch && (
                                          <button
                                            type="button"
                                            onClick={() => setSuggestSearch('')}
                                            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>

                                      {/* Tab navigation */}
                                      <div className="grid grid-cols-4 gap-1 mb-2.5 border-b border-[#E8DCCB]/40 pb-2">
                                        {(['pages', 'filters', 'projects', 'posts'] as const).map(tab => {
                                          let tabLabel = '';
                                          if (tab === 'pages') tabLabel = 'Trang';
                                          if (tab === 'filters') tabLabel = 'Bộ lọc';
                                          if (tab === 'projects') tabLabel = 'Dự án';
                                          if (tab === 'posts') tabLabel = 'Bài viết';

                                          const isActive = suggestActiveTab === tab;
                                          return (
                                            <button
                                              key={tab}
                                              type="button"
                                              onClick={() => setSuggestActiveTab(tab)}
                                              className={`py-1 text-[10px] font-bold rounded-md text-center transition-all ${
                                                isActive 
                                                  ? 'bg-[#B88746] text-white' 
                                                  : 'bg-[#FBF8F2] text-[#8C7A6B] hover:bg-[#B88746]/10 hover:text-[#B88746]'
                                              }`}
                                            >
                                              {tabLabel}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Tab content */}
                                      {suggestActiveTab === 'pages' && (
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                          {filteredPages.length > 0 ? (
                                            filteredPages.map((item: any) => (
                                              <button
                                                key={item.href}
                                                type="button"
                                                onClick={() => {
                                                  const newCols = [...footerNavigation];
                                                  newCols[colIdx].links[linkIdx].label = item.label;
                                                  newCols[colIdx].links[linkIdx].href = item.href;
                                                  setFooterNavigation(newCols);
                                                  setSuggestTarget(null);
                                                  setSuggestSearch('');
                                                }}
                                                className="w-full p-2 hover:bg-[#B88746]/10 text-left rounded-lg text-[11px] hover:text-[#B88746] flex justify-between items-center transition-all bg-[#FBF8F2]/60"
                                              >
                                                <span className="font-medium flex items-center gap-1.5 text-gray-700">
                                                  <FileText className="w-3.5 h-3.5 text-[#B88746]" />
                                                  {item.label}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-mono">{item.href}</span>
                                              </button>
                                            ))
                                          ) : (
                                            <div className="text-gray-400 italic text-center py-4 text-[11px]">Không tìm thấy trang nào</div>
                                          )}
                                        </div>
                                      )}

                                      {suggestActiveTab === 'filters' && (
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                          {/* Trạng thái */}
                                          {filteredStatuses.length > 0 && (
                                            <div>
                                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trạng thái</div>
                                              <div className="space-y-1">
                                                {filteredStatuses.map((item: any) => (
                                                  <button
                                                    key={item.href}
                                                    type="button"
                                                    onClick={() => {
                                                      const newCols = [...footerNavigation];
                                                      newCols[colIdx].links[linkIdx].label = item.label;
                                                      newCols[colIdx].links[linkIdx].href = item.href;
                                                      setFooterNavigation(newCols);
                                                      setSuggestTarget(null);
                                                      setSuggestSearch('');
                                                    }}
                                                    className="w-full p-1.5 hover:bg-[#B88746]/10 text-left rounded text-[11px] hover:text-[#B88746] flex justify-between items-center transition-all bg-[#FBF8F2]/60"
                                                  >
                                                    <span className="font-medium text-gray-700">{item.label}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono">?sales_status=...</span>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Dòng sản phẩm */}
                                          {filteredProjCats.length > 0 && (
                                            <div>
                                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dòng sản phẩm & Loại hình</div>
                                              <div className="space-y-1">
                                                {filteredProjCats.map((item: any) => (
                                                  <button
                                                    key={item.href}
                                                    type="button"
                                                    onClick={() => {
                                                      const newCols = [...footerNavigation];
                                                      newCols[colIdx].links[linkIdx].label = item.label.replace('Dòng SP: ', '');
                                                      newCols[colIdx].links[linkIdx].href = item.href;
                                                      setFooterNavigation(newCols);
                                                      setSuggestTarget(null);
                                                      setSuggestSearch('');
                                                    }}
                                                    className="w-full p-1.5 hover:bg-[#B88746]/10 text-left rounded text-[11px] hover:text-[#B88746] flex justify-between items-center transition-all bg-[#FBF8F2]/60"
                                                  >
                                                    <span className="font-medium text-gray-700">{item.label}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]">{item.href}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {filteredStatuses.length === 0 && filteredProjCats.length === 0 && (
                                            <div className="text-gray-400 italic text-center py-4 text-[11px]">Không tìm thấy bộ lọc nào</div>
                                          )}
                                        </div>
                                      )}

                                      {suggestActiveTab === 'projects' && (
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                          {filteredProjects.length > 0 ? (
                                            filteredProjects.map((item: any) => (
                                              <button
                                                key={item.href}
                                                type="button"
                                                onClick={() => {
                                                  const newCols = [...footerNavigation];
                                                  newCols[colIdx].links[linkIdx].label = item.label;
                                                  newCols[colIdx].links[linkIdx].href = item.href;
                                                  setFooterNavigation(newCols);
                                                  setSuggestTarget(null);
                                                  setSuggestSearch('');
                                                }}
                                                className="w-full p-2 hover:bg-[#B88746]/10 text-left rounded-lg text-[11px] hover:text-[#B88746] flex justify-between items-center transition-all bg-[#FBF8F2]/60"
                                              >
                                                <span className="font-medium flex items-center gap-1.5 text-gray-700">
                                                  <Building2 className="w-3.5 h-3.5 text-[#B88746]" />
                                                  {item.label}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-mono">{item.href}</span>
                                              </button>
                                            ))
                                          ) : (
                                            <div className="text-gray-400 italic text-center py-4 text-[11px]">Không tìm thấy dự án nào</div>
                                          )}
                                        </div>
                                      )}

                                      {suggestActiveTab === 'posts' && (
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                          {/* Danh mục tin */}
                                          {filteredPostCats.length > 0 && (
                                            <div>
                                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Danh mục tin tức</div>
                                              <div className="space-y-1">
                                                {filteredPostCats.map((item: any) => (
                                                  <button
                                                    key={item.href}
                                                    type="button"
                                                    onClick={() => {
                                                      const newCols = [...footerNavigation];
                                                      newCols[colIdx].links[linkIdx].label = item.label.replace('Danh mục tin: ', '');
                                                      newCols[colIdx].links[linkIdx].href = item.href;
                                                      setFooterNavigation(newCols);
                                                      setSuggestTarget(null);
                                                      setSuggestSearch('');
                                                    }}
                                                    className="w-full p-1.5 hover:bg-[#B88746]/10 text-left rounded text-[11px] hover:text-[#B88746] flex justify-between items-center transition-all bg-[#FBF8F2]/60"
                                                  >
                                                    <span className="font-medium text-gray-700">{item.label}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]">{item.href}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Bài viết */}
                                          {filteredPosts.length > 0 && (
                                            <div>
                                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bài viết</div>
                                              <div className="space-y-1">
                                                {filteredPosts.map((item: any) => (
                                                  <button
                                                    key={item.href}
                                                    type="button"
                                                    onClick={() => {
                                                      const newCols = [...footerNavigation];
                                                      newCols[colIdx].links[linkIdx].label = item.label;
                                                      newCols[colIdx].links[linkIdx].href = item.href;
                                                      setFooterNavigation(newCols);
                                                      setSuggestTarget(null);
                                                      setSuggestSearch('');
                                                    }}
                                                    className="w-full p-2 hover:bg-[#B88746]/10 text-left rounded-lg text-[11px] hover:text-[#B88746] flex justify-between items-center transition-all bg-[#FBF8F2]/60"
                                                  >
                                                    <span className="font-medium flex items-center gap-1.5 text-gray-700 truncate mr-2">
                                                      <Newspaper className="w-3.5 h-3.5 text-[#B88746] shrink-0" />
                                                      <span className="truncate">{item.label}</span>
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-mono shrink-0">{item.href}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {filteredPostCats.length === 0 && filteredPosts.length === 0 && (
                                            <div className="text-gray-400 italic text-center py-4 text-[11px]">Không tìm thấy bài viết nào</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add link button inside column */}
                      <button
                        type="button"
                        onClick={() => {
                          const newCols = [...footerNavigation];
                          newCols[colIdx].links.push({ label: '', href: '' });
                          setFooterNavigation(newCols);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#B88746]/40 hover:border-[#B88746] hover:bg-[#B88746]/5 rounded-xl text-xs text-[#B88746] font-semibold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm liên kết mới
                      </button>
                    </div>
                  ))}

                  {/* Add Column Card */}
                  {footerNavigation.length < 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFooterNavigation([...footerNavigation, { title: 'TIÊU ĐỀ MỚI', links: [] }]);
                      }}
                      className="border-2 border-dashed border-[#E8DCCB] hover:border-[#B88746] rounded-2xl p-6 bg-[#FBF8F2]/50 hover:bg-[#B88746]/5 flex flex-col items-center justify-center gap-2 text-sm text-[#8C7A6B] hover:text-[#B88746] transition-all min-h-[250px]"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="font-semibold">Thêm cột Footer mới</span>
                      <span className="text-[10px] text-gray-400">Nên có tối đa 3-4 cột để hiển thị đẹp nhất</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Media Select Modal Wrapper */}
      <AnimatePresence>
        {mediaTarget !== null && (
          <MediaSelectModal
            isOpen={mediaTarget !== null}
            onClose={() => setMediaTarget(null)}
            onSelect={handleMediaSelected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
