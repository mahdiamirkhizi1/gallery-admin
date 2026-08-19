export type Category = "JEWELRY" | "COIN" | "BULLION";
export type Gender = "WOMAN" | "MAN" | "UNISEX" | "KID" | "NONE";
export type ProductImage = { id: string; name: string; preview: string; isPrimary: boolean };
export type ProductVariantDraft = { id: string; weight: number; stock: number; sku: string };
export type ProductDraft = {
  title: string; category: Category; gender: Gender; metal: "GOLD" | "SILVER" | "COPPER" | "PLATINUM" | "IMITATION"; carat: number; description: string; sku: string;
  jewelry: { subTypeId: number; makingCost: number; wages: number; tax: number; isNew: boolean; attr: Record<string, string | number> };
  coin: { coinType: "AZADI_FULL" | "AZADI_HALF" | "AZADI_QUARTER" | "GRAM" | "PARSIAN"; mintRef: "BANK" | "NOT_BANK"; coinPattern: "GHADIM" | "EMAMI" };
  variants: ProductVariantDraft[]; images: ProductImage[]; existingPlanIds: number[]; labelIds: number[]; regularSale: boolean; status: "DRAFT"|"PUBLISHED"|"INACTIVE";
};
export type ProductLabel = { id:number; title:string; slug:string; description?:string|null; isActive:boolean; showOnProductCard:boolean; showInFilters:boolean; showAsProductRow:boolean; scopeMetals:("GOLD"|"SILVER"|"COPPER"|"PLATINUM"|"IMITATION")[]; scopeCategories:("JEWELRY"|"COIN"|"BULLION")[]; sortOrder:number; startAt?:string|null; endAt?:string|null; _count?:{products:number} };
export type ProductPlan = { id: number; type: "INSTALLMENT" | "RESERVE" | "DISCOUNT"; isActive: boolean; discountPlan?: { title?: string; percent: number }; reservePlan?: { percent: number }; installmentPlan?: { count: number; days: number } };
