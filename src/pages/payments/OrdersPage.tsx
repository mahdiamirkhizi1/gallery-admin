import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { getAdminOrders } from "./payments.api";
import "./payments.css";
import { orderStatusFa } from "./payment-labels";

export function OrdersPage() {
  const query = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
  });
  return (
    <div className="payment-review-page">
      <header>
        <div>
          <h2>همه سفارش‌ها</h2>
          <p>فهرست آخرین سفارش‌های فروشگاه</p>
        </div>
        <span>{(query.data?.length ?? 0).toLocaleString("fa-IR")} سفارش</span>
      </header>
      <section className="price-card price-table">
        <table>
          <thead>
            <tr>
              <th>شماره</th>
              <th>تاریخ</th>
              <th>تعداد اقلام</th>
              <th>مبلغ قابل پرداخت</th>
              <th>وضعیت</th>
              <th>جزئیات</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.map((order) => (
              <tr key={order.id}>
                <td>{order.id.toLocaleString("fa-IR")}</td>
                <td>{new Date(order.createdAt).toLocaleDateString("fa-IR")}</td>
                <td>{order.orderItems.length.toLocaleString("fa-IR")}</td>
                <td>
                  {Number(order.payableAmount).toLocaleString("fa-IR")} تومان
                </td>
                <td>
                  <span
                    className={`order-status-badge order-status-badge--${order.status.toLowerCase()}`}
                  >
                    {orderStatusFa[order.status] ?? "نامشخص"}
                  </span>
                </td>
                <td>
                  <Link
                    className="order-detail-link"
                    to={`/orders/${order.id}`}
                    aria-label={`مشاهده جزئیات سفارش ${order.id.toLocaleString("fa-IR")}`}
                    title="مشاهده جزئیات"
                  >
                    <Eye />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading ? <p>در حال دریافت…</p> : null}
      </section>
    </div>
  );
}
