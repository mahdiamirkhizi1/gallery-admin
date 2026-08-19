import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BadgePercent, CalendarClock, CirclePause, Clock3, Filter, HelpCircle, Layers3, Plus, Search, ShoppingBag, Trash2, WalletCards } from "lucide-react";
import { deletePlan, getPlans, updatePlanStatus } from "./plans.api";
import type { Plan, PlanType } from "./plans.types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "@/stores/toast.store";
import "./plans.css";
import "./plan-actions.css";

const typeView = {
  NORMAL: { label: "فروش عادی", Icon: ShoppingBag, tone: "normal" },
  DISCOUNT: { label: "تخفیف", Icon: BadgePercent, tone: "discount" },
  RESERVE: { label: "رزرو", Icon: CalendarClock, tone: "reserve" },
  INSTALLMENT: { label: "اقساط", Icon: WalletCards, tone: "installment" },
} as const;
const categories: Record<string,string> = { JEWELRY:"جواهر", COIN:"سکه", BULLION:"شمش" };
const fa = (value:number) => new Intl.NumberFormat("fa-IR").format(value);
const faDate = (value?:string) => value ? new Intl.DateTimeFormat("fa-IR").format(new Date(value)) : "—";
type Status = "ACTIVE"|"WAITING"|"STOPPED";
const planStatus = (plan:Plan):Status => {
  const detailActive = plan.discountPlan?.isActive ?? plan.reservePlan?.isActive ?? plan.installmentPlan?.isActive ?? true;
  if (!plan.isActive || !detailActive) return "STOPPED";
  if (plan.discountPlan?.startDate && new Date(plan.discountPlan.startDate) > new Date()) return "WAITING";
  return "ACTIVE";
};
const statusView = { ACTIVE:{label:"فعال",Icon:CalendarClock}, WAITING:{label:"در انتظار",Icon:Clock3}, STOPPED:{label:"متوقف",Icon:CirclePause} } as const;
const planTitle = (plan:Plan) => plan.type === "NORMAL" ? "فروش عادی" : plan.discountPlan?.title || `${typeView[plan.type].label} شماره ${fa(plan.id)}`;
const planDescription = (plan:Plan) => plan.type === "DISCOUNT" ? `${fa(plan.discountPlan?.percent??0)}٪ تخفیف` : plan.type === "RESERVE" ? `${fa(plan.reservePlan?.percent??0)}٪ پیش‌پرداخت` : plan.type === "INSTALLMENT" ? `${fa(plan.installmentPlan?.count??0)} قسط، هر ${fa(plan.installmentPlan?.days??0)} روز` : "فروش بدون شرایط خاص";

export function PlansPage(){
  const queryClient=useQueryClient();
  const {data,isLoading,isError}=useQuery({queryKey:["plans-list"],queryFn:getPlans});
  const [actionError,setActionError]=useState("");
  const [confirmation,setConfirmation]=useState<{plan:Plan;action:"toggle"|"delete"}|null>(null);
  const statusMutation=useMutation({mutationFn:updatePlanStatus,onSuccess:(_data,variables)=>{toast.success(variables.isActive?"پلن فعال شد":"پلن غیرفعال شد",variables.isActive?"پلن روی خریدهای جدید قابل استفاده است.":"این پلن دیگر روی خریدهای جدید اعمال نمی‌شود.");setActionError("");setConfirmation(null);queryClient.invalidateQueries({queryKey:["plans-list"]})},onError:()=>{toast.error("تغییر وضعیت ناموفق بود","ممکن است یکی از محصولات، پلن فعال دیگری از همین نوع داشته باشد.");setActionError("تغییر وضعیت پلن ناموفق بود.")}});
  const deleteMutation=useMutation({mutationFn:deletePlan,onSuccess:()=>{toast.success("پلن حذف شد","پلن با موفقیت از سیستم حذف شد.");setActionError("");setConfirmation(null);queryClient.invalidateQueries({queryKey:["plans-list"]})},onError:()=>{toast.error("حذف پلن انجام نشد","پلن متصل به محصول یا سفارش قابل حذف نیست.");setActionError("این پلن به محصول یا سفارش متصل است و قابل حذف نیست.")}});
  const [search,setSearch]=useState("");const [type,setType]=useState("");const [status,setStatus]=useState("");const [category,setCategory]=useState("");const [page,setPage]=useState(1);
  const plans=data?.items??[];
  const filtered=useMemo(()=>plans.filter(plan=>{
    const products=plan.productPlans?.map(item=>item.product)??[];
    return (!search||`${planTitle(plan)} ${planDescription(plan)}`.includes(search))&&(!type||plan.type===type)&&(!status||planStatus(plan)===status)&&(!category||products.some(product=>product.category===category));
  }),[plans,search,type,status,category]);
  const pageItems=filtered.slice((page-1)*10,page*10);const pages=Math.max(1,Math.ceil(filtered.length/10));
  const counts={active:plans.filter(p=>planStatus(p)==="ACTIVE").length,waiting:plans.filter(p=>planStatus(p)==="WAITING").length,stopped:plans.filter(p=>planStatus(p)==="STOPPED").length};
  const patch=()=>setPage(1);
  return <div className="plans-page">
    <Link className="button button--primary plans-create-link" to="/plans/new"><Plus/>ایجاد پلن جدید</Link>
    <div className="plans-heading"><div><div className="breadcrumb"><span>محصولات</span><span>‹</span><span>پلن‌ها</span></div><h2>پلن‌ها</h2><p>پلن‌های فروش و شرایط پرداخت محصولات را مدیریت کنید.</p></div><button className="button button--primary" disabled title="فرم ایجاد پلن در مرحله بعد متصل می‌شود"><Plus/>ایجاد پلن جدید</button></div>
    <div className="plan-stat-grid"><Stat Icon={Layers3} tone="orange" label="کل پلن‌ها" value={plans.length} note="در تمام انواع"/><Stat Icon={CirclePause} tone="purple" label="متوقف شده" value={counts.stopped} note={`${plans.length?Math.round(counts.stopped/plans.length*100):0}٪ از کل پلن‌ها`}/><Stat Icon={Clock3} tone="blue" label="در انتظار شروع" value={counts.waiting} note={`${plans.length?Math.round(counts.waiting/plans.length*100):0}٪ از کل پلن‌ها`}/><Stat Icon={CalendarClock} tone="green" label="پلن‌های فعال" value={counts.active} note={`${plans.length?Math.round(counts.active/plans.length*100):0}٪ از کل پلن‌ها`}/></div>
    <div className="plans-layout"><main className="plans-table-card"><div className="plan-filters"><label><Search/><input value={search} onChange={e=>{setSearch(e.target.value);patch()}} placeholder="جستجو بر اساس نام پلن..."/></label><select value={status} onChange={e=>{setStatus(e.target.value);patch()}}><option value="">همه وضعیت‌ها</option><option value="ACTIVE">فعال</option><option value="WAITING">در انتظار</option><option value="STOPPED">متوقف</option></select><select value={type} onChange={e=>{setType(e.target.value);patch()}}><option value="">همه انواع</option>{Object.entries(typeView).map(([key,value])=><option key={key} value={key}>{value.label}</option>)}</select><select value={category} onChange={e=>{setCategory(e.target.value);patch()}}><option value="">همه محصولات</option><option value="JEWELRY">جواهر</option><option value="COIN">سکه</option><option value="BULLION">شمش</option></select><button className="button button--secondary"><Filter/>فیلترها</button></div>
      {actionError&&<p className="plan-action-error">{actionError}</p>}{isLoading?<div className="list-state">در حال دریافت پلن‌ها...</div>:isError?<div className="list-state list-state--error">دریافت پلن‌ها ناموفق بود.</div>:<div className="plans-table-wrap"><table><thead><tr><th>نام پلن</th><th>نوع پلن</th><th>نوع محصول</th><th>توضیحات</th><th>شروع</th><th>پایان</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{pageItems.map(plan=><PlanRow key={plan.id} plan={plan} busy={statusMutation.isPending||deleteMutation.isPending} onToggle={()=>setConfirmation({plan,action:"toggle"})} onDelete={()=>setConfirmation({plan,action:"delete"})}/>)}</tbody></table></div>}
      <div className="plans-pagination"><span>نمایش {fa(pageItems.length)} از {fa(filtered.length)} مورد</span><div><button disabled={page<=1} onClick={()=>setPage(page-1)}>‹</button>{Array.from({length:pages},(_,i)=>i+1).slice(0,4).map(n=><button key={n} className={n===page?"current":""} onClick={()=>setPage(n)}>{fa(n)}</button>)}<button disabled={page>=pages} onClick={()=>setPage(page+1)}>›</button></div></div>
    </main><aside className="plans-aside"><section><h3>انواع پلن</h3>{(Object.keys(typeView) as PlanType[]).map(key=>{const view=typeView[key];return <div className={`plan-kind plan-kind--${view.tone}`} key={key}><i><view.Icon/></i><span><strong>{view.label}</strong><small>{key==="NORMAL"?"فروش نقدی محصول بدون شرایط خاص":key==="DISCOUNT"?"اعمال تخفیف درصدی یا مبلغی":key==="RESERVE"?"رزرو محصول با پیش‌پرداخت":"فروش اقساطی با همکاری درگاه‌ها"}</small></span></div>})}</section><section className="plans-notes"><h3>نکات مهم</h3><p>پلن‌ها به محصولات متصل می‌شوند.</p><p>فقط یک پلن از هر نوع می‌تواند همزمان فعال باشد.</p><p>تاریخ‌های شروع و پایان پلن تخفیف بررسی می‌شوند.</p><p>ترتیب نمایش پلن‌ها در صفحه محصول قابل تنظیم است.</p></section><section className="plans-help"><HelpCircle/><div><h3>راهنما</h3><p>برای ایجاد پلن جدید روی دکمه بالا کلیک کنید.</p></div></section></aside></div>
    <ConfirmModal open={Boolean(confirmation)} title={confirmation?.action==="delete"?"حذف پلن":confirmation?.plan.isActive?"غیرفعال‌کردن پلن":"فعال‌کردن پلن"} description={confirmation?.action==="delete"?`پلن «${confirmation?planTitle(confirmation.plan):""}» برای همیشه حذف می‌شود و این عملیات قابل بازگشت نیست.`:confirmation?.plan.isActive?`پلن «${planTitle(confirmation.plan)}» غیرفعال می‌شود و دیگر روی خریدهای جدید اعمال نخواهد شد.`:`پلن «${confirmation?planTitle(confirmation.plan):""}» فعال می‌شود و روی محصولات متصل قابل استفاده خواهد بود.`} confirmLabel={confirmation?.action==="delete"?"حذف پلن":confirmation?.plan.isActive?"غیرفعال‌کردن":"فعال‌کردن"} tone={confirmation?.action==="delete"?"danger":"warning"} loading={statusMutation.isPending||deleteMutation.isPending} onClose={()=>setConfirmation(null)} onConfirm={()=>{if(!confirmation)return;confirmation.action==="delete"?deleteMutation.mutate(confirmation.plan.id):statusMutation.mutate({id:confirmation.plan.id,isActive:!confirmation.plan.isActive})}} />
  </div>;
}
function Stat({Icon,tone,label,value,note}:{Icon:typeof Layers3;tone:string;label:string;value:number;note:string}){return <section className="plan-stat"><i className={`plan-stat__icon plan-stat__icon--${tone}`}><Icon/></i><div><span>{label}</span><strong>{fa(value)}</strong><small>{note}</small></div></section>}
function PlanRow({plan,busy,onToggle,onDelete}:{plan:Plan;busy:boolean;onToggle:()=>void;onDelete:()=>void}){const view=typeView[plan.type];const status=statusView[planStatus(plan)];const products=plan.productPlans?.map(item=>item.product)??[];const productCount=plan._count?.productPlans??products.length;const orderCount=plan._count?.orderItems??0;const canToggle=plan.type!=="NORMAL";const canDelete=plan.type!=="NORMAL"&&productCount===0&&orderCount===0;const productType=[...new Set(products.map(p=>categories[p.category]))].join("، ")||"بدون محصول";const deleteTitle=plan.type==="NORMAL"?"پلن عادی قابل حذف نیست":productCount>0?`این پلن به ${fa(productCount)} محصول متصل است`:orderCount>0?`این پلن در ${fa(orderCount)} سفارش استفاده شده است`:"حذف پلن";return <tr><td><div className={`plan-name plan-kind--${view.tone}`}><i><view.Icon/></i><strong>{planTitle(plan)}</strong></div></td><td><span className={`plan-type-tag plan-type-tag--${view.tone}`}>{view.label}</span></td><td>{productType}</td><td>{planDescription(plan)}<small>{fa(productCount)} محصول متصل</small></td><td>{faDate(plan.discountPlan?.startDate)}</td><td>{faDate(plan.discountPlan?.expireDate)}</td><td><span className={`plan-state plan-state--${planStatus(plan).toLowerCase()}`}><status.Icon/>{status.label}</span></td><td><div className="plan-actions"><button className={!plan.isActive?"plan-action--activate":""} disabled={!canToggle||busy} onClick={onToggle} title={plan.type==="NORMAL"?"وضعیت پلن عادی قابل تغییر نیست":plan.isActive?"غیرفعال‌کردن پلن":"فعال‌کردن پلن"}>{plan.isActive?<CirclePause/>:<CalendarClock/>}</button><button disabled={!canDelete||busy} onClick={onDelete} title={deleteTitle}><Trash2/></button></div></td></tr>}
