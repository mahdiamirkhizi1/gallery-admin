import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, ReceiptText, Save, X } from "lucide-react";
import { getCardSettings, getReceiptBlob, getReviewPayments, reviewPayment, saveCardSettings, type AdminPayment, type CardSettings } from "./payments.api";
import { useToastStore } from "@/stores/toast.store";
import "./payments.css";

const money = (value: string) => `${Number(value).toLocaleString("fa-IR")} تومان`;
export function PaymentsPage() {
  const query = useQuery({ queryKey: ["payment-review"], queryFn: getReviewPayments });
  const [selected, setSelected] = useState<AdminPayment | null>(null);
  const [note, setNote] = useState("");
  const client = useQueryClient();
  const toast = useToastStore();
  const review = useMutation({ mutationFn: ({ id, status }: { id: number; status: "SUCCESS" | "FAILED" }) => reviewPayment(id, status, note || undefined), onSuccess: () => { client.invalidateQueries({ queryKey: ["payment-review"] }); setSelected(null); setNote(""); toast.success("نتیجه بررسی ثبت شد"); }, onError: () => toast.error("ثبت نتیجه ناموفق بود") });
  return <div className="payment-review-page"><header><div><h2>بررسی پرداخت‌ها</h2><p>رسیدهای کارت‌به‌کارت در انتظار تصمیم ادمین</p></div><span>{(query.data?.length ?? 0).toLocaleString("fa-IR")} مورد</span></header>
    <CardSettingsPanel />
    <div className="payment-review-grid"><section className="payment-review-list">{query.isLoading ? <p>در حال دریافت…</p> : query.data?.length ? query.data.map(item => <button key={item.id} onClick={() => { setSelected(item); setNote(""); }} className={selected?.id === item.id ? "is-selected" : ""}><ReceiptText/><span><strong>سفارش {item.order.id.toLocaleString("fa-IR")}</strong><small>{item.order.user.fullName || item.order.user.mobile}</small></span><b>{money(item.amount)}</b></button>) : <p className="payment-empty">رسیدی در انتظار بررسی نیست.</p>}</section>
      <section className="payment-review-detail">{selected ? <><div className="payment-meta"><span>کد پیگیری</span><strong>{selected.receipt?.referenceCode}</strong><span>زمان اعلام پرداخت</span><strong>{selected.receipt ? new Date(selected.receipt.paidAt).toLocaleString("fa-IR") : "—"}</strong></div><ReceiptImage paymentId={selected.id}/><label>یادداشت بررسی<textarea value={note} onChange={e => setNote(e.target.value)} placeholder="برای رد پرداخت، علت را بنویسید" maxLength={1000}/></label><div className="payment-actions"><button onClick={() => review.mutate({ id: selected.id, status: "SUCCESS" })} disabled={review.isPending}><Check/>تأیید پرداخت</button><button className="reject" onClick={() => note.trim() && review.mutate({ id: selected.id, status: "FAILED" })} disabled={review.isPending || !note.trim()}><X/>رد پرداخت</button></div></> : <p className="payment-empty">یک رسید را از فهرست انتخاب کنید.</p>}</section>
    </div></div>;
}
const normalizeDigits = (value: string) => value.replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\D/g, "");
const groupCard = (value: string) => normalizeDigits(value).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
function CardSettingsPanel() {
  const query = useQuery({ queryKey: ["card-to-card-settings"], queryFn: getCardSettings });
  const toast = useToastStore();
  const [form, setForm] = useState<CardSettings>({ cardNumber: "", iban: "", accountHolder: "", bankName: "", isActive: true });
  useEffect(() => { if (query.data) setForm(query.data); }, [query.data]);
  const save = useMutation({ mutationFn: saveCardSettings, onSuccess: value => { setForm(value); toast.success("حساب مقصد ذخیره شد", "سفارش‌های جدید اطلاعات همین حساب را دریافت می‌کنند."); }, onError: () => toast.error("ذخیره حساب مقصد ناموفق بود") });
  const valid = normalizeDigits(form.cardNumber).length === 16 && (!form.iban || normalizeDigits(form.iban).length === 24) && form.accountHolder.trim().length >= 3 && form.bankName.trim().length >= 2;
  return <section className="card-settings-panel"><header><span><CreditCard/><span><strong>حساب مقصد کارت‌به‌کارت</strong><small>این اطلاعات روی پرداخت سفارش‌های جدید ثبت می‌شود.</small></span></span><label className="settings-switch"><input type="checkbox" checked={form.isActive} onChange={e => setForm(value => ({ ...value, isActive: e.target.checked }))}/><span>{form.isActive ? "فعال" : "غیرفعال"}</span></label></header><div className="card-settings-grid"><label>شماره کارت<input inputMode="numeric" dir="ltr" value={groupCard(form.cardNumber)} onChange={e => setForm(value => ({ ...value, cardNumber: normalizeDigits(e.target.value).slice(0, 16) }))} placeholder="۶۰۳۷ ۹۹۱۲ ۳۴۵۶ ۷۸۹۰"/></label><label>شماره شبا (اختیاری)<div className="iban-input"><span>IR</span><input inputMode="numeric" dir="ltr" value={normalizeDigits(form.iban ?? "").slice(0, 24)} onChange={e => setForm(value => ({ ...value, iban: normalizeDigits(e.target.value).slice(0, 24) }))} placeholder="۲۴ رقم"/></div></label><label>نام صاحب حساب<input value={form.accountHolder} onChange={e => setForm(value => ({ ...value, accountHolder: e.target.value }))} placeholder="نام و نام خانوادگی"/></label><label>نام بانک<input value={form.bankName} onChange={e => setForm(value => ({ ...value, bankName: e.target.value }))} placeholder="مثلاً بانک ملت"/></label></div><button className="button button--primary card-settings-save" disabled={!valid || save.isPending} onClick={() => save.mutate({ ...form, cardNumber: normalizeDigits(form.cardNumber), iban: form.iban ? normalizeDigits(form.iban) : null })}><Save/>{save.isPending ? "در حال ذخیره…" : "ذخیره حساب مقصد"}</button></section>;
}
function ReceiptImage({ paymentId }: { paymentId: number }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => { let active = true; let objectUrl = ""; getReceiptBlob(paymentId).then(blob => { if (!active) return; objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); }); return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [paymentId]);
  return url ? <img className="receipt-image" src={url} alt="تصویر رسید پرداخت"/> : <div className="receipt-image receipt-loading">در حال دریافت تصویر…</div>;
}
