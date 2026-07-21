'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ToastProvider } from '@/components/admin/Toast';
import { 
  Building, 
  Newspaper, 
  Image as ImageIcon, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  Home,
  FileSpreadsheet,
  Globe,
  MapPin,
  Award,
  Sparkles,
  Layers,
  History,
  Clock,
  FileText,
  Wrench,
  Layout,
  HelpCircle,
  MessageSquare,
  Handshake,
  BriefcaseBusiness
} from 'lucide-react';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Admin Guard
  useEffect(() => {
    if (!isLoading) {
      console.log("[AdminGuard] Checking authorization:", {
        user: user?.email,
        pathname
      });
      if (!user) {
        console.log("[AdminGuard] No user found. Redirecting to /dang-nhap");
        router.push('/dang-nhap');
      } else {
        const isAdmin = hasRole(['super_admin', 'admin', 'marketing', 'sale_manager', 'sale', 'recruiter']);
        console.log("[AdminGuard] Is admin check:", isAdmin);
        if (!isAdmin) {
          console.log("[AdminGuard] Non-admin user detected. Redirecting to /tai-khoan");
          router.push('/tai-khoan'); // Redirect non-staff to customer portal
        }
      }
    }
  }, [user, isLoading, router, hasRole, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1F1B16] flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B88746] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#E8DCCB] text-sm">Đang tải trang quản trị...</p>
        </div>
      </div>
    );
  }

  // Double check auth state to prevent flash
  const isAdmin = hasRole(['super_admin', 'admin', 'marketing', 'sale_manager', 'sale', 'recruiter']);
  if (!user || !isAdmin) {
    return null;
  }

  const menuItems = [
    { name: 'Tuyển dụng', href: '/admin/tuyen-dung', icon: BriefcaseBusiness, roles: ['super_admin', 'admin', 'recruiter'] },
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'marketing', 'sale_manager', 'sale'] },
    { name: 'Quản lý Dự án', href: '/admin/du-an', icon: Building, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Đánh giá dự án', href: '/admin/project-reviews', icon: MessageSquare, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Chủ đầu tư', href: '/admin/developers', icon: Award, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Vị trí địa lý', href: '/admin/locations', icon: MapPin, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Quản lý Tin tức', href: '/admin/tin-tuc', icon: Newspaper, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Quản lý Chuyên trang', href: '/admin/pages', icon: FileText, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Thư viện Media', href: '/admin/media', icon: ImageIcon, roles: ['super_admin', 'admin', 'marketing'] },

    // Homepage Content Section
    { name: 'Banner trang chủ', href: '/admin/banners', icon: Layout, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'FAQ', href: '/admin/faq', icon: HelpCircle, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Nhận xét KH', href: '/admin/testimonials', icon: MessageSquare, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Đối tác', href: '/admin/partners', icon: Handshake, roles: ['super_admin', 'admin', 'marketing'] },
    
    // AI Content Section
    { name: 'Viết bài bằng AI', href: '/admin/ai-content/write', icon: Sparkles, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Tạo bài hàng loạt', href: '/admin/ai-content/bulk', icon: Layers, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Bài nháp AI', href: '/admin/ai-content/drafts', icon: FileText, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Lịch đăng bài', href: '/admin/ai-content/schedule', icon: Clock, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Lịch sử AI Jobs', href: '/admin/ai-content/jobs', icon: History, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Cấu hình AI', href: '/admin/ai-content/settings', icon: Wrench, roles: ['super_admin', 'admin', 'marketing'] },

    // CRM Section
    { name: 'Quản lý Lead (CRM)', href: '/admin/leads', icon: FileSpreadsheet, roles: ['super_admin', 'admin', 'sale_manager', 'sale'] },
    { name: 'Dashboard Lead', href: '/admin/lead-dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'sale_manager'] },
    { name: 'Lịch hẹn tham quan', href: '/admin/lich-hen', icon: Calendar, roles: ['super_admin', 'admin', 'sale_manager', 'sale'] },
    { name: 'Quản lý Thành viên', href: '/admin/users', icon: Users, roles: ['super_admin', 'admin'] },
    { name: 'Cấu hình SEO URL', href: '/admin/seo', icon: Globe, roles: ['super_admin', 'admin', 'marketing'] },
    { name: 'Cài đặt hệ thống', href: '/admin/cai-dat', icon: Settings, roles: ['super_admin', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => hasRole(item.roles));

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FBF8F2] flex font-body text-[#1F1B16]">
        {/* Desktop Admin Sidebar (Luxury Dark Theme) */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#1F1B16] text-[#E8DCCB] shrink-0 border-r border-[#1F1B16]">
          {/* Brand / Logo */}
          <div className="h-20 flex items-center px-6 border-b border-white/5 gap-2">
            <svg className="h-6 text-[#B88746] fill-current" viewBox="0 0 100 30">
              <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
            </svg>
            <span className="font-heading font-medium tracking-widest text-[#B88746]">ADMIN</span>
          </div>

          {/* User Card */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B88746]/20 text-[#B88746] flex items-center justify-center font-bold text-lg border border-[#B88746]/50">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-sm text-white truncate">{user.name}</h4>
                <span className="text-xs text-[#8C7A6B] block capitalize truncate">
                  🛡️ {hasRole('super_admin') ? 'Super Admin' : hasRole('admin') ? 'Admin' : hasRole('marketing') ? 'Marketing' : hasRole('sale_manager') ? 'Sales Manager' : 'Sales Agent'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#B88746] text-white shadow-[0_4px_12px_rgba(184,135,70,0.25)]'
                      : 'text-[#E8DCCB]/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-white/5 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#E8DCCB]/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              Xem trang chủ
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Navbar */}
          <header className="lg:hidden h-16 bg-[#1F1B16] text-[#E8DCCB] flex items-center justify-between px-6 z-20 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <svg className="h-6 text-[#B88746] fill-current" viewBox="0 0 100 30">
                <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
              </svg>
              <span className="font-heading font-medium text-xs text-[#B88746]">ADMIN</span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 border border-white/10 rounded-lg text-[#E8DCCB] hover:bg-white/5"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Sidebar Drawer */}
          {isMobileOpen && (
            <div className="lg:hidden fixed inset-0 z-30 flex">
              <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-64 bg-[#1F1B16] text-[#E8DCCB] h-full flex flex-col z-40"
              >
                <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <svg className="h-6 text-[#B88746] fill-current" viewBox="0 0 100 30">
                      <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
                    </svg>
                  </Link>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1.5 border border-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#B88746]/20 text-[#B88746] flex items-center justify-center font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-white">{user.name}</h4>
                      <span className="text-xs text-[#8C7A6B]">🛡️ Quản trị viên</span>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {filteredMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#B88746] text-white'
                            : 'text-[#E8DCCB]/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#E8DCCB]/70"
                  >
                    <Home className="w-5 h-5" />
                    Xem trang chủ
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Scrollable Content Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
