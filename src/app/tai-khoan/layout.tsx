'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Heart, 
  Calendar, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  Home
} from 'lucide-react';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/dang-nhap');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B88746] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8C7A6B] text-sm">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { name: 'Tổng quan', href: '/tai-khoan', icon: LayoutDashboard },
    { name: 'Hồ sơ cá nhân', href: '/tai-khoan/ho-so', icon: UserIcon },
    { name: 'Dự án đã lưu', href: '/tai-khoan/du-an', icon: Heart },
    { name: 'Lịch hẹn của tôi', href: '/tai-khoan/lich-hen', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F2] flex font-body text-[#1F1B16]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E8DCCB] shrink-0">
        {/* Brand / Logo */}
        <div className="h-20 flex items-center px-6 border-b border-[#E8DCCB]">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-6 text-[#B88746] fill-current" viewBox="0 0 100 30">
              <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
            </svg>
            <span className="font-heading font-medium tracking-wider text-[#1F1B16]">PORTAL</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-[#E8DCCB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center font-bold text-lg uppercase border border-[#B88746]/30">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-medium text-sm truncate">{user.name}</h4>
              <span className="text-xs text-[#8C7A6B] block truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#B88746] text-white shadow-[0_4px_12px_rgba(184,135,70,0.15)]'
                    : 'text-[#8C7A6B] hover:bg-[#B88746]/5 hover:text-[#B88746]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E8DCCB] space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8C7A6B] hover:bg-[#B88746]/5 hover:text-[#B88746] transition-all"
          >
            <Home className="w-5 h-5" />
            Trang chủ Masterise
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-[#E8DCCB] flex items-center justify-between px-6 z-20 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-6 text-[#B88746] fill-current" viewBox="0 0 100 30">
              <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
            </svg>
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 border border-[#E8DCCB] rounded-lg text-[#1F1B16] hover:bg-[#FBF8F2] transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Menu Backdrop & Drawer */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 bg-white h-full flex flex-col z-40 border-r border-[#E8DCCB]"
            >
              <div className="h-16 flex items-center px-6 border-b border-[#E8DCCB] justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                  <svg className="h-6 text-[#B88746] fill-current" viewBox="0 0 100 30">
                    <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
                  </svg>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 border border-[#E8DCCB] rounded-lg text-[#1F1B16]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 border-b border-[#E8DCCB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center font-bold text-lg uppercase border border-[#B88746]/30">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{user.name}</h4>
                    <span className="text-xs text-[#8C7A6B] block">{user.email}</span>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
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
                          : 'text-[#8C7A6B] hover:bg-[#B88746]/5 hover:text-[#B88746]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#E8DCCB] space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8C7A6B]"
                >
                  <Home className="w-5 h-5" />
                  Trang chủ
                </Link>
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
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
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
