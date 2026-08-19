import { ArrowRight, ChevronDown, ImagePlus, Plus, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NumberInput } from "@/components/ui/NumberInput";
import { getProductPlans } from "../create/product-form.api";
import {
  getProduct,
  productImage,
  updateProduct,
  type UpdateProductPayload,
} from "../products.api";
import type { Product } from "../products.types";
import { ProductPlanEditor } from "../components/ProductPlanEditor";
import { ProductLabelPicker } from "../components/ProductLabelPicker";
import {
  defaultPurity,
  isValidPurity,
  purityLabel,
  purityOptions,
} from "../product-purity";
import type { ProductFieldErrors } from "../product-validation";
import { toast } from "@/stores/toast.store";

export function ProductEditPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const client = useQueryClient();
  const { data } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["product-plans"],
    queryFn: getProductPlans,
  });
  const [form, setForm] = useState<Partial<Product>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [initial, setInitial] = useState<number[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        description: data.description,
        carat: data.carat,
        status: data.status,
        category: data.category,
        metal: data.metal,
        gender: data.gender,
        variants: data.variants,
      });
      const ids = data.productPlans.map((item) => item.plan.id);
      setSelected(ids);
      setInitial(ids);
      setSelectedLabels(data.productLabels?.map((item) => item.label.id) ?? []);
    }
  }, [data]);
  const mutation = useMutation({
    mutationFn: () => {
      const additions = selected.filter((planId) => !initial.includes(planId));
      const removals = initial.filter((planId) => !selected.includes(planId));
      const cleanVariants = form.variants?.map(
        ({ id, weight, stock, sku }) => ({ id, weight, stock, sku }),
      );
      const payload: UpdateProductPayload = {
        ...form,
        variants: cleanVariants,
        ...(additions.length ? { plans: { existingIds: additions } } : {}),
        ...(removals.length ? { removePlanIds: removals } : {}),
        labelIds: selectedLabels,
      };
      return updateProduct(id, payload);
    },
    onSuccess: async () => {
      toast.success(
        "تغییرات ذخیره شد",
        `اطلاعات محصول «${form.title || data?.title || ""}» به‌روزرسانی شد.`,
      );
      await client.invalidateQueries({ queryKey: ["product", id] });
      navigate(`/products/${id}`);
    },
    onError: (reason) => {
      const message = axios.isAxiosError(reason)
        ? reason.response?.data?.message
        : undefined;
      toast.error(
        "ویرایش محصول ناموفق بود",
        message || "لطفاً اطلاعات فرم را بررسی و دوباره تلاش کنید.",
      );
    },
  });
  const mutationMessage = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.message
    : "";
  const save = () => {
    const errors: ProductFieldErrors = {};
    if (!form.title?.trim()) errors.title = "نام محصول الزامی است.";
    if (
      form.category !== "COIN" &&
      form.metal &&
      form.carat !== undefined &&
      !isValidPurity(form.metal, form.carat)
    )
      errors.carat = "عیار یا خلوص برای فلز انتخاب‌شده مجاز نیست.";
    if ((form.variants?.[0]?.stock ?? 0) < 0)
      errors.stock = "موجودی نمی‌تواند منفی باشد.";
    setFieldErrors(errors);
    if (!Object.keys(errors).length) mutation.mutate();
  };
  if (!data) return <div className="list-state">در حال دریافت محصول...</div>;
  const images = data.medias?.images ?? [];
  const primary = productImage(data);
  const firstVariant = form.variants?.[0];
  const updateFirstVariant = (
    changes: Partial<NonNullable<Product["variants"]>[number]>,
  ) =>
    setForm((current) => ({
      ...current,
      variants: current.variants?.map((row, index) =>
        index === 0 ? { ...row, ...changes } : row,
      ),
    }));

  return (
    <div className="edit-product edit-product--reference">
      <div className="screen-heading edit-heading">
        <div>
          <div className="breadcrumb">
            <Link to="/products">محصولات</Link>
            <span>‹</span>
            <span>ویرایش محصول</span>
          </div>
          <h2>ویرایش محصول</h2>
          <p>ویرایش اطلاعات محصول</p>
        </div>
        <div className="screen-actions">
          <Link to={`/products/${id}`} className="button button--secondary">
            <ArrowRight />
            بازگشت
          </Link>
          <button
            className="button button--primary"
            onClick={save}
            disabled={mutation.isPending}
          >
            <Save />
            {mutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>

      <div className="edit-layout">
        <aside className="edit-aside">
          <section className="edit-card image-editor">
            <h3>تصاویر محصول</h3>
            <div className="edit-main-image">
              {primary ? <img src={primary} alt={data.title} /> : <ImagePlus />}
            </div>
            <div className="edit-thumbs">
              {images.slice(0, 3).map((image, index) => (
                <button
                  key={image.url || image.preview || index}
                  className={index === 0 ? "selected" : ""}
                >
                  <img src={image.url || image.preview} alt="" />
                </button>
              ))}
              <button>
                <Plus />
              </button>
            </div>
          </section>
          <section className="edit-card visibility-card">
            <h3>وضعیت نمایش</h3>
            <label>
              <span>
                <strong>نمایش در سایت</strong>
                <small>
                  {form.status === "PUBLISHED"
                    ? "محصول در سایت قابل مشاهده است"
                    : "محصول در سایت نمایش داده نمی‌شود"}
                </small>
              </span>
              <button
                type="button"
                className={
                  form.status === "PUBLISHED" ? "switch is-on" : "switch"
                }
                onClick={() => {
                  const published = form.status === "PUBLISHED";
                  setForm({
                    ...form,
                    status: published ? "INACTIVE" : "PUBLISHED",
                  });
                }}
                aria-label="تغییر وضعیت نمایش در سایت"
              >
                <i />
              </button>
            </label>
          </section>
        </aside>

        <main className="edit-main">
          <section className="edit-card main-info-card">
            <h3>اطلاعات اصلی</h3>
            <div className="reference-form-grid">
              <label className="span-2">
                <span className="field-title">
                  نام محصول <em>*</em>
                </span>
                <input
                  className={fieldErrors.title ? "field-invalid" : ""}
                  value={form.title ?? ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {fieldErrors.title && (
                  <small className="field-error">{fieldErrors.title}</small>
                )}
              </label>
              <label>
                <span className="field-title">
                  کد محصول (SKU) <em>*</em>
                </span>
                <input
                  value={data.labels?.sku || `GLD-R-${data.id}`}
                  readOnly
                />
              </label>
              <label>
                <span className="field-title">
                  دسته‌بندی <em>*</em>
                </span>
                <span className="select-wrap">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as Product["category"],
                      })
                    }
                  >
                    <option value="JEWELRY">جواهرات</option>
                    <option value="COIN">سکه</option>
                    <option value="BULLION">شمش</option>
                  </select>
                  <ChevronDown />
                </span>
              </label>
              <label>
                <span className="field-title">
                  نوع محصول <em>*</em>
                </span>
                <span className="select-wrap">
                  <select defaultValue="ring">
                    <option value="ring">انگشتر</option>
                    <option value="necklace">گردنبند</option>
                    <option value="bracelet">دستبند</option>
                  </select>
                  <ChevronDown />
                </span>
              </label>
              <label>
                <span className="field-title">
                  نوع فلز <em>*</em>
                </span>
                <span className="select-wrap">
                  <select
                    value={form.metal}
                    onChange={(e) => {
                      const metal = e.target.value as Product["metal"];
                      setForm({ ...form, metal, carat: defaultPurity(metal) });
                    }}
                  >
                    <option value="GOLD">طلا</option>
                    <option value="SILVER">نقره</option>
                    <option value="COPPER">مس</option>
                    <option value="PLATINUM">پلاتین</option>
                  </select>
                  <ChevronDown />
                </span>
              </label>
              {form.category !== "COIN" && (
                <label>
                  <span className="field-title">
                    {form.metal ? purityLabel(form.metal) : "عیار / خلوص"}{" "}
                    <em>*</em>
                  </span>
                  <span className="select-wrap">
                    <select
                      className={fieldErrors.carat ? "field-invalid" : ""}
                      value={form.carat}
                      onChange={(e) =>
                        setForm({ ...form, carat: Number(e.target.value) })
                      }
                    >
                      {form.metal &&
                        purityOptions[form.metal].map((value) => (
                          <option key={value} value={value}>
                            {value}
                            {form.metal === "GOLD" ? " عیار" : " از ۱۰۰۰"}
                          </option>
                        ))}
                    </select>
                    <ChevronDown />
                  </span>
                  {fieldErrors.carat && (
                    <small className="field-error">{fieldErrors.carat}</small>
                  )}
                </label>
              )}
              <label>
                <span className="field-title">
                  موجودی کل <em>*</em>
                </span>
                <NumberInput
                  className={fieldErrors.stock ? "field-invalid" : ""}
                  value={firstVariant?.stock ?? 0}
                  onChange={(stock) => updateFirstVariant({ stock })}
                />
                {fieldErrors.stock && (
                  <small className="field-error">{fieldErrors.stock}</small>
                )}
              </label>
              <label>
                <span className="field-title">قیمت (تومان)</span>
                <input value="براساس نرخ روز" readOnly />
              </label>
            </div>
          </section>

          <section className="edit-card description-editor">
            <h3>توضیحات محصول</h3>
            <div className="editor-toolbar">
              <button>B</button>
              <button>
                <i>I</i>
              </button>
              <button>≡</button>
              <button>☷</button>
              <button>↗</button>
              <button>🔗</button>
            </div>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <small>
              {new Intl.NumberFormat("fa-IR").format(
                (form.description ?? "").length,
              )}{" "}
              / ۳۰۰
            </small>
          </section>

          <ProductPlanEditor
            plans={plans}
            selected={selected}
            onChange={setSelected}
          />
          <ProductLabelPicker
            selected={selectedLabels}
            onChange={setSelectedLabels}
            metal={form.metal ?? data.metal}
            category={form.category ?? data.category}
          />
          <section className="edit-card product-status-editor">
            <h3>وضعیت محصول</h3>
            <label>
              <span className="field-title">وضعیت انتشار</span>
              <select
                value={form.status ?? "PUBLISHED"}
                onChange={(event) => {
                  const status = event.target.value as Product["status"];
                  setForm({ ...form, status });
                }}
              >
                <option value="PUBLISHED">منتشرشده</option>
                <option value="DRAFT">پیش‌نویس</option>
                <option value="INACTIVE">غیرفعال</option>
              </select>
            </label>
          </section>
        </main>
      </div>
      {mutation.isError && (
        <p className="wizard-error form-global-error">
          {mutationMessage || "ذخیره تغییرات ناموفق بود."}
        </p>
      )}
    </div>
  );
}
