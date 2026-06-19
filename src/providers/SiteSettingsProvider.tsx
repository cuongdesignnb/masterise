"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { projectsHero, projectsCta } from "@/data/projectsSeed";
import { newsHero, newsCta } from "@/data/newsSeed";

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

export interface ProjectsPageHero {
  breadcrumb: string[];
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  image: string;
  overview: { value: string; label: string }[];
}

export interface ProjectsPageCta {
  label: string;
  title: string;
  primaryButton: string;
  secondaryButton: string;
  image: string;
}

export interface NewsPageHero {
  breadcrumb: string[];
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  image: string;
  highlight: {
    label: string;
    title: string;
    cta: string;
  };
}

export interface NewsPageCta {
  title: string;
  description: string;
  button: string;
}

export interface SiteSettings {
  companyName: string;
  companyAddress: string;
  hotline: string;
  email: string;
  logoUrl: string;
  socialLinks: SocialLinks;
  contactDepartments: ContactDepartment[];
  projectsPageHero: ProjectsPageHero;
  projectsPageCta: ProjectsPageCta;
  newsPageHero: NewsPageHero;
  newsPageCta: NewsPageCta;
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
  projectsPageHero: projectsHero,
  projectsPageCta: projectsCta,
  newsPageHero: newsHero,
  newsPageCta: newsCta,
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

        let projectsPageHero = projectsHero;
        if (data.projects_page_hero) {
          try {
            const parsed =
              typeof data.projects_page_hero === "string"
                ? JSON.parse(data.projects_page_hero)
                : data.projects_page_hero;
            if (parsed) {
              projectsPageHero = {
                breadcrumb: parsed.breadcrumb || projectsHero.breadcrumb,
                badge: parsed.badge || projectsHero.badge,
                title: parsed.title || projectsHero.title,
                description: parsed.description || projectsHero.description,
                primaryCta: parsed.primaryCta || projectsHero.primaryCta,
                secondaryCta: parsed.secondaryCta || projectsHero.secondaryCta,
                image: parsed.image || projectsHero.image,
                overview: parsed.overview || projectsHero.overview,
              };
            }
          } catch {
            // keep default
          }
        }

        let projectsPageCta = projectsCta;
        if (data.projects_page_cta) {
          try {
            const parsed =
              typeof data.projects_page_cta === "string"
                ? JSON.parse(data.projects_page_cta)
                : data.projects_page_cta;
            if (parsed) {
              projectsPageCta = {
                label: parsed.label || projectsCta.label,
                title: parsed.title || projectsCta.title,
                primaryButton: parsed.primaryButton || projectsCta.primaryButton,
                secondaryButton: parsed.secondaryButton || projectsCta.secondaryButton,
                image: parsed.image || projectsCta.image,
              };
            }
          } catch {
            // keep default
          }
        }

        let newsPageHero = newsHero;
        if (data.news_page_hero) {
          try {
            const parsed =
              typeof data.news_page_hero === "string"
                ? JSON.parse(data.news_page_hero)
                : data.news_page_hero;
            if (parsed) {
              newsPageHero = {
                breadcrumb: parsed.breadcrumb || newsHero.breadcrumb,
                badge: parsed.badge || newsHero.badge,
                title: parsed.title || newsHero.title,
                description: parsed.description || newsHero.description,
                primaryCta: parsed.primaryCta || newsHero.primaryCta,
                secondaryCta: parsed.secondaryCta || newsHero.secondaryCta,
                image: parsed.image || newsHero.image,
                highlight: parsed.highlight || newsHero.highlight,
              };
            }
          } catch {
            // keep default
          }
        }

        let newsPageCta = newsCta;
        if (data.news_page_cta) {
          try {
            const parsed =
              typeof data.news_page_cta === "string"
                ? JSON.parse(data.news_page_cta)
                : data.news_page_cta;
            if (parsed) {
              newsPageCta = {
                title: parsed.title || newsCta.title,
                description: parsed.description || newsCta.description,
                button: parsed.button || newsCta.button,
              };
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
          projectsPageHero,
          projectsPageCta,
          newsPageHero,
          newsPageCta,
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
