import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { useEffect } from "react";
import { useToastStore, type ToastItem } from "@/stores/toast.store";
import "./toast.css";
const icons = { success: CheckCircle2, error: CircleAlert, info: Info };
function ToastCard({ item }: { item: ToastItem }) { const remove = useToastStore((state) => state.remove); const Icon = icons[item.tone]; useEffect(() => { const timer = window.setTimeout(() => remove(item.id), item.tone === "error" ? 6500 : 4500); return () => window.clearTimeout(timer); }, [item.id, item.tone, remove]); return <article className={`app-toast app-toast--${item.tone}`} role={item.tone === "error" ? "alert" : "status"}><i><Icon /></i><div><strong>{item.title}</strong>{item.message && <p>{item.message}</p>}</div><button onClick={() => remove(item.id)} aria-label="بستن پیام"><X /></button><span className="app-toast__timer" /></article>; }
export function ToastViewport() { const items = useToastStore((state) => state.items); return <div className="toast-viewport" aria-live="polite">{items.map((item) => <ToastCard item={item} key={item.id} />)}</div>; }
