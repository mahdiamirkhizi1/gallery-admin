import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getProductLabels } from "../create/product-form.api";
import type { ProductDraft } from "../create/product-form.types";

export function ProductLabelPicker({ selected, onChange, metal, category }: { selected:number[]; onChange:(ids:number[])=>void; metal:ProductDraft["metal"]; category:ProductDraft["category"] }) {
  const { data: labels = [], isLoading, isError } = useQuery({ queryKey: ["product-labels"], queryFn: getProductLabels });
  const isCompatible = (label:(typeof labels)[number]) =>
    (!label.scopeMetals?.length || label.scopeMetals.includes(metal)) &&
    (!label.scopeCategories?.length || label.scopeCategories.includes(category));
  useEffect(() => {
    if (!labels.length) return;
    const compatibleSelected = selected.filter((id) => labels.some((label) => label.id === id && isCompatible(label)));
    if (compatibleSelected.length !== selected.length) onChange(compatibleSelected);
  }, [labels, metal, category, selected, onChange]);
  const toggle = (id:number) => onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]);
  return <section className="form-section product-label-picker">
    <div className="product-label-picker__heading"><h3>برچسب‌های محصول</h3><p>برچسب‌ها مطابق تنظیماتشان روی کارت، فیلترها و ردیف‌های ویژه استفاده می‌شوند.</p></div>
    {isLoading && <p className="list-state">در حال دریافت برچسب‌ها...</p>}
    {isError && <p className="field-error">دریافت برچسب‌ها ناموفق بود.</p>}
    {!isLoading && !labels.length && <p className="list-state">هنوز برچسبی تعریف نشده است.</p>}
    <div className="product-label-picker__options">
      {labels.filter(label => label.isActive).map(label => { const compatible=isCompatible(label); return <label key={label.id} className={selected.includes(label.id) ? "is-selected" : ""}>
        <input type="checkbox" disabled={!compatible} checked={selected.includes(label.id)} onChange={() => toggle(label.id)} />
        <span><strong>{label.title}</strong><small>{compatible ? label.slug : "برای فلز یا نوع این محصول مجاز نیست"}</small></span>
      </label>})}
    </div>
  </section>;
}
