import { LockKeyhole, Plus, ShoppingBag, X } from "lucide-react";
import type { ProductPlan } from "../create/product-form.types";
import { getPlanView, isNormalPlan } from "./PlanTone";

export function ProductPlanEditor({plans,selected,onChange}:{plans:ProductPlan[];selected:number[];onChange:(ids:number[])=>void}){
  const selectable=plans.filter(plan=>!isNormalPlan(plan.type));
  return <section className="edit-card plans-editor">
    <h3>پلن‌های مرتبط</h3>
    <p className="plans-editor__hint">پلن‌های فعال این محصول را مدیریت کنید. پلن عادی همیشه فعال است.</p>
    <div className="plan-select-row">
      <span className="selected-plan selected-plan--normal"><ShoppingBag/>پلن عادی <small>همیشه فعال</small><LockKeyhole/></span>
      {selectable.filter(plan=>selected.includes(plan.id)).map(plan=>{const view=getPlanView(plan);return <button type="button" key={plan.id} className={`selected-plan selected-plan--${view.tone}`} onClick={()=>onChange(selected.filter(id=>id!==plan.id))}><view.Icon/><span><strong>{view.title}</strong><small>{view.detail}</small></span><X/></button>})}
    </div>
    <div className="available-plans">{selectable.filter(plan=>!selected.includes(plan.id)).map(plan=>{const view=getPlanView(plan);return <button type="button" key={plan.id} className={`available-plan available-plan--${view.tone}`} onClick={()=>onChange([...selected.filter(id=>plans.find(item=>item.id===id)?.type!==plan.type),plan.id])}><Plus/><span><strong>{view.title}</strong><small>{view.detail}</small></span></button>})}</div>
  </section>;
}
