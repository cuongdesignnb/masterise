export type ContactSectionKey =
  | "hero"
  | "commitments"
  | "introduction"
  | "salesTeam"
  | "achievements"
  | "contactForm"
  | "departments"
  | "faqs"
  | "cta";

export interface ContactCtaLink {
  label: string;
  url: string;
}

export interface ContactListItemBase {
  id: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ContactQuickInfo extends ContactListItemBase {
  label: string;
  value: string;
  icon: string;
}

export interface ContactCommitment extends ContactListItemBase {
  title: string;
  description: string;
  icon: string;
}

export interface ContactImage extends ContactListItemBase {
  url: string;
  alt: string;
}

export interface ContactBullet extends ContactListItemBase {
  text: string;
}

export interface ContactSalesMember extends ContactListItemBase {
  name: string;
  title: string;
  avatar: string;
  avatarAlt: string;
  description: string;
  responsibility: string;
  phone: string;
  email: string;
  zaloUrl: string;
  facebookUrl: string;
  tags: string[];
}

export interface ContactAchievement extends ContactListItemBase {
  value: string;
  suffix: string;
  label: string;
  description: string;
  icon: string;
}

export interface ContactMilestone extends ContactListItemBase {
  year: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  referenceUrl: string;
}

export interface ContactDepartment extends ContactListItemBase {
  name: string;
  description: string;
  phone: string;
  email: string;
  workingHours: string;
  icon: string;
}

export interface ContactFaq extends ContactListItemBase {
  question: string;
  answer: string;
}

export interface ContactPageContent {
  sectionOrder: ContactSectionKey[];
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  };
  hero: {
    enabled: boolean;
    sortOrder: number;
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    primaryCta: ContactCtaLink;
    secondaryCta: ContactCtaLink;
    hotlineLine: string;
    responseLine: string;
    quickInfo: ContactQuickInfo[];
  };
  commitments: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    items: ContactCommitment[];
  };
  introduction: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    paragraphs: string[];
    images: ContactImage[];
    bullets: ContactBullet[];
    cta: ContactCtaLink;
  };
  salesTeam: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    items: ContactSalesMember[];
  };
  achievements: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    metricsEnabled: boolean;
    milestonesEnabled: boolean;
    metrics: ContactAchievement[];
    milestones: ContactMilestone[];
  };
  contactForm: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    officeTitle: string;
    hotline: string;
    email: string;
    address: string;
    workingHours: string;
    mapUrl: string;
    mapEmbedUrl: string;
    mapImage: string;
    mapImageAlt: string;
    directionsLabel: string;
    directionsUrl: string;
  };
  departments: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    items: ContactDepartment[];
  };
  faqs: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    items: ContactFaq[];
  };
  cta: {
    enabled: boolean;
    sortOrder: number;
    label: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    primaryCta: ContactCtaLink;
    secondaryCta: ContactCtaLink;
  };
}

export interface ContactPageSiteDetails {
  companyName: string;
  companyAddress: string;
  hotline: string;
  email: string;
  logoUrl: string;
  socialLinks: Record<string, string>;
}
