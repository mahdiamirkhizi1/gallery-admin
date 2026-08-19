import { CheckCircle2 } from "lucide-react";
import type { ProductDraft } from "../product-form.types";
export function StepReview({ draft }: { draft: ProductDraft }) {
  const checks = [
    ["اطلاعات اصلی تکمیل شده", Boolean(draft.title)],
    ["مشخصات محصول تکمیل شده", draft.category === "COIN" || draft.carat > 0],
    [
      "موجودی و سایزبندی ثبت شده",
      draft.variants.every((item) => item.weight > 0),
    ],
    [
      "روش فروش انتخاب شده",
      draft.regularSale || draft.existingPlanIds.length > 0,
    ],
    ["تصویر اصلی انتخاب شده", draft.images.some((item) => item.isPrimary)],
  ] as const;
  return (
    <section className="form-section review-section">
      <h3>بررسی نهایی محصول</h3>
      <div className="review-grid">
        <dl>
          <div>
            <dt>اطلاعات اصلی</dt>
            <dd>{draft.title}</dd>
          </div>
          <div>
            <dt>دسته</dt>
            <dd>{draft.category}</dd>
          </div>
          <div>
            <dt>مشخصات</dt>
            <dd>
              {draft.category === "COIN"
                ? `${draft.coin.coinType}، ${draft.coin.coinPattern}`
                : `${draft.carat} عیار، ${draft.metal}`}
            </dd>
          </div>
          <div>
            <dt>سایزبندی</dt>
            <dd>{draft.variants.length} تنوع</dd>
          </div>
          <div>
            <dt>موجودی کل</dt>
            <dd>
              {draft.variants.reduce((sum, item) => sum + item.stock, 0)} عدد
            </dd>
          </div>
          <div>
            <dt>پلن‌های فروش</dt>
            <dd>
              {draft.existingPlanIds.length + (draft.regularSale ? 1 : 0)} روش
            </dd>
          </div>
        </dl>
        <div className="completion-box">
          <h4>وضعیت تکمیل</h4>
          {checks.map(([label, done]) => (
            <p className={done ? "done" : ""} key={label}>
              <CheckCircle2 />
              {label}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
