import {
  ArrowRight,
  CalendarDays,
  Copy,
  Edit3,
  Gem,
  Image as ImageIcon,
  PackageCheck,
  Target,
  Trash2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlanTone } from "../components/PlanTone";
import { getProduct, productImage } from "../products.api";

type Tab = "specs" | "inventory" | "images" | "history" | "comments";
const productStatusView = {
  PUBLISHED: { label: "منتشرشده", className: "image-status image-status--active" },
  DRAFT: { label: "پیش‌نویس", className: "image-status image-status--draft" },
  INACTIVE: { label: "غیرفعال", className: "image-status image-status--inactive" },
} as const;
const fa = (value: number | string) =>
  new Intl.NumberFormat("fa-IR").format(Number(value));
const faDate = (value?: string) =>
  value ? new Intl.DateTimeFormat("fa-IR").format(new Date(value)) : "—";
const gender: Record<string, string> = {
  WOMAN: "زنانه",
  MAN: "مردانه",
  UNISEX: "مشترک",
  KID: "کودک",
  NONE: "بدون جنسیت",
};
const category: Record<string, string> = {
  JEWELRY: "جواهر",
  COIN: "سکه",
  BULLION: "شمش",
};
const metal: Record<string, string> = {
  GOLD: "طلا",
  SILVER: "نقره",
  COPPER: "مس",
  PLATINUM: "پلاتین",
  IMITATION: "بدلیجات",
};

export function ProductDetailPage() {
  const id = Number(useParams().id);
  const [tab, setTab] = useState<Tab>("specs");
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
  if (isLoading || !data)
    return <div className="list-state">در حال دریافت جزئیات...</div>;

  const images = data.medias?.images ?? [];
  const primary = productImage(data);
  const weight = data.variants[0]?.weight ?? 0;
  const sku = data.labels?.sku || `GLD-R-${data.id}`;
  const attr = data.jewelry?.attr ?? {};

  return (
    <div className="product-detail-screen">
      <div className="screen-heading">
        <div>
          <div className="breadcrumb">
            <Link to="/products">محصولات</Link>
            <span>‹</span>
            <span>جزئیات محصول</span>
          </div>
          <h2>جزئیات محصول</h2>
          <p>مشاهده اطلاعات کامل محصول</p>
        </div>
        <div className="screen-actions">
          <Link to="/products" className="button button--secondary">
            <ArrowRight />
            بازگشت
          </Link>
          <Link
            to={`/products/${id}/edit`}
            className="button button--secondary"
          >
            <Edit3 />
            ویرایش محصول
          </Link>
          <button
            className="button button--danger"
            disabled
            title="API حذف محصول هنوز تعریف نشده"
          >
            <Trash2 />
            حذف محصول
          </button>
        </div>
      </div>

      <div className="detail-hero-grid">
        <section className="product-overview-card">
          <div className="overview-gallery">
            <div className="overview-main-image">
              {primary ? <img src={primary} alt={data.title} /> : <Gem />}
              <span
                className={productStatusView[data.status].className}
              >
                {productStatusView[data.status].label}
              </span>
              <span className="image-corner">
                <ImageIcon />
              </span>
            </div>
            <div className="overview-thumbs">
              {images.slice(0, 4).map((image, index) => (
                <button key={image.url || image.preview || index}>
                  <img src={image.url || image.preview} alt="" />
                </button>
              ))}
              <button className="more-thumb">
                +{Math.max(images.length - 4, 0)}
              </button>
            </div>
          </div>
          <div className="overview-facts">
            <h2>{data.title}</h2>
            <p>
              کد محصول: <b>{sku}</b>
              <button
                className="copy-code"
                onClick={() => navigator.clipboard?.writeText(sku)}
              >
                <Copy />
              </button>
            </p>
            <dl>
              <div>
                <dt>دسته‌بندی:</dt>
                <dd>{category[data.category]}</dd>
              </div>
              <div>
                <dt>نوع محصول:</dt>
                <dd>
                  {data.jewelry?.jewelrySubType?.name ||
                    category[data.category]}
                </dd>
              </div>
              <div>
                <dt>نوع فلز:</dt>
                <dd>{metal[data.metal]}</dd>
              </div>
              <div>
                <dt>وزن:</dt>
                <dd>{fa(weight)} گرم</dd>
              </div>
              <div>
                <dt>عیار:</dt>
                <dd>{fa(data.carat)} عیار</dd>
              </div>
              <div>
                <dt>قیمت:</dt>
                <dd>براساس نرخ روز</dd>
              </div>
              <div>
                <dt>موجودی:</dt>
                <dd>{fa(data.totalStock)} عدد</dd>
              </div>
              <div>
                <dt>تاریخ ایجاد:</dt>
                <dd>{faDate(data.createdAt)}</dd>
              </div>
              <div>
                <dt>آخرین بروزرسانی:</dt>
                <dd>{faDate(data.updatedAt || data.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </section>
        <aside className="sales-stack">
          <section className="sales-summary-card">
            <h3>خلاصه فروش</h3>
            <dl>
              <div>
                <dt>تعداد فروش:</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>مجموع فروش:</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>میانگین قیمت فروش:</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>آخرین فروش:</dt>
                <dd>—</dd>
              </div>
            </dl>
          </section>
          <section className="active-plans-card">
            <h3>
              <Target />
              پلن‌های فعال
            </h3>
            <PlanTone plan={{ type: "NORMAL" }} />
            {data.productPlans
              .filter(
                (item) =>
                  !["NORMAL", "REGULAR", "DEFAULT"].includes(item.plan.type),
              )
              .map((item) => (
                <PlanTone key={item.plan.id} plan={item.plan} />
              ))}
          </section>
        </aside>
      </div>

      <section className="product-tabs-card">
        <nav>
          {(
            [
              ["specs", "مشخصات محصول"],
              ["inventory", "موجودی سایزها"],
              ["images", "تصاویر محصول"],
              ["history", "تاریخچه تغییرات"],
              ["comments", "نظرات (۰)"],
            ] as Array<[Tab, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              className={tab === value ? "active" : ""}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="tab-content">
          {tab === "specs" && (
            <div className="spec-tab">
              <div className="spec-description">
                <h3>توضیحات</h3>
                <p>
                  {data.description || "توضیحی برای این محصول ثبت نشده است."}
                </p>
              </div>
              <dl>
                <div>
                  <dt>جنسیت</dt>
                  <dd>{gender[data.gender] || "—"}</dd>
                </div>
                <div>
                  <dt>نوع نگین</dt>
                  <dd>{String(attr.gemType || "—")}</dd>
                </div>
                <div>
                  <dt>رنگ نگین</dt>
                  <dd>{String(attr.gemColor || "—")}</dd>
                </div>
                <div>
                  <dt>برند</dt>
                  <dd>{String(attr.brand || "—")}</dd>
                </div>
                <div>
                  <dt>رنگ‌بندی</dt>
                  <dd>{String(attr.color || "—")}</dd>
                </div>
                <div>
                  <dt>نوع قفل</dt>
                  <dd>{String(attr.lockType || "—")}</dd>
                </div>
              </dl>
            </div>
          )}
          {tab === "inventory" && (
            <div className="screen-table">
              <div>
                <b>وزن</b>
                <b>کد کالا</b>
                <b>موجودی</b>
                <b>وضعیت</b>
              </div>
              {data.variants.map((item) => (
                <div key={item.id}>
                  <span>{fa(item.weight)} گرم</span>
                  <span>{item.sku || "بدون SKU"}</span>
                  <strong>{fa(item.stock)} عدد</strong>
                  <i
                    className={
                      item.stock
                        ? "state-dot state-dot--green"
                        : "state-dot state-dot--red"
                    }
                  >
                    {item.stock ? "موجود" : "ناموجود"}
                  </i>
                </div>
              ))}
            </div>
          )}
          {tab === "images" && (
            <div className="tab-images">
              {images.map((image, index) => (
                <img
                  key={image.url || image.preview || index}
                  src={image.url || image.preview}
                  alt=""
                />
              ))}
            </div>
          )}
          {tab === "history" && (
            <p className="empty-copy">
              <CalendarDays /> تاریخچه‌ای برای نمایش وجود ندارد.
            </p>
          )}
          {tab === "comments" && (
            <p className="empty-copy">
              <PackageCheck /> نظری برای این محصول ثبت نشده است.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
