"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface SocialLinks {
  facebook: string;
  youtube: string;
  zalo: string;
  instagram: string;
  linkedin: string;
}

export interface ContactDepartment {
  name: string;
  phone: string;
  email: string;
  description?: string;
  time?: string;
  icon?: string;
}

export interface SiteSettings {
  companyName: string;
  companyAddress: string;
  hotline: string;
  email: string;
  logoUrl: string;
  socialLinks: SocialLinks;
  contactDepartments: ContactDepartment[];
  isLoaded: boolean;
}

const defaultSettings: SiteSettings = {
  companyName: "Masterise Homes",
  companyAddress: "",
  hotline: "",
  email: "",
  logoUrl: "",
  socialLinks: {
    facebook: "",
    youtube: "",
    zalo: "",
    instagram: "",
    linkedin: "",
  },
  contactDepartments: [],
  isLoaded: false,
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export default function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const response = await api.get<Record<string, string | null>>(
          "/settings/public"
        );
        const data = response.data;
        if (cancelled) return;

        let socialLinks: SocialLinks = defaultSettings.socialLinks;
        if (data.social_links) {
          try {
            const parsed =
              typeof data.social_links === "string"
                ? JSON.parse(data.social_links)
                : data.social_links;
            socialLinks = {
              facebook: parsed?.facebook || "",
              youtube: parsed?.youtube || "",
              zalo: parsed?.zalo || "",
              instagram: parsed?.instagram || "",
              linkedin: parsed?.linkedin || "",
            };
          } catch {
            // keep default
          }
        }

        let contactDepartments: ContactDepartment[] = [];
        if (data.contact_departments) {
          try {
            const parsed =
              typeof data.contact_departments === "string"
                ? JSON.parse(data.contact_departments)
                : data.contact_departments;
            if (Array.isArray(parsed)) {
              contactDepartments = parsed;
            }
          } catch {
            // keep default
          }
        }

        setSettings({
          companyName:
            (data.company_name as string) || defaultSettings.companyName,
          companyAddress: (data.company_address as string) || "",
          hotline: (data.hotline as string) || "",
          email: (data.email as string) || "",
          logoUrl: (data.logo_url as string) || "",
          socialLinks,
          contactDepartments,
          isLoaded: true,
        });
      } catch {
        // On error, mark as loaded with defaults so UI doesn't break
        if (!cancelled) {
          setSettings((prev) => ({ ...prev, isLoaded: true }));
        }
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
