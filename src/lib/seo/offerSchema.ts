export interface OfferInput {
  price?: number;
  priceCurrency?: string;
  lowPrice?: number;
  highPrice?: number;
  offerCount?: number;
  availability?: string;
}

const availabilityMap: Readonly<Record<string, string>> = {
  selling: 'https://schema.org/InStock',
  coming_soon: 'https://schema.org/PreOrder',
  sold_out: 'https://schema.org/OutOfStock',
  handing_over: 'https://schema.org/InStock',
  handover: 'https://schema.org/InStock',
  InStock: 'https://schema.org/InStock',
  OutOfStock: 'https://schema.org/OutOfStock',
  PreOrder: 'https://schema.org/PreOrder',
  LimitedAvailability: 'https://schema.org/LimitedAvailability',
};

const supportedSchemaAvailability = new Set([
  'https://schema.org/InStock',
  'https://schema.org/OutOfStock',
  'https://schema.org/PreOrder',
  'https://schema.org/LimitedAvailability',
]);

export function normalizeOfferAvailability(rawAvailability?: string) {
  const availability = rawAvailability?.trim();
  if (!availability) return undefined;
  if (supportedSchemaAvailability.has(availability)) return availability;
  return availabilityMap[availability];
}

export function buildOffersNode(canonical: string, input: OfferInput) {
  const schemaAvailability = normalizeOfferAvailability(input.availability);

  if (input.lowPrice && input.lowPrice > 0) {
    return {
      '@type': 'AggregateOffer',
      '@id': `${canonical}#offers`,
      url: canonical,
      priceCurrency: input.priceCurrency || 'VND',
      lowPrice: input.lowPrice,
      highPrice: input.highPrice && input.highPrice >= input.lowPrice ? input.highPrice : input.lowPrice,
      offerCount: input.offerCount || undefined,
      availability: schemaAvailability,
    };
  }

  if (input.price && input.price > 0) {
    return {
      '@type': 'Offer',
      '@id': `${canonical}#offers`,
      url: canonical,
      priceCurrency: input.priceCurrency || 'VND',
      price: input.price,
      availability: schemaAvailability,
    };
  }

  return null;
}
