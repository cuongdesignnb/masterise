"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "@/data/seed";
import Container from "./Container";
import Button from "./Button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, roles, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    const handleToggleMenu = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("toggle-mobile-menu", handleToggleMenu);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("toggle-mobile-menu", handleToggleMenu);
    };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-line shadow-soft py-3"
          : "bg-cream/80 backdrop-blur-md border-b border-line/50 py-4"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="28"
              height="28"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gold transition-transform duration-500 group-hover:rotate-12 flex-shrink-0"
            >
              <path
                d="M15 80V20L35 45L50 30L65 45L85 20V80"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M50 30V80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <path
                d="M15 80H25M75 80H85"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm sm:text-base font-bold tracking-[0.12em] text-ink uppercase heading-font leading-none transition-colors group-hover:text-gold">
              MASTERISE HOMES
            </span>
          </Link>

          {/* Center: Navigation Menu (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-sm text-ink hover:text-gold transition-colors duration-200 font-medium"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {item.label}
                {hoveredIdx === idx && (
                  <motion.span
                    layoutId="header-underline"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Auth buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/tai-khoan"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 hover:border-gold bg-gold/5 text-ink hover:text-gold transition-colors text-sm font-semibold"
                >
                  <div className="w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                {roles.some(role => ['super_admin', 'admin', 'marketing', 'sale_manager', 'sale'].includes(role)) && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold-dark hover:underline"
                  >
                    <LayoutDashboard size={14} />
                    Quản trị
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-muted hover:text-rose-600 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/dang-nhap"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-line hover:border-gold hover:text-gold text-muted transition-colors"
                >
                  <User size={18} />
                </Link>
                <Button href="/dang-nhap" variant="outline" size="sm">
                  Đăng nhập
                </Button>
                <Button href="/dang-ky" variant="solid" size="sm">
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* Hamburger Menu Icon (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-ink hover:text-gold transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink/35 backdrop-blur-sm z-[99] lg:hidden cursor-pointer"
          />
        )}

        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 h-screen w-[280px] sm:w-[320px] bg-[#FFFDF8] z-[100] shadow-luxury flex flex-col p-6 border-l border-[#E8DCCB]/60 lg:hidden text-left"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCB]/35 mb-5 flex-shrink-0">
              <span className="text-xs font-bold tracking-[0.15em] text-[#B88746] heading-font uppercase">
                Danh mục Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-ink hover:text-gold transition-colors focus:outline-none cursor-pointer"
                aria-label="Đóng Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex flex-col gap-1 overflow-y-auto pr-1 flex-grow">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="py-3 text-[14.5px] text-ink hover:text-gold border-b border-[#E8DCCB]/15 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="flex flex-col gap-3 pt-5 border-t border-[#E8DCCB]/35 mt-auto flex-shrink-0">
              {isLoading ? (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[#FBF8F2] rounded-xl border border-[#E8DCCB]/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm text-ink truncate">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    href="/tai-khoan"
                    variant="outline"
                    size="md"
                    className="w-full text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Vào trang cá nhân
                  </Button>
                  {roles.some(role => ['super_admin', 'admin', 'marketing', 'sale_manager', 'sale'].includes(role)) && (
                    <Button
                      href="/admin"
                      variant="solid"
                      size="md"
                      className="w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Trang quản trị
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 text-center text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Button
                    href="/dang-nhap"
                    variant="outline"
                    size="md"
                    className="w-full text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    href="/dang-ky"
                    variant="solid"
                    size="md"
                    className="w-full text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
