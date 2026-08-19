import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Tags, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "@/stores/toast.store";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { ProductLabel } from "../products/create/product-form.types";
import { createLabel, deleteLabel, getLabels, updateLabel, type LabelPayload } from "./labels.api";
import "./labels.css";

const empty:LabelPayload={title:"",slug:"",description:"",isActive:true,showOnProductCard:true,showInFilters:true,showAsProductRow:false,scopeMetals:[],scopeCategories:[],sortOrder:0,startAt:null,endAt:null};
export function LabelsPage(){
  const client=useQueryClient(); const [form,setForm]=useState<LabelPayload>(empty);
  const [editingId,setEditingId]=useState<number|null>(null);
  const [deleteConfirmation,setDeleteConfirmation]=useState<ProductLabel|null>(null);
  const {data:labels=[],isLoading}=useQuery({queryKey:["product-labels"],queryFn:getLabels});
  const refresh=()=>client.invalidateQueries({queryKey:["product-labels"]});
  const create=useMutation({mutationFn:()=>createLabel(form),onSuccess:async()=>{setForm(empty);await refresh();toast.success("برچسب ساخته شد","برچسب جدید آماده اتصال به محصولات است.")},onError:()=>toast.error("ساخت برچسب ناموفق بود","عنوان و slug را بررسی کنید.")});
  const saveUpdate=useMutation({mutationFn:()=>updateLabel(editingId!,form),onSuccess:async()=>{setEditingId(null);setForm(empty);await refresh();toast.success("برچسب ویرایش شد","تغییرات برچسب با موفقیت ذخیره شد.")},onError:()=>toast.error("ویرایش برچسب ناموفق بود","عنوان یا slug تکراری است یا اطلاعات فرم معتبر نیست.")});
  const toggleStatus=useMutation({mutationFn:({id,isActive}:{id:number;isActive:boolean})=>updateLabel(id,{isActive}),onSuccess:refresh});
  const remove=useMutation({mutationFn:deleteLabel,onSuccess:async()=>{setDeleteConfirmation(null);await refresh();toast.success("برچسب حذف شد","برچسب بدون محصول حذف شد.")},onError:()=>toast.error("حذف برچسب ممکن نیست","ابتدا اتصال برچسب به محصولات را حذف کنید.")});
  const beginEdit=(label:ProductLabel)=>{setEditingId(label.id);setForm({title:label.title,slug:label.slug,description:label.description??"",isActive:label.isActive,showOnProductCard:label.showOnProductCard,showInFilters:label.showInFilters,showAsProductRow:label.showAsProductRow,scopeMetals:label.scopeMetals??[],scopeCategories:label.scopeCategories??[],sortOrder:label.sortOrder,startAt:label.startAt??null,endAt:label.endAt??null});window.scrollTo({top:0,behavior:"smooth"})};
  const cancelEdit=()=>{setEditingId(null);setForm(empty)};
  return <div className="labels-page"><div className="screen-heading"><div><h2>مدیریت برچسب‌ها</h2><p>برچسب‌های کمپینی و تجاری محصولات را تعریف و کنترل کنید.</p></div></div>
    <section className="card label-create"><h3>{editingId?<Pencil/>:<Plus/>}{editingId?"ویرایش برچسب":"برچسب جدید"}</h3><div className="label-form-grid">
      <label>عنوان<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Slug<input dir="ltr" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/\s+/g,"-")})}/></label>
      <label>ترتیب نمایش<input type="number" min="0" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/></label>
      <label className="span-3">توضیحات<input value={form.description??""} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label>فلز مجاز<select value={form.scopeMetals?.[0]??""} onChange={e=>setForm({...form,scopeMetals:e.target.value?[e.target.value as ProductLabel["scopeMetals"][number]]:[]})}><option value="">همه فلزها</option><option value="GOLD">طلا</option><option value="SILVER">نقره</option><option value="PLATINUM">پلاتین</option><option value="COPPER">مس</option></select></label>
      <label>نوع محصول مجاز<select value={form.scopeCategories?.[0]??""} onChange={e=>setForm({...form,scopeCategories:e.target.value?[e.target.value as ProductLabel["scopeCategories"][number]]:[]})}><option value="">همه نوع‌ها</option><option value="JEWELRY">جواهر</option><option value="COIN">سکه</option><option value="BULLION">شمش</option></select></label>
    </div><div className="label-flags">
      <label><input type="checkbox" checked={form.showOnProductCard} onChange={e=>setForm({...form,showOnProductCard:e.target.checked})}/>نمایش روی کارت</label>
      <label><input type="checkbox" checked={form.showInFilters} onChange={e=>setForm({...form,showInFilters:e.target.checked})}/>نمایش در فیلترها</label>
      <label><input type="checkbox" checked={form.showAsProductRow} onChange={e=>setForm({...form,showAsProductRow:e.target.checked})}/>ردیف مستقل محصولات</label>
    </div><div className="label-form-actions">{editingId?<><button className="button button--primary" disabled={!form.title.trim()||!form.slug.trim()||saveUpdate.isPending} onClick={()=>saveUpdate.mutate()}><Save/>ذخیره تغییرات</button><button className="button button--secondary" onClick={cancelEdit}><X/>انصراف</button></>:<button className="button button--primary" disabled={!form.title.trim()||!form.slug.trim()||create.isPending} onClick={()=>create.mutate()}><Plus/>ساخت برچسب</button>}</div></section>
    <section className="card label-list"><h3><Tags/>برچسب‌های موجود</h3>{isLoading?<p className="list-state">در حال دریافت...</p>:<div className="table-wrap"><table><thead><tr><th>عنوان</th><th>Slug</th><th>محدوده</th><th>ترتیب نمایش</th><th>محصولات</th><th>کاربرد</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{labels.map(label=><tr key={label.id} className={editingId===label.id?"is-editing":""}><td><strong>{label.title}</strong></td><td dir="ltr">{label.slug}</td><td>{label.scopeMetals?.length?label.scopeMetals.join("، "):"همه فلزها"} / {label.scopeCategories?.length?label.scopeCategories.join("، "):"همه نوع‌ها"}</td><td>{new Intl.NumberFormat("fa-IR").format(label.sortOrder)}</td><td>{label._count?.products??0}</td><td>{[label.showOnProductCard&&"کارت",label.showInFilters&&"فیلتر",label.showAsProductRow&&"ردیف"].filter(Boolean).join("، ")||"—"}</td><td><button className={`status-toggle ${label.isActive?"is-active":""}`} onClick={()=>toggleStatus.mutate({id:label.id,isActive:!label.isActive})}>{label.isActive?"فعال":"غیرفعال"}</button></td><td><div className="label-row-actions"><button className="icon-button edit-action" aria-label={`ویرایش ${label.title}`} onClick={()=>beginEdit(label)}><Pencil/></button><button className="icon-button danger-action" aria-label="حذف" disabled={Boolean(label._count?.products)} onClick={()=>setDeleteConfirmation(label)}><Trash2/></button></div></td></tr>)}</tbody></table></div>}</section>
    <ConfirmModal open={Boolean(deleteConfirmation)} title="حذف برچسب" description={`برچسب «${deleteConfirmation?.title ?? ""}» برای همیشه حذف می‌شود و این عملیات قابل بازگشت نیست.`} confirmLabel="حذف برچسب" tone="danger" loading={remove.isPending} onClose={()=>setDeleteConfirmation(null)} onConfirm={()=>deleteConfirmation&&remove.mutate(deleteConfirmation.id)}/>
  </div>
}
