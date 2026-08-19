import { LockKeyhole, Plus, ShoppingBag, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/stores/toast.store";
import { useState } from "react";
import { NumberInput } from "@/components/ui/NumberInput";
import { createReservePlan, getProductPlans } from "../product-form.api";
import type { ProductDraft } from "../product-form.types";
import { getPlanView, isNormalPlan } from "../../components/PlanTone";

export function StepPlans({draft,patch}:{draft:ProductDraft;patch:(value:Partial<ProductDraft>)=>void}){
  const client=useQueryClient();
  const [creating,setCreating]=useState(false);
  const [percent,setPercent]=useState(30);
  const {data=[],isLoading}=useQuery({queryKey:["product-plans"],queryFn:getProductPlans});
  const mutation=useMutation({mutationFn:()=>createReservePlan(percent),onSuccess:async()=>{toast.success("پلن رزرو ایجاد شد",`پلن با پیش‌پرداخت ${percent} درصد ثبت شد.`);await client.invalidateQueries({queryKey:["product-plans"]});setCreating(false)},onError:()=>toast.error("ایجاد پلن رزرو ناموفق بود","لطفاً مقدار پیش‌پرداخت را بررسی کنید.")});
  const toggle=(id:number)=>{const plan=data.find(item=>item.id===id);if(!plan)return;const withoutSameType=draft.existingPlanIds.filter(selectedId=>data.find(item=>item.id===selectedId)?.type!==plan.type);patch({existingPlanIds:draft.existingPlanIds.includes(id)?draft.existingPlanIds.filter(item=>item!==id):[...withoutSameType,id]})};
  return <section className="form-section"><h3>روش‌های فروش محصول</h3><div className="plan-grid"><button type="button" className="selected default-plan" disabled><ShoppingBag/><strong>پلن عادی</strong><small>همیشه فعال</small><LockKeyhole/></button>{data.filter(plan=>!isNormalPlan(plan.type)).map(plan=>{const view=getPlanView(plan);return <button type="button" key={plan.id} className={draft.existingPlanIds.includes(plan.id)?"selected":""} onClick={()=>toggle(plan.id)}><view.Icon/><strong>{view.title}</strong><small>{draft.existingPlanIds.includes(plan.id)?view.detail:`افزودن — ${view.detail}`}</small></button>})}<button type="button" onClick={()=>setCreating(true)} disabled={isLoading}><Plus/><strong>{isLoading?"در حال دریافت...":"ساخت پلن جدید"}</strong><small>ایجاد در همین صفحه</small></button></div>{creating&&<div className="inline-plan"><button type="button" className="inline-plan__close" onClick={()=>setCreating(false)}><X/></button><h4>ساخت پلن رزرو</h4><label>درصد پیش‌پرداخت<NumberInput value={percent} onChange={setPercent}/></label><button type="button" className="button button--primary" disabled={mutation.isPending||percent<1||percent>99} onClick={()=>mutation.mutate()}>{mutation.isPending?"در حال ساخت...":"ساخت پلن رزرو"}</button></div>}</section>;
}
