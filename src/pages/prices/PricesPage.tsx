import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Save, Trash2, TrendingUp } from "lucide-react";
import {
  createRule,
  deleteRule,
  getPrices,
  getRules,
  syncPrices,
  updateRule,
  updatePrice,
  type MarketPrice,
  type PriceMode,
} from "./prices.api";
import { useToastStore } from "@/stores/toast.store";
import "./prices.css";
const fa = (v: string | null) =>
  v == null ? "—" : Number(v).toLocaleString("fa-IR");
const normalizeDigits=(value:string)=>value.replace("−","-").replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
const rawNumber=(value:string,signed=false)=>{const normalized=normalizeDigits(value);const negative=signed&&normalized.trim().startsWith("-");const digits=normalized.replace(/\D/g,"");return `${negative?"-":""}${digits}`};
const inputNumber=(value:string)=>{if(!value||value==="-")return value;const negative=value.startsWith("-");const digits=value.replace(/\D/g,"");return `${negative?"−":""}${Number(digits||0).toLocaleString("fa-IR")}`};
const modes: Array<{value:PriceMode;label:string;hint:string}> = [
  {value:"AUTO",label:"اعمال نرخ آنلاین",hint:"هر نرخ جدید مستقیماً در محاسبات استفاده می‌شود."},
  {value:"OBSERVE",label:"دریافت برای مقایسه",hint:"نرخ آنلاین دیده می‌شود ولی قیمت سایت تغییر نمی‌کند."},
  {value:"MANUAL",label:"قیمت دستی",hint:"فقط عددی که مدیر وارد می‌کند استفاده می‌شود."},
  {value:"PAUSED",label:"توقف دریافت نرخ",hint:"دریافت آنلاین برای این ردیف متوقف می‌شود."},
];
export function PricesPage() {
  const qc = useQueryClient(),
    toast = useToastStore();
  const { data: prices = [] } = useQuery({
    queryKey: ["prices"],
    queryFn: getPrices,
  });
  const { data: rules = [] } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: getRules,
  });
  const [drafts, setDrafts] = useState<
    Record<number, { mode: PriceMode; manualAmount: string }>
  >({});
  const [rule, setRule] = useState({
    role: "PARTNER",
    operation: "SELL",
    adjustmentType: "FIXED",
    adjustmentValue: "",
    metal: "",
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["prices"] });
    qc.invalidateQueries({ queryKey: ["pricing-rules"] });
  };
  const sync = useMutation({
    mutationFn: syncPrices,
    onSuccess: () => {
      refresh();
      toast.success("نرخ دریافت شد", "تنها حالت خودکار روی سایت اعمال می‌شود.");
    },
    onError: () =>
      toast.error("دریافت ناموفق بود", "قیمت فعلی بدون تغییر ماند."),
  });
  const save = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updatePrice(id, data),
    onSuccess: () => {
      refresh();
      toast.success("قیمت ذخیره شد", "در محاسبات جدید اعمال می‌شود.");
    },
  });
  const add = useMutation({
    mutationFn: () =>
      createRule({
        ...rule,
        metal: rule.metal || null,
        adjustmentValue: rule.adjustmentValue,
        priority: 0,
        isActive: true,
      }),
    onSuccess: () => {
      refresh();
      setRule({ ...rule, adjustmentValue: "" });
    },
  });
  const remove = useMutation({ mutationFn: deleteRule, onSuccess: refresh });
  const editRule = useMutation({mutationFn:({id,value}:{id:number;value:string})=>updateRule(id,{adjustmentValue:value}),onSuccess:()=>{refresh();toast.success("تلرانس ویرایش شد","مقدار جدید در قیمت‌گذاری بعدی اعمال می‌شود.")}});
  const [ruleDrafts,setRuleDrafts]=useState<Record<number,string>>({});
  const edit = (p: MarketPrice) =>
    drafts[p.id] ?? {
      mode: p.mode,
      manualAmount: p.manualAmount ?? p.amount,
    };
  return (
    <div className="price-page">
      <header className="price-head">
        <div>
          <h2>مدیریت قیمت لحظه‌ای</h2>
          <p>
            PersianToolbox منبع آزمایشی است؛ مرجع نهایی قیمت همیشه بک‌اند
            فروشگاه است.
          </p>
        </div>
        <button
          className="button button--primary"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
        >
          <RefreshCw />
          دریافت نرخ جدید
        </button>
      </header>
      <section className="price-note">
        <TrendingUp />
        <div>
          <strong>بدون تاریخچه بازار</strong>
          <p>
            فقط نرخ جاری نگهداری می‌شود؛ قیمت ثبت‌شده سفارش برای اعتبار معامله
            ثابت می‌ماند.
          </p>
        </div>
      </section>
      <section className="price-card">
        <h3>جدول قیمت جاری</h3>
        <div className="price-table">
          <table>
            <thead>
              <tr>
                <th>کد / عیار</th>
                <th>قیمت اعمالی</th>
                <th>قیمت منبع</th>
                <th>حالت</th>
                <th>قیمت دستی</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => {
                const d = edit(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.code}</strong>
                      <small>
                        {p.metal ?? "عمومی"}{" "}
                        {p.carat ? `— عیار ${p.carat}` : ""}
                      </small>
                    </td>
                    <td>{fa(p.amount)} تومان</td>
                    <td>
                      {fa(p.providerAmount)}
                      <small>{p.provider ?? "دستی"}</small>
                    </td>
                    <td>
                      <select
                        value={d.mode}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [p.id]: { ...d, mode: e.target.value as PriceMode },
                          })
                        }
                      >
                        {modes.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                      <small>{modes.find(mode=>mode.value===d.mode)?.hint}</small>
                    </td>
                    <td>
                      <input
                        dir="ltr"
                        value={inputNumber(d.manualAmount)}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [p.id]: {
                              ...d,
                              manualAmount: rawNumber(e.target.value),
                            },
                          })
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="button button--secondary price-apply"
                        onClick={() => save.mutate({ id: p.id, data: d })}
                      >
                        <Save />
                        اعمال تغییرات
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="price-card">
        <h3>تلرانس نقش‌ها</h3>
        <div className="rule-form">
          <select
            value={rule.role}
            onChange={(e) => setRule({ ...rule, role: e.target.value })}
          >
            <option value="PARTNER">همکار</option>
            <option value="USER">کاربر</option>
            <option value="ADMIN">مدیر</option>
            <option value="SUPER_ADMIN">مدیر ارشد</option>
          </select>
          <select
            value={rule.operation}
            onChange={(e) => setRule({ ...rule, operation: e.target.value })}
          >
            <option value="SELL">فروش</option>
            <option value="BUY">خرید</option>
          </select>
          <select
            value={rule.metal}
            onChange={(e) => setRule({ ...rule, metal: e.target.value })}
          >
            <option value="">همه فلزها</option>
            <option value="GOLD">طلا</option>
            <option value="SILVER">نقره</option>
          </select>
          <select
            value={rule.adjustmentType}
            onChange={(e) =>
              setRule({ ...rule, adjustmentType: e.target.value })
            }
          >
            <option value="FIXED">مبلغ ثابت</option>
            <option value="PERCENT">درصد</option>
          </select>
          <input
            placeholder="مقدار"
            value={inputNumber(rule.adjustmentValue)}
            onChange={(e) =>
              setRule({
                ...rule,
                adjustmentValue: rawNumber(e.target.value,true),
              })
            }
          />
          <button
            className="button button--primary"
            disabled={!rule.adjustmentValue}
            onClick={() => add.mutate()}
          >
            افزودن قانون
          </button>
        </div>
        <div className="rule-list">
          {rules.map((r) => (
            <div key={r.id}>
              <strong>
                {r.role} — {r.operation}
              </strong>
              <span>{r.metal ?? r.category ?? "همه محصولات"}</span>
              <label className="rule-value"><input value={inputNumber(ruleDrafts[r.id]??r.adjustmentValue)} onChange={e=>setRuleDrafts({...ruleDrafts,[r.id]:rawNumber(e.target.value,true)})}/><small>{r.adjustmentType === "PERCENT"?"درصد؛ منفی یعنی کاهش":"تومان؛ منفی یعنی کمتر از نرخ پایه"}</small></label>
              <button className="rule-save" onClick={()=>editRule.mutate({id:r.id,value:ruleDrafts[r.id]??r.adjustmentValue})}><Save/></button>
              <button onClick={() => remove.mutate(r.id)}>
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
