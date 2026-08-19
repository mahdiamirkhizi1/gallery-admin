export type PlanType = "NORMAL" | "DISCOUNT" | "RESERVE" | "INSTALLMENT";
export type PlanProduct = { product: { id: number; title: string; category: "JEWELRY" | "COIN" | "BULLION" } };
export type Plan = {
  id: number; type: PlanType; isActive: boolean; createdAt: string; updatedAt: string;
  discountPlan?: { percent: number; title?: string; description?: string; startDate: string; expireDate: string; isActive: boolean };
  reservePlan?: { percent: number; isActive: boolean };
  installmentPlan?: { count: number; days: number; isActive: boolean };
  productPlans?: PlanProduct[];
  _count?: { productPlans: number; orderItems: number };
};
export type PlanPage = { items: Plan[]; totalCount: number; recordFrom: number; recordTo: number; hasMore: boolean };
