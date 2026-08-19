import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { PlanDraft, ScopeProduct } from "./plan-form.types";

type Envelope<T> = { result: T };
type ProductPage = { items: ScopeProduct[] };

export async function getScopeProducts() {
  const { data } = await api.get<Envelope<ProductPage>>(endpoints.products.list, {
    params: { recordFrom: 0, recordTo: 500 },
  });
  return data.result.items;
}

export async function createPlan(draft: PlanDraft, productIds: number[]) {
  const scope = draft.scope === "PRODUCT" ? undefined : draft.scope === "ALL" ? { all: true } : { categories: draft.categories, metals: draft.metals, genders: draft.genders, jewelrySubTypeIds: draft.jewelrySubTypeIds, coinTypes: draft.coinTypes };
  const payload = draft.type === "DISCOUNT"
    ? { type: draft.type, productIds, scope, discount: { percent: draft.percent, startDate: draft.startDate, expireDate: draft.expireDate, title: draft.title.trim(), description: draft.description.trim() || null } }
    : draft.type === "RESERVE"
      ? { type: draft.type, productIds, scope, reserve: { percent: draft.percent } }
      : { type: draft.type, productIds, scope, installment: { count: draft.installmentCount, days: draft.installmentDays } };
  const { data } = await api.post(endpoints.products.createPlan, payload);
  return (data?.result ?? data) as { id: number };
}
