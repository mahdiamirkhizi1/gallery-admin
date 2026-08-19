export type CategoryType = "JEWELRY" | "COIN" | "BULLION";
export type MetalType = "GOLD" | "SILVER" | "COPPER" | "PLATINUM" | "IMITATION";
export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productType: CategoryType;
  metal: MetalType;
  displayOrder: number;
  image?: { preview?: string } | null;
  features: string[];
  isActive: boolean;
  _count: { jewelries: number };
};
export type CategoryPage = {
  items: Category[];
  totalCount: number;
  recordFrom: number;
  recordTo: number;
  hasMore: boolean;
};
export type CategoryDraft = Omit<Category, "id" | "parent" | "_count">;
