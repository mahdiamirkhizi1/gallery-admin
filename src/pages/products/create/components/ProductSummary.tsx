import { Gem, Package, Scale, UserRound } from "lucide-react";
import type { ProductDraft } from "../product-form.types";
export function ProductSummary({ draft }: { draft: ProductDraft }) {
  const stock = draft.variants.reduce((sum, item) => sum + item.stock, 0);
  const primary =
    draft.images.find((image) => image.isPrimary) ?? draft.images[0];
  return (
    <aside className="product-summary">
      <h3>خلاصه محصول</h3>
      <div className="summary-image">
        {primary ? <img src={primary.preview} /> : <Gem />}
      </div>
      <span className="primary-label">تصویر اصلی</span>
      <h4>{draft.title || "عنوان محصول"}</h4>
      <b>
        {draft.metal === "SILVER" ? "نقره" : "طلا"} —{" "}
        {draft.category === "JEWELRY"
          ? "جواهرات"
          : draft.category === "COIN"
            ? "سکه"
            : "شمش"}
      </b>
      <dl>
        {draft.category !== "COIN" && (
          <div>
            <dt>
              <Gem />
              عیار
            </dt>
            <dd>{draft.carat} عیار</dd>
          </div>
        )}
        <div>
          <dt>
            <Scale />
            وزن
          </dt>
          <dd>{draft.variants[0]?.weight || 0} گرم</dd>
        </div>
        <div>
          <dt>
            <UserRound />
            جنسیت
          </dt>
          <dd>
            {draft.gender === "WOMAN"
              ? "زنانه"
              : draft.gender === "MAN"
                ? "مردانه"
                : "عمومی"}
          </dd>
        </div>
        <div>
          <dt>
            <Package />
            موجودی کل
          </dt>
          <dd>{stock} عدد</dd>
        </div>
      </dl>
      <small>وضعیت</small>
      <span className="draft-badge">
        {draft.status === "PUBLISHED"
          ? "منتشرشده"
          : draft.status === "DRAFT"
            ? "پیش‌نویس"
            : "غیرفعال"}
      </span>
    </aside>
  );
}
