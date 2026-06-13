"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "@/data/seed";
import Container from "./Container";
import Button from "./Button";

export default function Header() {
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
            <Link
              href="#login"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-line hover:border-gold hover:text-gold text-muted transition-colors"
            >
              <User size={18} />
            </Link>
            <Button href="#login" variant="outline" size="sm">
              Đăng nhập
            </Button>
            <Button href="#register" variant="solid" size="sm">
              Đăng ký
            </Button>
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
              <Button
                href="#login"
                variant="outline"
                size="md"
                className="w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                Đăng nhập
              </Button>
              <Button
                href="#register"
                variant="solid"
                size="md"
                className="w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                Đăng ký
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
