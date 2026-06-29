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

export type ProjectDetail = {
  id?: number;
  slug: string;
  badge?: string;
  salesStatus?: string;
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
  connectivity: { time: string; label: string }[];
  amenities: {
    title: string;
    description: string;
    image: string;
    icon: ProjectIconName;
  }[];
  floorTabs: string[];
  floorPlans: {
    productType?: string;
    name: string;
    area?: string;
    totalArea?: string;
    image?: string;
    price?: string;
    bedrooms?: string;
    status?: string;
    description?: string;
  }[];
  priceRows: {
    productType: string;
    area: string;
    price: string;
    bedrooms?: string;
    status?: string;
    note?: string;
    description?: string;
  }[];
  productSummary: { label: string; value: string }[];
  policies: { title: string; description: string; icon: ProjectIconName }[];
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
