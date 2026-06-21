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
  slug: string;
  badge: string;
  salesStatus?: string;
  name: string;
  subtitle: string;
  description: string;
  address: string;
  heroImage: string;
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
    name: string;
    area: string;
    totalArea: string;
    image: string;
  }[];
  priceRows: [string, string, string][];
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
  id?: number;
  virtualTourUrl?: string | null;
  mapImageUrl?: string | null;
  locationDescription?: string | null;
};

