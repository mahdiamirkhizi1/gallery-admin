import { Card } from "@/components/ui/Card";
import type { OrderStatus } from "../dashboard.types";

const config: Array<[OrderStatus, string, string]> = [["PENDING_PAYMENT","در انتظار پرداخت","#e4aa2a"],["PARTIALLY_PAID","پرداخت بخشی","#8b6bd1"],["PAID","پرداخت شده","#5fa6cf"],["PROCESSING","در حال آماده‌سازی","#afb080"],["SHIPPED","ارسال شده","#8e9272"],["COMPLETED","تکمیل شده","#4ba66a"],["CANCELLED","لغو شده","#ee6969"]];
export function OrderStatusCard({ counts }: { counts: Record<OrderStatus, number> }) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  let cursor = 0; const segments = config.map(([status,,color]) => { const start = cursor; cursor += total ? counts[status] / total * 100 : 0; return `${color} ${start}% ${cursor}%`; });
  return <Card title="وضعیت سفارش‌ها"><div className="order-status"><div className="donut" style={{ background: `conic-gradient(${segments.join(",")})` }}><span><strong>{new Intl.NumberFormat("fa-IR").format(total)}</strong><small>سفارش</small></span></div><ul>{config.map(([status,label,color])=><li key={status}><i style={{background:color}}/><span>{label}</span><strong>{new Intl.NumberFormat("fa-IR").format(counts[status])}</strong></li>)}</ul></div></Card>;
}
