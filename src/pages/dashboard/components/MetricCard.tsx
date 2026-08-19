import type { LucideIcon } from "lucide-react";
import { ArrowUp } from "lucide-react";

export function MetricCard({ title, value, suffix, hint, icon: Icon, danger = false }: { title: string; value: string; suffix?: string; hint: string; icon: LucideIcon; danger?: boolean }) {
  return <article className="metric-card"><span className={`metric-card__icon ${danger ? "metric-card__icon--danger" : ""}`}><Icon /></span><div><p>{title}</p><strong>{value} {suffix && <small>{suffix}</small>}</strong><span className={danger ? "metric-card__hint--danger" : "metric-card__hint"}><ArrowUp size={13} />{hint}</span></div></article>;
}
