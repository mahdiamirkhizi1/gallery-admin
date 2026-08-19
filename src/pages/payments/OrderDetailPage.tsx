import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Package, WalletCards } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getAdminOrder } from "./payments.api";
import {
  itemStatusFa,
  orderStatusFa,
  paymentMethodFa,
  paymentStatusFa,
  planTypeFa,
  shippingTypeFa,
} from "./payment-labels";
import "./payments.css";

const money = (value: string) =>
  `${Number(value).toLocaleString("fa-IR")} تومان`;
export function OrderDetailPage() {
  const id = Number(useParams().id);
  const query = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getAdminOrder(id),
    enabled: id > 0,
  });
  if (query.isLoading)
    return <p className="payment-empty">در حال دریافت جزئیات سفارش…</p>;
  if (!query.data) return <p className="payment-empty">سفارش پیدا نشد.</p>;
  const order = query.data;
  const address = order.addressSnapshot;
  return (
    <div className="order-detail-page">
      <header>
        <div>
          <Link to="/orders">
            <ArrowRight />
            بازگشت به سفارش‌ها
          </Link>
          <h2>جزئیات سفارش {order.id.toLocaleString("fa-IR")}</h2>
          <p>{new Date(order.createdAt).toLocaleString("fa-IR")}</p>
        </div>
        <span
          className={`order-status-badge order-status-badge--${order.status.toLowerCase()}`}
        >
          {orderStatusFa[order.status] ?? order.status}
        </span>
      </header>
      <section className="order-summary-strip">
        <div>
          <small>مبلغ کل</small>
          <strong>{money(order.totalAmount)}</strong>
        </div>
        <div>
          <small>مبلغ قابل پرداخت</small>
          <strong>{money(order.payableAmount)}</strong>
        </div>
        <div>
          <small>روش ارسال</small>
          <strong>
            {order.deliveryMethod.category ||
              shippingTypeFa[order.deliveryMethod.shippingType] ||
              "نامشخص"}
          </strong>
        </div>
      </section>
      <div className="order-detail-grid">
        <section className="order-detail-card order-items-card">
          <h3>
            <Package />
            اقلام سفارش
          </h3>
          {order.orderItems.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.product.title}</strong>
                <small>
                  {item.productVariant.weight} گرم ·{" "}
                  {item.quantity.toLocaleString("fa-IR")} عدد ·{" "}
                  {item.plan?.type
                    ? (planTypeFa[item.plan.type] ?? "نامشخص")
                    : "—"}
                </small>
              </div>
              <div>
                <b>
                  {money(
                    (
                      BigInt(item.priceAtTime) * BigInt(item.quantity)
                    ).toString(),
                  )}
                </b>
                <small>{itemStatusFa[item.status] ?? item.status}</small>
              </div>
            </article>
          ))}
        </section>
        <aside className="order-side-details">
          <section className="order-detail-card">
            <h3>
              <MapPin />
              نشانی تحویل
            </h3>
            {order.user ? (
              <p>
                <strong>{order.user.fullName || "کاربر فروشگاه"}</strong>
                <br />
                {order.user.mobile}
              </p>
            ) : null}
            <p>
              {address
                ? `${address.province ?? ""}، ${address.city ?? ""}، ${address.address ?? ""}`
                : "نشانی ثبت نشده"}
            </p>
            {address?.postalCode ? (
              <small>کد پستی: {address.postalCode}</small>
            ) : null}
          </section>
          <section className="order-detail-card">
            <h3>
              <WalletCards />
              پرداخت‌ها
            </h3>
            {order.payments?.map((payment) => (
              <article className="order-payment-row" key={payment.id}>
                <div>
                  <strong>
                    {paymentMethodFa[payment.method] ?? payment.method}
                  </strong>
                  <small>
                    {paymentStatusFa[payment.status] ?? payment.status}
                  </small>
                </div>
                <b>{money(payment.amount)}</b>
                {payment.receipt?.referenceCode ? (
                  <small>کد پیگیری: {payment.receipt.referenceCode}</small>
                ) : null}
              </article>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
