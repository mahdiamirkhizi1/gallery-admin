import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { PlanPage } from "./plans.types";
type Envelope<T> = { result: T };
export async function getPlans() {
  const { data } = await api.get<Envelope<PlanPage>>(endpoints.products.plans, { params: { recordFrom: 0, recordTo: 100 } });
  return data.result;
}
export async function updatePlanStatus({ id, isActive }: { id: number; isActive: boolean }) {
  const { data } = await api.patch(endpoints.products.updatePlanStatus(id), { isActive });
  return data;
}
export async function deletePlan(id: number) {
  const { data } = await api.delete(endpoints.products.deletePlan(id));
  return data;
}
