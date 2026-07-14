import type { FloorPlanGroup, LegacyFloorPlanItem } from './floor-plan';

export type ProjectIconName =
  | "BadgeDollarSign"
  | "Building2"
  | "CalendarDays"
  | "ClipboardCheck"
  | "Dumbbell"
  | "FileCheck2"
  | "GraduationCap"
  | "HardHat"
  | "LandPlot"
  | "MapPin"
  | "Network"
  | "PanelsTopLeft"
  | "ShieldCheck"
  | "Sparkles"
  | "Store"
  | "Trees"
  | "TrendingUp"
  | "Waves";

export type IconDetail = {
  label: string;
  value: string;
  icon: ProjectIconName;
};

export type ProjectPriceItem =
  | {
      kind: "row";
      productType: string;
      area?: string;
      price?: string;
      payment?: string;
      status?: string;
      note?: string;
      description?: string;
    }
  | {
      kind: "image";
      title?: string;
      description?: string;
      imageUrl: string;
      buttonLabel?: string;
    }
  | {
      kind: "file";
      title?: string;
      description?: string;
      fileUrl: string;
      fileType?: "pdf" | "excel" | "word" | "image" | "other";
      fileSize?: string;
      buttonLabel?: string;
    }
  | {
      kind: "note";
      title?: string;
      description?: string;
      highlight?: boolean;
    };

export type ProjectPolicyCard = {
  title: string;
  description?: string;
  imageUrl?: string;
  icon: ProjectIconName;
  badge?: string;
  bullets: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  fileUrl?: string;
};

export type ProjectDetail = {
  id?: number;
  slug: string;
  badge?: string;
  projectStatus?: string;
  name: string;
  subtitle: string;
  description: string;
  content?: string;
  address: string;
  heroImage: string;
  thumbnail?: string | null;
  priceFrom: string;
  quickCard: IconDetail[];
  facts: IconDetail[];
  stats: { value: string; label: string }[];
  gallery: {
    label: string;
    title: string;
    description: string;
    images: string[];
  };
  detailGallery: {
    label: string;
    title: string;
    description: string;
    images: string[];
  };
  sectionTitles?: Record<string, { eyebrow?: string; title?: string }>;
  connectivity: { time: string; label: string }[];
  amenities: {
    title: string;
    description: string;
    image: string;
    icon: ProjectIconName;
  }[];
  floorTabs: string[];
  floorPlanGroups?: FloorPlanGroup[];
  floorPlans: LegacyFloorPlanItem[];
  handoverStandards: {
    title: string;
    description: string;
    image?: string;
    icon: ProjectIconName;
  }[];
  priceRows: ProjectPriceItem[];
  productSummary: { label: string; value: string }[];
  policies: ProjectPolicyCard[];
  timeline: { date: string; title: string }[];
  investmentReasons: {
    title: string;
    description: string;
    icon: ProjectIconName;
  }[];
  testimonials: {
    name: string;
    role: string;
    content: string;
    avatar: string;
  }[];
  faqs: { question: string; answer: string }[];
  brochureUrl?: string | null;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  mapImageUrl?: string | null;
  locationDescription?: string | null;
  seo?: unknown;
  schemaPrice?: string | number | null;
  schemaPriceCurrency?: string | null;
  schemaAvailability?: string | null;
};
