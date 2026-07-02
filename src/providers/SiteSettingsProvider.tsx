"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { projectsHero, projectsCta } from "@/data/projectsSeed";
import { newsHero, newsCta } from "@/data/newsSeed";
import { 
  aboutHero, 
  aboutIntro, 
  aboutMetrics, 
  coreValues, 
  awards, 
  ecosystem, 
  aboutPartners, 
  sustainability, 
  whyChoose, 
  brandStory, 
  aboutFaqs, 
  contactCta,
  visionMission,
  timeline
} from "@/data/aboutSeed";
import { defaultCollections, AboutPageCollectionItem } from "@/data/collectionsSeed";
import { publicFooterColumns } from "@/data/publicNavigation";
import { FooterColumn } from "@/types";

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
  brochureUrl?: string;
  image: string;
  overview: { value: string; label: string }[];
}

export interface ProjectsPageCta {
  label: string;
  title: string;
  primaryButton: string;
  secondaryButton: string;
  brochureUrl?: string;
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

export interface AboutPageHero {
  breadcrumb: string[];
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  image: string;
  statsCard: { value: string; label: string; icon: string }[];
}

export interface AboutPageIntro {
  label: string;
  title: string;
  paragraphs: string[];
  button: string;
  images: string[];
}

export interface AboutPageMetric {
  value: string;
  label: string;
  icon: string;
}

export interface AboutPageValue {
  title: string;
  description: string;
  icon: string;
}

export interface AboutPageAward {
  title: string;
  description: string;
}

export interface AboutPageEcosystem {
  ecosystem: { title: string; description: string; image: string }[];
  partners: string[];
}

export interface AboutPageSustainability {
  title: string;
  image: string;
  pillars: { title: string; description: string; icon: string }[];
}

export interface AboutPageWhyChoose {
  title: string;
  description: string;
  icon: string;
}

export interface AboutPageBrandStory {
  title: string;
  description: string;
  button: string;
  image: string;
}

export interface AboutPageFaq {
  question: string;
  answer: string;
}

export interface AboutPageContactCta {
  label: string;
  title: string;
  description: string;
  image: string;
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
  aboutPageHero: AboutPageHero;
  aboutPageIntro: AboutPageIntro;
  aboutPageMetrics: AboutPageMetric[];
  aboutPageValues: AboutPageValue[];
  aboutPageAwards: AboutPageAward[];
  aboutPageEcosystem: AboutPageEcosystem;
  aboutPageCollections: AboutPageCollectionItem[];
  aboutPageSustainability: AboutPageSustainability;
  aboutPageWhyChoose: AboutPageWhyChoose[];
  aboutPageBrandStory: AboutPageBrandStory;
  aboutPageFaqs: AboutPageFaq[];
  aboutPageContactCta: AboutPageContactCta;
  aboutMission: string;
  aboutVision: string;
  aboutTimeline: { year: string; title: string }[];
  footerNavigation: FooterColumn[];
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
  aboutPageHero: aboutHero,
  aboutPageIntro: aboutIntro,
  aboutPageMetrics: aboutMetrics,
  aboutPageValues: coreValues,
  aboutPageAwards: awards,
  aboutPageEcosystem: {
    ecosystem: ecosystem,
    partners: aboutPartners,
  },
  aboutPageCollections: defaultCollections,
  aboutPageSustainability: sustainability,
  aboutPageWhyChoose: whyChoose,
  aboutPageBrandStory: brandStory,
  aboutPageFaqs: aboutFaqs,
  aboutPageContactCta: contactCta,
  aboutMission: visionMission[1]?.description || "",
  aboutVision: visionMission[0]?.description || "",
  aboutTimeline: timeline,
  footerNavigation: publicFooterColumns,
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
                brochureUrl: parsed.brochureUrl || projectsHero.brochureUrl || "",
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
                brochureUrl: parsed.brochureUrl || projectsCta.brochureUrl || projectsPageHero.brochureUrl || "",
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

        let aboutPageHero = aboutHero;
        if (data.about_page_hero) {
          try {
            const parsed =
              typeof data.about_page_hero === "string"
                ? JSON.parse(data.about_page_hero)
                : data.about_page_hero;
            if (parsed) {
              aboutPageHero = {
                breadcrumb: parsed.breadcrumb || aboutHero.breadcrumb,
                badge: parsed.badge || aboutHero.badge,
                title: parsed.title || aboutHero.title,
                description: parsed.description || aboutHero.description,
                primaryCta: parsed.primaryCta || aboutHero.primaryCta,
                secondaryCta: parsed.secondaryCta || aboutHero.secondaryCta,
                image: parsed.image || aboutHero.image,
                statsCard: parsed.statsCard || aboutHero.statsCard,
              };
            }
          } catch {
            // keep default
          }
        }

        let aboutPageIntro = aboutIntro;
        if (data.about_page_intro) {
          try {
            const parsed =
              typeof data.about_page_intro === "string"
                ? JSON.parse(data.about_page_intro)
                : data.about_page_intro;
            if (parsed) {
              aboutPageIntro = {
                label: parsed.label || aboutIntro.label,
                title: parsed.title || aboutIntro.title,
                paragraphs: parsed.paragraphs || aboutIntro.paragraphs,
                button: parsed.button || aboutIntro.button,
                images: parsed.images || aboutIntro.images,
              };
            }
          } catch {
            // keep default
          }
        }

        let aboutPageMetrics = aboutMetrics;
        if (data.about_page_metrics) {
          try {
            const parsed =
              typeof data.about_page_metrics === "string"
                ? JSON.parse(data.about_page_metrics)
                : data.about_page_metrics;
            if (Array.isArray(parsed)) {
              aboutPageMetrics = parsed;
            }
          } catch {
            // keep default
          }
        }

        let aboutPageValues = coreValues;
        if (data.about_page_values) {
          try {
            const parsed =
              typeof data.about_page_values === "string"
                ? JSON.parse(data.about_page_values)
                : data.about_page_values;
            if (Array.isArray(parsed)) {
              aboutPageValues = parsed;
            }
          } catch {
            // keep default
          }
        }

        let aboutPageAwards = awards;
        if (data.about_page_awards) {
          try {
            const parsed =
              typeof data.about_page_awards === "string"
                ? JSON.parse(data.about_page_awards)
                : data.about_page_awards;
            if (Array.isArray(parsed)) {
              aboutPageAwards = parsed;
            }
          } catch {
            // keep default
          }
        }

        let aboutPageEcosystem = { ecosystem, partners: aboutPartners };
        if (data.about_page_ecosystem) {
          try {
            const parsed =
              typeof data.about_page_ecosystem === "string"
                ? JSON.parse(data.about_page_ecosystem)
                : data.about_page_ecosystem;
            if (parsed) {
              aboutPageEcosystem = {
                ecosystem: parsed.ecosystem || ecosystem,
                partners: parsed.partners || aboutPartners,
              };
            }
          } catch {
            // keep default
          }
        }

        let aboutPageCollections = defaultCollections;
        if (data.about_page_collections) {
          try {
            const parsed =
              typeof data.about_page_collections === "string"
                ? JSON.parse(data.about_page_collections)
                : data.about_page_collections;
            if (Array.isArray(parsed)) {
              aboutPageCollections = parsed;
            }
          } catch {
            // keep default
          }
        }

        let aboutPageSustainability = sustainability;
        if (data.about_page_sustainability) {
          try {
            const parsed =
              typeof data.about_page_sustainability === "string"
                ? JSON.parse(data.about_page_sustainability)
                : data.about_page_sustainability;
            if (parsed) {
              aboutPageSustainability = {
                title: parsed.title || sustainability.title,
                image: parsed.image || sustainability.image,
                pillars: parsed.pillars || sustainability.pillars,
              };
            }
          } catch {
            // keep default
          }
        }

        let aboutPageWhyChoose = whyChoose;
        if (data.about_page_why_choose) {
          try {
            const parsed =
              typeof data.about_page_why_choose === "string"
                ? JSON.parse(data.about_page_why_choose)
                : data.about_page_why_choose;
            if (Array.isArray(parsed)) {
              aboutPageWhyChoose = parsed;
            }
          } catch {
            // keep default
          }
        }

        let aboutPageBrandStory = brandStory;
        if (data.about_page_brand_story) {
          try {
            const parsed =
              typeof data.about_page_brand_story === "string"
                ? JSON.parse(data.about_page_brand_story)
                : data.about_page_brand_story;
            if (parsed) {
              aboutPageBrandStory = {
                title: parsed.title || brandStory.title,
                description: parsed.description || brandStory.description,
                button: parsed.button || brandStory.button,
                image: parsed.image || brandStory.image,
              };
            }
          } catch {
            // keep default
          }
        }

        let aboutPageFaqs = aboutFaqs;
        if (data.about_page_faqs) {
          try {
            const parsed =
              typeof data.about_page_faqs === "string"
                ? JSON.parse(data.about_page_faqs)
                : data.about_page_faqs;
            if (Array.isArray(parsed)) {
              aboutPageFaqs = parsed;
            }
          } catch {
            // keep default
          }
        }

        let aboutPageContactCta = contactCta;
        if (data.about_page_contact_cta) {
          try {
            const parsed =
              typeof data.about_page_contact_cta === "string"
                ? JSON.parse(data.about_page_contact_cta)
                : data.about_page_contact_cta;
            if (parsed) {
              aboutPageContactCta = {
                label: parsed.label || contactCta.label,
                title: parsed.title || contactCta.title,
                description: parsed.description || contactCta.description,
                image: parsed.image || contactCta.image,
              };
            }
          } catch {
            // keep default
          }
        }

        let aboutMission = visionMission[1]?.description || "";
        if (data.about_mission) {
          aboutMission = data.about_mission;
        }

        let aboutVision = visionMission[0]?.description || "";
        if (data.about_vision) {
          aboutVision = data.about_vision;
        }

        let aboutTimeline = timeline;
        if (data.about_timeline) {
          try {
            const parsed =
              typeof data.about_timeline === "string"
                ? JSON.parse(data.about_timeline)
                : data.about_timeline;
            if (Array.isArray(parsed)) {
              aboutTimeline = parsed;
            }
          } catch {
            // keep default
          }
        }

        let footerNavigation = publicFooterColumns;
        if (data.footer_navigation) {
          try {
            const parsed =
              typeof data.footer_navigation === "string"
                ? JSON.parse(data.footer_navigation)
                : data.footer_navigation;
            if (Array.isArray(parsed) && parsed.length > 0) {
              footerNavigation = parsed;
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
          aboutPageHero,
          aboutPageIntro,
          aboutPageMetrics,
          aboutPageValues,
          aboutPageAwards,
          aboutPageEcosystem,
          aboutPageCollections,
          aboutPageSustainability,
          aboutPageWhyChoose,
          aboutPageBrandStory,
          aboutPageFaqs,
          aboutPageContactCta,
          aboutMission,
          aboutVision,
          aboutTimeline,
          footerNavigation,
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
