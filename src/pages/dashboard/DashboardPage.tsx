import { AlertTriangle, Gavel, Package, Plus, ShoppingBag, Users, Wallet } from "lucide-react";
import { MetricCard } from "./components/MetricCard";
import { SalesTrend } from "./components/SalesTrend";
import { OrderStatusCard } from "./components/OrderStatusCard";
import { RecentOrders } from "./components/RecentOrders";
import { ProductPanels, QuickAccess } from "./components/ProductPanels";
import { useDashboard } from "./useDashboard";
import { Link } from "react-router-dom";

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();
  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) return <div className="dashboard-error"><AlertTriangle/><h2>دریافت اطلاعات داشبورد ناموفق بود</h2><p>اتصال بک‌اند و اعتبار نشست مدیر را بررسی کنید.</p><button className="button button--primary" onClick={()=>refetch()}>تلاش دوباره</button></div>;
  return <div className="dashboard-v2">
    <div className="dashboard-heading"><div><h2>داشبورد</h2><p>نمای کلی عملکرد فروشگاه شما</p></div><div><button className="button button--secondary"><Gavel size={17}/> ایجاد مزایده</button><Link to="/products/new" className="button button--primary"><Plus size={17}/> افزودن محصول</Link></div></div>
    <div className="metrics-row"><MetricCard title="فروش امروز" value={money(data.metrics.sales)} suffix="تومان" hint="بر اساس سفارش‌های امروز" icon={Wallet}/><MetricCard title="سفارش‌های امروز" value={money(data.metrics.orders)} hint="سفارش ثبت‌شده" icon={ShoppingBag}/><MetricCard title="محصولات فعال" value={money(data.metrics.products)} hint="محصول قابل فروش" icon={Users}/><MetricCard title="موجودی کم" value={money(data.metrics.lowStock)} hint="نیازمند بررسی" icon={Package} danger/></div>
    <div className="dashboard-primary"><SalesTrend data={data.salesTrend}/><OrderStatusCard counts={data.statusCounts}/><div className="attention-panel"><h3>نیاز به توجه</h3><button><span className="attention-icon attention-icon--red"><ShoppingBag/></span><p><strong>{data.statusCounts.PENDING_PAYMENT + data.statusCounts.PARTIALLY_PAID} سفارش نیازمند بررسی</strong><small>نیاز به اقدام شما</small></p></button><button><span className="attention-icon"><Package/></span><p><strong>{data.metrics.lowStock} محصول با موجودی کم</strong><small>مدیریت موجودی</small></p></button><button><span className="attention-icon attention-icon--green"><Users/></span><p><strong>{data.statusCounts.PROCESSING} سفارش در حال آماده‌سازی</strong><small>پیگیری وضعیت</small></p></button></div></div>
    <div className="dashboard-secondary"><RecentOrders orders={data.orders}/><div className="side-products"><ProductPanels products={data.products}/></div></div>
    <div className="dashboard-footer-grid"><QuickAccess/><div className="simple-report"><h3>گزارش سریع</h3><dl><div><dt>تعداد کل سفارش‌ها</dt><dd>{money(Object.values(data.statusCounts).reduce((a,b)=>a+b,0))}</dd></div><div><dt>محصولات فعال</dt><dd>{money(data.metrics.products)}</dd></div><div><dt>سفارش‌های تکمیل‌شده</dt><dd>{money(data.statusCounts.COMPLETED)}</dd></div></dl></div></div>
  </div>;
}

function DashboardSkeleton(){return <div className="dashboard-skeleton">{Array.from({length:10},(_,i)=><i key={i}/>)}</div>}
