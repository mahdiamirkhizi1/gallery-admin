import { NumberInput } from "@/components/ui/NumberInput";
import { purityLabel, purityOptions } from "../../product-purity";
import type { ProductFieldErrors } from "../../product-validation";
import type { ProductDraft } from "../product-form.types";
export function StepDetails({
  draft,
  patch,
  errors = {},
}: {
  draft: ProductDraft;
  patch: (value: Partial<ProductDraft>) => void;
  errors?: ProductFieldErrors;
}) {
  const jewelry = (value: Partial<ProductDraft["jewelry"]>) =>
    patch({ jewelry: { ...draft.jewelry, ...value } });
  return (
    <section className="form-section">
      <h3>
        مشخصات{" "}
        {draft.category === "JEWELRY"
          ? "جواهرات"
          : draft.category === "COIN"
            ? "سکه"
            : "شمش"}
      </h3>
      {draft.category === "JEWELRY" ? (
        <div className="form-grid form-grid--3">
          <label>
            نوع محصول *
            <select
              className={errors.subTypeId ? "field-invalid" : ""}
              value={draft.jewelry.subTypeId}
              onChange={(e) => jewelry({ subTypeId: Number(e.target.value) })}
            >
              <option value="1">انگشتر</option>
              <option value="2">گردنبند</option>
              <option value="3">دستبند</option>
              <option value="4">گوشواره</option>
            </select>
            {errors.subTypeId && (
              <small className="field-error">{errors.subTypeId}</small>
            )}
          </label>
          <label>
            {purityLabel(draft.metal)} *
            <select
              className={errors.carat ? "field-invalid" : ""}
              value={draft.carat}
              onChange={(e) => patch({ carat: Number(e.target.value) })}
            >
              {purityOptions[draft.metal].map((value) => (
                <option key={value} value={value}>
                  {value}
                  {draft.metal === "GOLD" ? " عیار" : " از ۱۰۰۰"}
                </option>
              ))}
            </select>
            {errors.carat && (
              <small className="field-error">{errors.carat}</small>
            )}
          </label>
          <label>
            اجرت ساخت
            <NumberInput
              value={draft.jewelry.makingCost}
              onChange={(makingCost) => jewelry({ makingCost })}
              min={0}
              max={100}
              className={errors.makingCost ? "field-invalid" : ""}
            />
            {errors.makingCost && <small className="field-error">{errors.makingCost}</small>}
          </label>
          <label>
            دستمزد
            <NumberInput
              value={draft.jewelry.wages}
              onChange={(wages) => jewelry({ wages })}
              min={0}
              max={100}
              className={errors.wages ? "field-invalid" : ""}
            />
            {errors.wages && <small className="field-error">{errors.wages}</small>}
          </label>
          <label>
            مالیات
            <NumberInput
              value={draft.jewelry.tax}
              onChange={(tax) => jewelry({ tax })}
              min={0}
              max={100}
              className={errors.tax ? "field-invalid" : ""}
            />
            {errors.tax && <small className="field-error">{errors.tax}</small>}
          </label>
          <label>
            وضعیت محصول
            <select
              value={draft.jewelry.isNew ? "new" : "used"}
              onChange={(e) => jewelry({ isNew: e.target.value === "new" })}
            >
              <option value="new">نو</option>
              <option value="used">دست دوم</option>
            </select>
          </label>
          <label className="span-2">
            توضیحات مشخصات
            <input
              value={String(draft.jewelry.attr.note ?? "")}
              onChange={(e) =>
                jewelry({
                  attr: { ...draft.jewelry.attr, note: e.target.value },
                })
              }
            />
          </label>
        </div>
      ) : draft.category === "COIN" ? (
        <div className="form-grid form-grid--3">
          <label>
            نوع سکه
            <select
              value={draft.coin.coinType}
              onChange={(e) =>
                patch({
                  coin: {
                    ...draft.coin,
                    coinType: e.target
                      .value as ProductDraft["coin"]["coinType"],
                  },
                })
              }
            >
              <option value="AZADI_FULL">تمام آزادی</option>
              <option value="AZADI_HALF">نیم سکه</option>
              <option value="AZADI_QUARTER">ربع سکه</option>
              <option value="GRAM">گرمی</option>
              <option value="PARSIAN">پارسیان</option>
            </select>
          </label>
          <label>
            مرجع ضرب
            <select
              value={draft.coin.mintRef}
              onChange={(e) =>
                patch({
                  coin: {
                    ...draft.coin,
                    mintRef: e.target.value as "BANK" | "NOT_BANK",
                  },
                })
              }
            >
              <option value="BANK">بانکی</option>
              <option value="NOT_BANK">غیربانکی</option>
            </select>
          </label>
          <label>
            طرح
            <select
              value={draft.coin.coinPattern}
              onChange={(e) =>
                patch({
                  coin: {
                    ...draft.coin,
                    coinPattern: e.target.value as "EMAMI" | "GHADIM",
                  },
                })
              }
            >
              <option value="EMAMI">امامی</option>
              <option value="GHADIM">قدیم</option>
            </select>
          </label>
        </div>
      ) : (
        <div className="form-grid form-grid--3">
          <label>
            {purityLabel(draft.metal)} *
            <select
              value={draft.carat}
              onChange={(e) => patch({ carat: Number(e.target.value) })}
            >
              {purityOptions[draft.metal].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            {errors.carat && (
              <small className="field-error">{errors.carat}</small>
            )}
          </label>
        </div>
      )}
    </section>
  );
}
