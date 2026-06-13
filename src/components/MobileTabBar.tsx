"use client";

import React from "react";
import Link from "next/link";
import { Home, Building2, Phone, Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileTabBar() {
  const triggerMobileMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Dispatch custom event to toggle the mobile menu in Header.tsx
    window.dispatchEvent(new CustomEvent("toggle-mobile-menu"));
  };

  const menuItems = [
    {
      label: "Trang chủ",
      icon: Home,
      href: "#",
    },
    {
      label: "Dự án HOT",
      icon: Building2,
      href: "#du-an-hot",
    },
    {
      label: "Liên hệ",
      icon: Phone,
      href: "tel:18006886", // Typical hotline number style
    },
    {
      label: "Danh mục",
      icon: Menu,
      href: "#",
      onClick: triggerMobileMenu,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#E8DCCB]/65 h-16 shadow-[0_-8px_30px_rgba(87,61,28,0.08)] flex items-center justify-around px-2 lg:hidden pb-safe">
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        
        const ButtonContent = (
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center justify-center w-16 h-12 text-[#6F665C] hover:text-[#B88746] transition-colors duration-200 cursor-pointer"
          >
            <Icon size={20} className="stroke-[1.8] group-hover:text-[#B88746]" />
            <span className="text-[10px] font-bold mt-1 tracking-tight heading-font uppercase">
              {item.label}
            </span>
          </motion.div>
        );

        if (item.onClick) {
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className="group flex flex-col items-center justify-center focus:outline-none"
              aria-label={item.label}
            >
              {ButtonContent}
            </button>
          );
        }

        return (
          <Link
            key={idx}
            href={item.href}
            className="group flex flex-col items-center justify-center"
            aria-label={item.label}
          >
            {ButtonContent}
          </Link>
        );
      })}
    </div>
  );
}
