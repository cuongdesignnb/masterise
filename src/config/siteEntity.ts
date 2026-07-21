export type SiteEntityType = "Organization" | "RealEstateAgent";

export interface SiteEntityConfig {
  enabled: boolean;
  type: SiteEntityType;
  name: string;
  legalName?: string;
  taxId?: string;
  url: string;
  logoUrl?: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: "VN";
  };
  sameAs: string[];
  brand?: {
    name: string;
    url?: string;
  };
  authorizationNote?: string;
}

export function validateSiteEntity(config: unknown): SiteEntityConfig | null {
  if (!config || typeof config !== "object") return null;
  const raw = config as Partial<SiteEntityConfig>;
  if (!raw.name || !raw.url) return null;

  return {
    enabled: !!raw.enabled,
    type: raw.type === "RealEstateAgent" ? "RealEstateAgent" : "Organization",
    name: String(raw.name).trim(),
    legalName: raw.legalName ? String(raw.legalName).trim() : undefined,
    taxId: raw.taxId ? String(raw.taxId).trim() : undefined,
    url: String(raw.url).trim(),
    logoUrl: raw.logoUrl ? String(raw.logoUrl).trim() : undefined,
    email: raw.email ? String(raw.email).trim() : undefined,
    telephone: raw.telephone ? String(raw.telephone).trim() : undefined,
    address: raw.address
      ? {
          streetAddress: raw.address.streetAddress ? String(raw.address.streetAddress).trim() : undefined,
          addressLocality: raw.address.addressLocality ? String(raw.address.addressLocality).trim() : undefined,
          addressRegion: raw.address.addressRegion ? String(raw.address.addressRegion).trim() : undefined,
          postalCode: raw.address.postalCode ? String(raw.address.postalCode).trim() : undefined,
          addressCountry: "VN",
        }
      : undefined,
    sameAs: Array.isArray(raw.sameAs)
      ? raw.sameAs.map(String).map((s) => s.trim()).filter((s) => /^https?:\/\//i.test(s))
      : [],
    brand: raw.brand?.name
      ? {
          name: String(raw.brand.name).trim(),
          url: raw.brand.url ? String(raw.brand.url).trim() : undefined,
        }
      : undefined,
    authorizationNote: raw.authorizationNote ? String(raw.authorizationNote).trim() : undefined,
  };
}
