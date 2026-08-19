import { BadgePercent, CalendarClock, Landmark, ShoppingBag } from "lucide-react";

export type PlanViewModel={type:string;reservePlan?:{percent:number};discountPlan?:{percent:number;title?:string};installmentPlan?:{count:number;days:number}};
export const isNormalPlan=(type:string)=>["NORMAL","REGULAR","DEFAULT"].includes(type.toUpperCase());
export const getPlanView=(plan:PlanViewModel)=>{
  if(isNormalPlan(plan.type))return {Icon:ShoppingBag,tone:"normal",title:"پلن عادی",detail:"فروش عادی محصول"};
  if(plan.type==="DISCOUNT")return {Icon:BadgePercent,tone:"green",title:plan.discountPlan?.title||"پلن تخفیف",detail:`${plan.discountPlan?.percent??0}٪ تخفیف`};
  if(plan.type==="INSTALLMENT")return {Icon:CalendarClock,tone:"blue",title:"پلن اقساطی",detail:`${plan.installmentPlan?.count??0} قسط، هر ${plan.installmentPlan?.days??0} روز`};
  if(plan.type==="RESERVE")return {Icon:Landmark,tone:"yellow",title:"پلن رزرو",detail:`${plan.reservePlan?.percent??0}٪ پیش‌پرداخت`};
  return {Icon:ShoppingBag,tone:"neutral",title:"پلن فروش",detail:plan.type};
};
export function PlanTone({plan,compact=false}:{plan:PlanViewModel;compact?:boolean}){const config=getPlanView(plan);return <span className={`plan-tone plan-tone--${config.tone} ${compact?"plan-tone--compact":""}`}><i><config.Icon/></i><span><strong>{config.title}</strong><small>{config.detail}</small></span></span>}
