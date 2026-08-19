import type { ProductDraft } from "./create/product-form.types";
import { isValidPurity } from "./product-purity";
export type ProductFieldErrors = Record<string, string>;
export function validateProductDraft(draft: ProductDraft) {
  const errors: ProductFieldErrors = {};
  if (!draft.title.trim()) errors.title = "نام محصول الزامی است.";
  if (draft.title.trim().length > 100)
    errors.title = "نام محصول حداکثر ۱۰۰ کاراکتر است.";
  if (draft.category !== "COIN" && !isValidPurity(draft.metal, draft.carat))
    errors.carat = "عیار یا خلوص انتخاب‌شده برای این فلز مجاز نیست.";
  draft.variants.forEach((item, index) => {
    if (item.weight <= 0)
      errors[`variants.${index}.weight`] = "وزن باید بیشتر از صفر باشد.";
    if (item.stock < 0)
      errors[`variants.${index}.stock`] = "موجودی نمی‌تواند منفی باشد.";
  });
  if (draft.category === "JEWELRY" && draft.jewelry.subTypeId < 1)
    errors.subTypeId = "نوع محصول را انتخاب کنید.";
  if (draft.category === "JEWELRY") {
    (["makingCost", "wages", "tax"] as const).forEach((field) => {
      const value = draft.jewelry[field];
      if (value < 0 || value > 100) errors[field] = "درصد باید بین ۰ تا ۱۰۰ باشد.";
    });
  }
  return errors;
}
