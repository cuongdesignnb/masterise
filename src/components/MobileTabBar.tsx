"use client";

import React from "react";
import Link from "next/link";
import { Building2, Home, Menu, MessageSquare, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { trackEvent } from "@/services/trackingService";

export default function MobileTabBar() {
  const { hotline, socialLinks } = useSiteSettings();
  const cleanPhone = hotline.replace(/\D/g, "");
  const zaloHandle = (socialLinks.zalo || cleanPhone).trim();
  const zaloUrl = zaloHandle.startsWith("http")
    ? zaloHandle
    : `https://zalo.me/${zaloHandle.replace(/\D/g, "") || zaloHandle}`;

  const triggerMobileMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("toggle-mobile-menu"));
  };

  const handleZaloChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!zaloHandle) return;
    trackEvent("click_zalo", { source: "mobile_tab_bar" });
    window.open(zaloUrl, "_blank", "noopener,noreferrer");
  };

  const handleHotlineCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cleanPhone) return;
    trackEvent("click_hotline", { source: "mobile_tab_bar" });
    window.location.href = `tel:${cleanPhone}`;
  };

  const menuItems = [
    {
      label: "Trang chủ",
      icon: Home,
      href: "/",
    },
    {
      label: "Dự án",
      icon: Building2,
      href: "/du-an",
    },
    {
      label: "Zalo",
      icon: MessageSquare,
      href: "#",
      onClick: handleZaloChat,
    },
    {
      label: "Gọi ngay",
      icon: Phone,
      href: "#",
      onClick: handleHotlineCall,
    },
    {
      label: "Danh mục",
      icon: Menu,
      href: "#",
      onClick: triggerMobileMenu,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#E8DCCB]/65 bg-white/90 px-1 shadow-[0_-8px_30px_rgba(87,61,28,0.08)] backdrop-blur-xl pb-safe lg:hidden">
      {menuItems.map((item) => {
        const Icon = item.icon;

        const buttonContent = (
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="flex h-12 w-full flex-col items-center justify-center text-[#6F665C] transition-colors duration-200 hover:text-[#B88746]"
          >
            <Icon size={20} className="stroke-[1.8] group-hover:text-[#B88746]" />
            <span className="heading-font mt-1 text-[9px] font-bold uppercase leading-none tracking-tight">
              {item.label}
            </span>
          </motion.div>
        );

        if (item.onClick) {
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="group flex flex-1 flex-col items-center justify-center focus:outline-none"
              aria-label={item.label}
            >
              {buttonContent}
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-1 flex-col items-center justify-center"
            aria-label={item.label}
          >
            {buttonContent}
          </Link>
        );
      })}
    </div>
  );
}
