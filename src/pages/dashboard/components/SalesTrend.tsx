import { Card } from "@/components/ui/Card";

export function SalesTrend({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map(item => item.value), 1);
  const points = data.map((item, index) => `${index * (600 / Math.max(data.length - 1, 1))},${170 - (item.value / max) * 140}`).join(" ");
  return <Card title="روند فروش" className="sales-panel"><div className="sales-panel__summary"><span>فروش ۷ روز اخیر</span><strong>{new Intl.NumberFormat("fa-IR").format(data.reduce((sum, item) => sum + item.value, 0))} تومان</strong></div><div className="line-chart"><svg viewBox="0 0 600 190" preserveAspectRatio="none"><defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d99a23" stopOpacity=".2"/><stop offset="1" stopColor="#d99a23" stopOpacity="0"/></linearGradient></defs><polygon points={`0,180 ${points} 600,180`} fill="url(#sales-fill)"/><polyline points={points} fill="none" stroke="#d99a23" strokeWidth="3" vectorEffect="non-scaling-stroke"/>{data.map((item,index)=><circle key={index} cx={index*(600/Math.max(data.length-1,1))} cy={170-(item.value/max)*140} r="4" fill="#fff" stroke="#d99a23" strokeWidth="2" vectorEffect="non-scaling-stroke"/>)}</svg><div className="line-chart__labels">{data.map(item => <span key={item.label}>{item.label}</span>)}</div></div></Card>;
}
