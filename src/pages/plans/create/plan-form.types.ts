import type { PlanType } from "../plans.types";

export type PlanScope = "ALL" | "CATEGORY" | "PRODUCT";
export type ProductCategory = "JEWELRY" | "COIN" | "BULLION";
export type ScopeMetal = "GOLD" | "SILVER" | "COPPER" | "PLATINUM" | "IMITATION";
export type ScopeGender = "MAN" | "WOMAN" | "UNISEX" | "KID" | "NONE";
export type ScopeCoinType = "AZADI_FULL" | "AZADI_HALF" | "AZADI_QUARTER" | "GRAM" | "PARSIAN";

export type PlanDraft = {
  type: Exclude<PlanType, "NORMAL">;
  title: string;
  description: string;
  code: string;
  percent: number;
  startDate: string;
  expireDate: string;
  installmentCount: number;
  installmentDays: number;
  priority: number;
  isActive: boolean;
  scope: PlanScope;
  categories: ProductCategory[];
  metals: ScopeMetal[];
  genders: ScopeGender[];
  jewelrySubTypeIds: number[];
  coinTypes: ScopeCoinType[];
  productIds: number[];
};

export type ScopeProduct = {
  id: number;
  title: string;
  category: ProductCategory;
  status: string;
  metal: ScopeMetal;
  gender: ScopeGender;
  jewelry?: { jewelrySubType?: { id: number; name: string } };
  coin?: { coinType: ScopeCoinType };
  productPlans?: Array<{ plan: { id: number; type: string } }>;
};
