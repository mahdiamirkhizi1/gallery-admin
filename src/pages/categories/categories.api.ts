import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { CategoryDraft, CategoryPage } from "./categories.types";
type Envelope<T> = { result: T };
export async function getCategories(
  params: { page?: number; search?: string; isActive?: string; metal?: string; productType?: string } = {},
) {
  const from = ((params.page ?? 1) - 1) * 20;
  const { data } = await api.get<Envelope<CategoryPage>>(
    endpoints.products.categories,
    {
      params: {
        recordFrom: from,
        recordTo: from + 20,
        search: params.search || undefined,
        isActive: params.isActive || undefined,
        metal: params.metal || undefined,
        productType: params.productType || undefined,
      },
    },
  );
  return data.result;
}
export async function createCategory(payload: CategoryDraft) {
  const { data } = await api.post(endpoints.products.categories, payload);
  return data;
}
export async function updateCategory({
  id,
  payload,
}: {
  id: number;
  payload: Pick<CategoryDraft, "name" | "slug">;
}) {
  const { data } = await api.patch(endpoints.products.category(id), payload);
  return data;
}
export async function updateCategoryStatus({
  id,
  isActive,
}: {
  id: number;
  isActive: boolean;
}) {
  const { data } = await api.patch(endpoints.products.categoryStatus(id), {
    isActive,
  });
  return data;
}
export async function deleteCategory(id: number) {
  const { data } = await api.delete(endpoints.products.category(id));
  return data;
}
