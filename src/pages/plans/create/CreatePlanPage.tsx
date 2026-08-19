import axios from "axios";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { BadgePercent, CalendarClock, Check, ChevronLeft, ChevronRight, CircleAlert, Clock3, Layers3, Search, ShoppingBag, WalletCards } from "lucide-react";
import { createPlan, getScopeProducts } from "./create-plan.api";
import { getPlans } from "../plans.api";
import { PersianDateTimeInput } from "./PersianDateTimeInput";
import { toast } from "@/stores/toast.store";
import { getCategories } from "@/pages/categories/categories.api";
import type { PlanDraft, ProductCategory } from "./plan-form.types";
import "./create-plan.css";
import "./create-plan-fixes.css";

const initialDraft: PlanDraft = {
  type: "DISCOUNT", title: "", description: "", code: "", percent: 10,
  startDate: "", expireDate: "", installmentCount: 4, installmentDays: 30,
  priority: 10, isActive: true,
  scope: "ALL", categories: [], metals: [], genders: [], jewelrySubTypeIds: [], coinTypes: [], productIds: [],
};

const typeOptions = [
  { type: "DISCOUNT" as const, label: "تخفیف", hint: "اعمال درصد تخفیف", Icon: BadgePercent, tone: "discount" },
  { type: "INSTALLMENT" as const, label: "اقساطی", hint: "پرداخت در چند قسط", Icon: WalletCards, tone: "installment" },
  { type: "RESERVE" as const, label: "رزرو", hint: "پرداخت پیش‌پرداخت و رزرو", Icon: CalendarClock, tone: "reserve" },
];
const categoryLabels: Record<ProductCategory, string> = { JEWELRY: "زیورآلات", COIN: "سکه", BULLION: "شمش" };
const metalLabels = { GOLD: "طلا", SILVER: "نقره", COPPER: "مس", PLATINUM: "پلاتین", IMITATION: "بدلیجات" } as const;
const genderLabels = { KID: "طلای کودک", WOMAN: "زنانه", MAN: "مردانه", UNISEX: "مشترک", NONE: "بدون گروه" } as const;
const coinLabels = { AZADI_FULL: "تمام سکه", AZADI_HALF: "نیم سکه", AZADI_QUARTER: "ربع سکه", GRAM: "سکه گرمی", PARSIAN: "پارسیان" } as const;
const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

export function CreatePlanPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: products = [], isLoading: productsLoading } = useQuery({ queryKey: ["plan-scope-products"], queryFn: getScopeProducts });
  const { data: existingPlans } = useQuery({ queryKey: ["plans-list"], queryFn: getPlans });
  const patch = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => setDraft((old) => ({ ...old, [key]: value }));

  const eligibleProducts = useMemo(() => products.filter((product) => {
    if (product.productPlans?.some((item) => item.plan.type === draft.type)) return false;
    if (draft.scope === "ALL") return true;
    if (draft.scope === "CATEGORY") return (!draft.categories.length || draft.categories.includes(product.category))
      && (!draft.metals.length || draft.metals.includes(product.metal))
      && (!draft.genders.length || draft.genders.includes(product.gender))
      && (!draft.jewelrySubTypeIds.length || Boolean(product.jewelry?.jewelrySubType && draft.jewelrySubTypeIds.includes(product.jewelry.jewelrySubType.id)))
      && (!draft.coinTypes.length || Boolean(product.coin && draft.coinTypes.includes(product.coin.coinType)));
    return draft.productIds.includes(product.id);
  }), [products, draft.scope, draft.categories, draft.productIds, draft.type]);
  const conflicts = products.filter((product) => product.productPlans?.some((item) => item.plan.type === draft.type)).length;

  const validateStep = (target = step) => {
    const next: Record<string, string> = {};
    if (target === 1 && draft.type === "DISCOUNT" && draft.title.trim().length < 3) next.title = "نام پلن باید حداقل ۳ کاراکتر باشد.";
    if (target === 1 && (draft.percent < 1 || draft.percent > 99)) next.percent = "مقدار باید بین ۱ تا ۹۹ درصد باشد.";
    if (target === 2 && draft.type === "DISCOUNT") {
      if (!draft.startDate) next.startDate = "تاریخ شروع الزامی است.";
      if (!draft.expireDate) next.expireDate = "تاریخ پایان الزامی است.";
      if (draft.startDate && draft.expireDate && new Date(draft.expireDate) <= new Date(draft.startDate)) next.expireDate = "تاریخ پایان باید بعد از تاریخ شروع باشد.";
    }
    if (target === 2 && draft.type === "INSTALLMENT") {
      if (draft.installmentCount < 1) next.installmentCount = "تعداد اقساط باید بیشتر از صفر باشد.";
      if (draft.installmentDays < 1) next.installmentDays = "فاصله اقساط باید بیشتر از صفر باشد.";
    }
    if (target === 3 && draft.scope === "CATEGORY" && !draft.categories.length && !draft.metals.length && !draft.genders.length && !draft.jewelrySubTypeIds.length && !draft.coinTypes.length) next.scope = "حداقل یک معیار دسته‌بندی انتخاب کنید.";
    if (target === 3 && draft.scope === "PRODUCT" && !draft.productIds.length) next.scope = "حداقل یک محصول انتخاب کنید.";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const next = () => { setGlobalError(""); if (validateStep()) setStep((value) => Math.min(4, value + 1)); };
  const submit = async () => {
    setGlobalError("");
    for (const target of [1, 2, 3]) if (!validateStep(target)) { setStep(target); return; }
    const duplicate = (existingPlans?.items ?? []).some((plan) => {
      if (plan.type !== draft.type) return false;
      if (draft.type === "DISCOUNT") {
        const detail = plan.discountPlan;
        if (!detail) return false;
        return detail.title?.trim() === draft.title.trim()
          && detail.percent === draft.percent
          && new Date(detail.startDate).getTime() === new Date(draft.startDate).getTime()
          && new Date(detail.expireDate).getTime() === new Date(draft.expireDate).getTime();
      }
      if (draft.type === "RESERVE") return plan.reservePlan?.percent === draft.percent;
      return plan.installmentPlan?.count === draft.installmentCount && plan.installmentPlan?.days === draft.installmentDays;
    });
    if (duplicate) {
      setGlobalError("پلنی با همین نوع و شرایط قبلاً ثبت شده است و امکان ایجاد پلن تکراری وجود ندارد.");
      return;
    }
    setSubmitting(true);
    try {
      await createPlan(draft, draft.scope === "PRODUCT" ? eligibleProducts.map((product) => product.id) : []);
      toast.success("پلن ایجاد شد", `پلن «${draft.title || typeOptions.find((item) => item.type === draft.type)?.label}» با موفقیت ثبت شد.`);
      await queryClient.invalidateQueries({ queryKey: ["plans-list"] });
      navigate("/plans", { replace: true, state: { created: true } });
    } catch (reason) {
      const message = axios.isAxiosError(reason) ? reason.response?.data?.message || reason.response?.data?.error : "";
      setGlobalError(message || "ثبت پلن ناموفق بود. اطلاعات فرم و اتصال به سرور را بررسی کنید.");
      toast.error("ایجاد پلن ناموفق بود", message || "اطلاعات فرم و اتصال به سرور را بررسی کنید.");
    } finally { setSubmitting(false); }
  };

  return <div className="create-plan-page">
    <header className="cp-header">
      <div><div className="breadcrumb"><Link to="/products">محصولات</Link><span>‹</span><Link to="/plans">پلن‌ها</Link><span>‹</span><span>ساخت پلن جدید</span></div><h2>ساخت پلن جدید</h2><p>اطلاعات پلن تخفیف، اقساط یا رزرو را وارد کنید.</p></div>
      <Link className="button button--secondary" to="/plans"><ChevronRight /> بازگشت</Link>
    </header>
    <PlanStepper step={step} onChange={(value) => value < step && setStep(value)} />
    <div className="cp-layout">
      <main className="cp-card cp-form-card">
        {step === 1 && <BasicStep draft={draft} patch={patch} errors={errors} />}
        {step === 2 && <RulesStep draft={draft} patch={patch} errors={errors} />}
        {step === 3 && <ScopeStep draft={draft} patch={patch} errors={errors} products={products} loading={productsLoading} conflicts={conflicts} />}
        {step === 4 && <ReviewStep draft={draft} count={eligibleProducts.length} />}
        {globalError && <p className="cp-global-error"><CircleAlert />{globalError}</p>}
        <footer className="cp-actions"><button className="button button--secondary" onClick={() => navigate("/plans")}>ذخیره و خروج</button><span />{step > 1 && <button className="button button--secondary" onClick={() => setStep(step - 1)}><ChevronRight /> مرحله قبل</button>}{step < 4 ? <button className="button button--primary" onClick={next}>مرحله بعد <ChevronLeft /></button> : <button className="button cp-submit" disabled={submitting} onClick={submit}><Check />{submitting ? "در حال ثبت..." : "ثبت و فعال‌سازی پلن"}</button>}</footer>
      </main>
      <PlanPreview draft={draft} count={eligibleProducts.length} />
    </div>
  </div>;
}

function PlanStepper({ step, onChange }: { step: number; onChange: (step: number) => void }) {
  const items = ["اطلاعات پایه", "شرایط و قوانین", "محدوده و اعمال", "بررسی و ثبت"];
  return <div className="cp-stepper">{items.map((label, index) => { const value = index + 1; return <button key={label} className={value === step ? "active" : value < step ? "done" : ""} onClick={() => onChange(value)}><i>{value < step ? <Check /> : fa(value)}</i><span>{label}</span></button>; })}</div>;
}

type Patch = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => void;
function RequiredLabel({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) { return <span className="cp-label">{children}{!optional && <b>*</b>}</span>; }
function ErrorText({ value }: { value?: string }) { return value ? <small className="cp-field-error">{value}</small> : null; }

function BasicStep({ draft, patch, errors }: { draft: PlanDraft; patch: Patch; errors: Record<string, string> }) {
  return <section><h3>اطلاعات پایه</h3><div className="cp-field cp-field--full"><RequiredLabel>نام پلن</RequiredLabel><input value={draft.title} onChange={(e) => patch("title", e.target.value)} placeholder={draft.type === "DISCOUNT" ? "مثلاً تخفیف ویژه بهار" : "نام نمایشی پلن"} /><ErrorText value={errors.title} /></div>
    <div className="cp-type-grid">{typeOptions.map(({ type, label, hint, Icon, tone }) => <button key={type} className={`cp-type cp-type--${tone} ${draft.type === type ? "selected" : ""}`} onClick={() => patch("type", type)}><span><strong>{label}</strong><small>{hint}</small></span><i><Icon /></i></button>)}</div>
    <div className="cp-grid">
      <div className="cp-field cp-field--wide"><RequiredLabel optional>توضیحات</RequiredLabel><input value={draft.description} onChange={(e) => patch("description", e.target.value)} placeholder="توضیح کوتاه درباره پلن" /></div>
      <div className="cp-field"><RequiredLabel optional>کد پلن</RequiredLabel><input dir="ltr" value={draft.code} onChange={(e) => patch("code", e.target.value)} placeholder="SPRING12" /></div>
      {draft.type !== "INSTALLMENT" && <div className="cp-field"><RequiredLabel>{draft.type === "RESERVE" ? "مقدار پیش‌پرداخت" : "مقدار تخفیف"}</RequiredLabel><div className="cp-input-suffix"><input type="number" min="1" max="99" value={draft.percent} onChange={(e) => patch("percent", Number(e.target.value))} /><span>٪</span></div><ErrorText value={errors.percent} /></div>}
      <div className="cp-field"><RequiredLabel>وضعیت</RequiredLabel><select value={draft.isActive ? "active" : "inactive"} onChange={(e) => patch("isActive", e.target.value === "active")}><option value="active">فعال</option><option value="inactive">غیرفعال</option></select></div>
      <div className="cp-field"><RequiredLabel optional>اولویت نمایش</RequiredLabel><input type="number" min="1" value={draft.priority} onChange={(e) => patch("priority", Number(e.target.value))} /><small className="cp-help">عدد کمتر، نمایش زودتر</small></div>
    </div>
  </section>;
}

function RulesStep({ draft, patch, errors }: { draft: PlanDraft; patch: Patch; errors: Record<string, string> }) {
  return <section><h3>شرایط و قوانین پلن</h3><div className="cp-grid cp-rules-grid">
    {draft.type === "DISCOUNT" && <><div className="cp-field cp-field--date"><RequiredLabel>تاریخ شروع</RequiredLabel><PersianDateTimeInput ariaLabel="تاریخ شروع شمسی" value={draft.startDate} onChange={(value) => patch("startDate", value)} /><ErrorText value={errors.startDate} /></div><div className="cp-field cp-field--date"><RequiredLabel>تاریخ پایان</RequiredLabel><PersianDateTimeInput ariaLabel="تاریخ پایان شمسی" value={draft.expireDate} onChange={(value) => patch("expireDate", value)} /><ErrorText value={errors.expireDate} /></div></>}
    {draft.type === "INSTALLMENT" && <><div className="cp-field"><RequiredLabel>تعداد اقساط</RequiredLabel><input type="number" min="1" value={draft.installmentCount} onChange={(e) => patch("installmentCount", Number(e.target.value))} /><ErrorText value={errors.installmentCount} /></div><div className="cp-field"><RequiredLabel>فاصله هر قسط</RequiredLabel><div className="cp-input-suffix"><input type="number" min="1" value={draft.installmentDays} onChange={(e) => patch("installmentDays", Number(e.target.value))} /><span>روز</span></div><ErrorText value={errors.installmentDays} /></div></>}
    {draft.type === "RESERVE" && <div className="cp-info"><CalendarClock /><div><strong>شرایط رزرو</strong><p>مشتری با پرداخت {fa(draft.percent)} درصد از مبلغ، محصول را رزرو می‌کند.</p></div></div>}
  </div></section>;
}

function ScopeStep({ draft, patch, errors, products, loading, conflicts }: { draft: PlanDraft; patch: Patch; errors: Record<string, string>; products: Awaited<ReturnType<typeof getScopeProducts>>; loading: boolean; conflicts: number }) {
  const [search, setSearch] = useState("");
  const { data: categoryData } = useQuery({ queryKey: ["plan-category-options"], queryFn: () => getCategories() });
  const shown = products.filter((product) => product.title.includes(search));
  const selectableShown = shown.filter((product) => !product.productPlans?.some((item) => item.plan.type === draft.type));
  const allShownSelected = selectableShown.length > 0 && selectableShown.every((product) => draft.productIds.includes(product.id));
  const toggleAllShown = () => patch("productIds", allShownSelected
    ? draft.productIds.filter((id) => !selectableShown.some((product) => product.id === id))
    : [...new Set([...draft.productIds, ...selectableShown.map((product) => product.id)])]);
  return <section><h3>محدوده و اعمال پلن</h3><RequiredLabel>اعمال روی</RequiredLabel><div className="cp-radio-row">{[["ALL", "همه محصولات"], ["CATEGORY", "بر اساس دسته‌بندی"], ["PRODUCT", "بر اساس محصول"]].map(([value, label]) => <label key={value}><input type="radio" checked={draft.scope === value} onChange={() => patch("scope", value as PlanDraft["scope"])} />{label}</label>)}</div>
    {draft.scope === "CATEGORY" && <div className="cp-taxonomy">
      <div><strong>نوع محصول</strong><div className="cp-choice-grid">{Object.entries(categoryLabels).map(([value, label]) => <label key={value}><input type="checkbox" checked={draft.categories.includes(value as ProductCategory)} onChange={(e) => patch("categories", e.target.checked ? [...draft.categories, value as ProductCategory] : draft.categories.filter((item) => item !== value))} />{label}</label>)}</div></div>
      <div><strong>نوع فلز</strong><div className="cp-choice-grid cp-choice-grid--five">{Object.entries(metalLabels).map(([value,label])=><label key={value}><input type="checkbox" checked={draft.metals.includes(value as never)} onChange={e=>patch("metals",e.target.checked?[...draft.metals,value as never]:draft.metals.filter(item=>item!==value))}/>{label}</label>)}</div></div>
      <div><strong>گروه محصول</strong><div className="cp-choice-grid cp-choice-grid--five">{Object.entries(genderLabels).map(([value,label])=><label key={value}><input type="checkbox" checked={draft.genders.includes(value as never)} onChange={e=>patch("genders",e.target.checked?[...draft.genders,value as never]:draft.genders.filter(item=>item!==value))}/>{label}</label>)}</div></div>
      <div><strong>دسته‌بندی جواهرات</strong><div className="cp-choice-grid cp-choice-grid--five">{categoryData?.items.filter(item=>item.productType==="JEWELRY").map(item=><label key={item.id}><input type="checkbox" checked={draft.jewelrySubTypeIds.includes(item.id)} onChange={e=>patch("jewelrySubTypeIds",e.target.checked?[...draft.jewelrySubTypeIds,item.id]:draft.jewelrySubTypeIds.filter(id=>id!==item.id))}/>{item.name}</label>)}</div></div>
      <div><strong>نوع سکه</strong><div className="cp-choice-grid cp-choice-grid--five">{Object.entries(coinLabels).map(([value,label])=><label key={value}><input type="checkbox" checked={draft.coinTypes.includes(value as never)} onChange={e=>patch("coinTypes",e.target.checked?[...draft.coinTypes,value as never]:draft.coinTypes.filter(item=>item!==value))}/>{label}</label>)}</div></div>
      <small>معیارهای هر بخش با هم ترکیب می‌شوند؛ مثلاً «طلا + طلای کودک + دستبند» فقط همان محصولات را انتخاب می‌کند.</small>
    </div>}
    {draft.scope === "PRODUCT" && <div className="cp-product-picker">
      <div className="cp-product-toolbar"><label className="cp-search"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نام محصول..." /></label><span>{fa(draft.productIds.length)} محصول انتخاب شده</span></div>
      {loading ? <p className="cp-product-loading">در حال دریافت محصولات...</p> : <div className="cp-product-table" role="table">
        <div className="cp-product-row cp-product-row--head" role="row"><label><input type="checkbox" checked={allShownSelected} onChange={toggleAllShown} /> انتخاب</label><span>نام محصول</span><span>دسته‌بندی</span><span>وضعیت</span></div>
        {shown.map((product) => { const conflict = product.productPlans?.some((item) => item.plan.type === draft.type); return <label className={`cp-product-row ${conflict ? "disabled" : ""}`} key={product.id}><input type="checkbox" disabled={conflict} checked={draft.productIds.includes(product.id)} onChange={(e) => patch("productIds", e.target.checked ? [...draft.productIds, product.id] : draft.productIds.filter((id) => id !== product.id))} /><strong>{product.title}</strong><span>{categoryLabels[product.category]}</span><span className={conflict ? "cp-conflict" : "cp-available"}>{conflict ? "دارای پلن هم‌نوع" : "قابل انتخاب"}</span></label>; })}
      </div>}
    </div>}
    {errors.scope && <p className="cp-field-error">{errors.scope}</p>}{conflicts > 0 && <p className="cp-notice"><CircleAlert />{fa(conflicts)} محصول از قبل پلن هم‌نوع دارد و طبق قانون سیستم از انتخاب کنار گذاشته می‌شود.</p>}
  </section>;
}

function ReviewStep({ draft, count }: { draft: PlanDraft; count: number }) { const view = typeOptions.find((item) => item.type === draft.type)!; return <section><h3>بررسی و ثبت</h3><div className="cp-review"><div><strong>اطلاعات پایه</strong><p>نام پلن <b>{draft.title || view.label}</b></p><p>نوع پلن <b>{view.label}</b></p><p>وضعیت <b className={draft.isActive ? "success" : "danger"}>{draft.isActive ? "فعال" : "غیرفعال"}</b></p></div><div><strong>شرایط و قوانین</strong><p>جزئیات <b>{draft.type === "INSTALLMENT" ? `${fa(draft.installmentCount)} قسط، هر ${fa(draft.installmentDays)} روز` : `${fa(draft.percent)} درصد`}</b></p></div><div><strong>محدوده اعمال</strong><p>نحوه اعمال <b>{draft.scope === "ALL" ? "همه محصولات" : draft.scope === "CATEGORY" ? "دسته‌بندی‌های منتخب" : "محصولات منتخب"}</b></p><p>محصولات قابل اتصال <b>{fa(count)} محصول</b></p></div></div></section>; }

function PlanPreview({ draft, count }: { draft: PlanDraft; count: number }) { const view = typeOptions.find((item) => item.type === draft.type)!; return <aside className="cp-preview"><section className="cp-card"><h3>پیش‌نمایش پلن</h3><div className={`cp-ticket cp-ticket--${view.tone}`}><i><view.Icon /></i><small>{view.label}</small><strong>{draft.type === "INSTALLMENT" ? `${fa(draft.installmentCount)} قسط` : `${fa(draft.percent)}٪`}</strong><span>{draft.title || `پلن ${view.label}`}</span></div><dl><div><dt>نوع پلن</dt><dd>{view.label}</dd></div><div><dt>وضعیت</dt><dd className={draft.isActive ? "success" : "danger"}>{draft.isActive ? "فعال" : "غیرفعال"}</dd></div><div><dt>محصولات قابل اتصال</dt><dd>{fa(count)} محصول</dd></div></dl></section>{draft.description && <section className="cp-card cp-note"><span>یادداشت</span><p>{draft.description}</p><small>{fa(draft.description.length)} / ۵۰۰</small></section>}</aside>; }
