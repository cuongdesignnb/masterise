export type NavItem = {
  label: string;
  href: string;
};

export type HeroSlide = {
  id: number;
  titleLines: string[];
  highlight: string;
  description: string;
  image: string;
};

export type SearchFilter = {
  id: string;
  label: string;
  placeholder: string;
};

export type StatItem = {
  id: number;
  value: number;
  suffix: string;
  label: string;
  icon: string;
};

export type Project = {
  id: number;
  name: string;
  location: string;
  price: string;
  image: string;
  badge?: string;
  status?: "hot" | "best-seller" | "upcoming" | "selling" | "done";
  sales_status?: string;
  type?: string;
  description?: string;
  slug?: string;
  project_label?: string | null;
};

export type CollectionItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: string;
};

export type RegionItem = {
  id: number;
  name: string;
  count: number;
};

export type InvestmentItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export type PropertyTypeItem = {
  id: number;
  title: string;
  icon: string;
};

export type StatusProjectItem = {
  id: number;
  name: string;
  location: string;
  price?: string;
  badge?: string;
  image: string;
};

export type StatusColumn = {
  id: string;
  title: string;
  projects: StatusProjectItem[];
};

export type BenefitItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export type AmenityItem = {
  id: number;
  title: string;
  image: string;
};

export type TestimonialItem = {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
};

export type PartnerItem = {
  id: number;
  name: string;
};

export type NewsItem = {
  id: number;
  title: string;
  date: string;
  tag: string;
  image: string;
};

export type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

export type FooterColumn = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};
