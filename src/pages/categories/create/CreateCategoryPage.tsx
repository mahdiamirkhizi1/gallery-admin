import axios from "axios";
import { Check, ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/stores/toast.store";
import { createCategory, getCategories } from "../categories.api";
import type {
  CategoryDraft,
  CategoryType,
  MetalType,
} from "../categories.types";
import "./create-category.css";
import "./create-category-fixes.css";
const initial: CategoryDraft = {
  name: "",
  slug: "",
  description: "",
  productType: "JEWELRY",
  metal: "GOLD",
  displayOrder: 1,
  image: null,
  features: [],
  isActive: true,
};
const labels = { JEWELRY: "جواهر", COIN: "سکه", BULLION: "شمش" };
const metals = {
  GOLD: "طلا",
  SILVER: "نقره",
  COPPER: "مس",
  PLATINUM: "پلاتین",
  IMITATION: "بدلیجات",
};
const steps = [
  "اطلاعات پایه",
  "جزئیات دسته‌بندی",
  "ویژگی‌های دسته‌بندی",
  "بررسی و ثبت",
];
const featureLabels = ["دارای سایز", "دارای اجرت", "دارای سنگ", "دارای حکاکی"];
export function CreateCategoryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { data } = useQuery({
    queryKey: ["category-options"],
    queryFn: () => getCategories(),
  });
  const patch = <K extends keyof CategoryDraft>(
    key: K,
    value: CategoryDraft[K],
  ) => setDraft((old) => ({ ...old, [key]: value }));
  const validate = () => {
    const e: Record<string, string> = {};
    if (draft.name.trim().length < 2) e.name = "نام حداقل ۲ کاراکتر باشد.";
    if (!/^[a-z0-9-]{2,100}$/.test(draft.slug))
      e.slug = "اسلاگ فقط شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.";
    if (data?.items.some((item) => item.slug === draft.slug))
      e.slug = "این اسلاگ قبلاً استفاده شده است.";
    if (draft.displayOrder < 1) e.displayOrder = "ترتیب نمایش معتبر نیست.";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const submit = async () => {
    if (!validate()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      await createCategory(draft);
      toast.success("دسته‌بندی ایجاد شد", `دسته‌بندی «${draft.name}» ثبت شد.`);
      navigate("/categories", { replace: true });
    } catch (reason) {
      const message = axios.isAxiosError(reason)
        ? reason.response?.data?.message
        : undefined;
      toast.error(
        "ایجاد دسته‌بندی انجام نشد",
        message || "نام یا اسلاگ تکراری است.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="create-category-page">
      <header className="cc-header">
        <div className="breadcrumb">
          <Link to="/categories">دسته‌بندی‌ها</Link>
          <span>‹</span>
          <span>ساخت دسته‌بندی جدید</span>
        </div>
        <h2>ساخت دسته‌بندی جدید</h2>
        <p>اطلاعات دسته‌بندی را تکمیل و بررسی کنید.</p>
      </header>
      <div className="cc-stepper">
        {steps.map((label, index) => {
          const value = index + 1;
          return (
            <button
              key={label}
              className={step === value ? "active" : step > value ? "done" : ""}
              onClick={() => value < step && setStep(value)}
            >
              <i>{step > value ? <Check /> : value}</i>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="cc-layout">
        <main className="cc-card cc-form">
          {step === 1 && (
            <section>
              <h3>اطلاعات پایه</h3>
              <Field label="نام دسته‌بندی" error={errors.name}>
                <input
                  value={draft.name}
                  onChange={(e) => patch("name", e.target.value)}
                  placeholder="مثلاً النگو"
                />
              </Field>
              <Field label="اسلاگ" error={errors.slug}>
                <input
                  dir="ltr"
                  value={draft.slug}
                  onChange={(e) =>
                    patch(
                      "slug",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  placeholder="gold-bangle"
                />
                <em>
                  اسلاگ باید یکتا باشد و فقط از حروف کوچک انگلیسی، عدد و خط تیره
                  استفاده کند.
                </em>
              </Field>
              <div className="cc-grid">
                <Field label="نوع محصول">
                  <select
                    value={draft.productType}
                    onChange={(e) =>
                      patch("productType", e.target.value as CategoryType)
                    }
                  >
                    {Object.entries(labels).map(([v, l]) => (
                      <option
                        value={v}
                        key={v}
                        disabled={v === "COIN" && draft.metal !== "GOLD"}
                      >
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="نوع فلز">
                  <select
                    value={draft.metal}
                    onChange={(e) => {
                      const nextMetal = e.target.value as MetalType;
                      patch("metal", nextMetal);
                      if (nextMetal !== "GOLD" && draft.productType === "COIN")
                        patch("productType", "JEWELRY");
                    }}
                  >
                    {Object.entries(metals).map(([v, l]) => (
                      <option value={v} key={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ترتیب نمایش" error={errors.displayOrder}>
                  <input
                    type="number"
                    min="1"
                    value={draft.displayOrder}
                    onChange={(e) =>
                      patch("displayOrder", Number(e.target.value))
                    }
                  />
                </Field>
              </div>
            </section>
          )}
          {step === 2 && (
            <section>
              <h3>جزئیات دسته‌بندی</h3>
              <Field label="توضیحات">
                <textarea
                  value={draft.description ?? ""}
                  maxLength={700}
                  onChange={(e) => patch("description", e.target.value)}
                  placeholder="توضیحات دسته‌بندی..."
                />
              </Field>
              <div className="cc-empty-upload">
                <ImagePlus />
                <strong>تصویر دسته‌بندی اختیاری است</strong>
                <small>بارگذاری تصویر در نسخه بعدی تکمیل می‌شود.</small>
              </div>
            </section>
          )}
          {step === 3 && (
            <section>
              <h3>ویژگی‌های دسته‌بندی</h3>
              <p className="cc-section-note">
                ویژگی‌هایی را انتخاب کنید که هنگام ساخت محصول این دسته‌بندی لازم
                هستند.
              </p>
              <div className="cc-features">
                {featureLabels.map((label) => (
                  <label key={label}>
                    <input
                      type="checkbox"
                      checked={draft.features.includes(label)}
                      onChange={(event) =>
                        patch(
                          "features",
                          event.target.checked
                            ? [...draft.features, label]
                            : draft.features.filter((item) => item !== label),
                        )
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </section>
          )}
          {step === 4 && (
            <section>
              <h3>بررسی و ثبت</h3>
              <div className="cc-review">
                <Row label="نام" value={draft.name} />
                <Row label="اسلاگ" value={draft.slug} />
                <Row label="نوع محصول" value={labels[draft.productType]} />
                <Row label="نوع فلز" value={metals[draft.metal]} />
                <Row label="ترتیب" value={String(draft.displayOrder)} />
                <Row
                  label="ویژگی‌ها"
                  value={draft.features.join("، ") || "بدون ویژگی"}
                />
                <Row
                  label="وضعیت"
                  value={draft.isActive ? "فعال" : "غیرفعال"}
                />
              </div>
            </section>
          )}
          <footer className="cc-actions">
            <button
              className="button button--secondary"
              onClick={() => navigate("/categories")}
            >
              <X />
              انصراف
            </button>
            <span />
            {step > 1 && (
              <button
                className="button button--secondary"
                onClick={() => setStep(step - 1)}
              >
                <ChevronRight />
                مرحله قبل
              </button>
            )}
            {step < 4 ? (
              <button
                className="button button--primary"
                onClick={() => {
                  if (step !== 1 || validate()) setStep(step + 1);
                }}
              >
                مرحله بعد
                <ChevronLeft />
              </button>
            ) : (
              <button
                className="button cc-submit"
                onClick={submit}
                disabled={submitting}
              >
                <Check />
                {submitting ? "در حال ثبت..." : "ثبت دسته‌بندی"}
              </button>
            )}
          </footer>
        </main>
        <aside className="cc-card cc-preview">
          <h3>پیش‌نمایش</h3>
          <div className="cc-preview-box">
            <i>
              <ImagePlus />
            </i>
            <strong>{draft.name || "نام دسته‌بندی"}</strong>
            <code dir="ltr">{draft.slug || "category-slug"}</code>
            <div>
              <span>{metals[draft.metal]}</span>
              <span>{labels[draft.productType]}</span>
            </div>
            <p>{draft.description || "توضیحات دسته‌بندی"}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="cc-field">
      <span>
        {label}
        <b>*</b>
      </span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  );
}
