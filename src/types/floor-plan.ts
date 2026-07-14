export type FloorPlanItem = {
  key: string;
  productType: string;
  name: string;
  area: string;
  totalArea: string;
  description: string;
  price: string;
  bedrooms: string;
  status: string;
  images: string[];
};

export type FloorPlanTab = {
  key: string;
  label: string;
  items: FloorPlanItem[];
};

export type FloorPlanGroup = {
  key: string;
  label: string;
  tabs: FloorPlanTab[];
};

export type LegacyFloorPlanItem = Pick<FloorPlanItem, 'name'> & Partial<Omit<FloorPlanItem, 'key' | 'name' | 'images'>> & {
  key?: string;
  image?: string;
  images?: string[];
};
