import {
  Copy,
  Edit3,
  Eye,
  Gem,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ProductsExcelExport } from "./components/ProductsExcelExport";
import {
  getPlanView,
  isNormalPlan,
  type PlanViewModel,
} from "./components/PlanTone";
import { getProducts, productImage } from "./products.api";
import type { ProductFilters } from "./products.types";
const metalLabel: Record<string, string> = {
  GOLD: "طلا",
  SILVER: "نقره",
  COPPER: "مس",
  PLATINUM: "پلاتین",
  IMITATION: "بدلیجات",
};
const categoryLabel: Record<string, string> = {
  JEWELRY: "جواهرات",
  COIN: "سکه",
  BULLION: "شمش",
};
function ProductPlanPills({
  plans,
}: {
  plans: Array<{ id: number } & PlanViewModel>;
}) {
  const sorted = [...plans]
    .sort((a, b) => Number(isNormalPlan(b.type)) - Number(isNormalPlan(a.type)))
    .slice(0, 3);
  return (
    <div className="plan-pills">
      {sorted.map((plan) => {
        const view = getPlanView(plan);
        return (
          <span
            key={plan.id}
            className={`plan-pill plan-pill--${view.tone}`}
            tabIndex={0}
            aria-label={view.title}
          >
            <view.Icon />
            <b className="plan-tooltip" role="tooltip">
              <strong>{view.title}</strong>
              <small>{view.detail}</small>
            </b>
          </span>
        );
      })}
    </div>
  );
}
const statusView = {
  PUBLISHED: { label: "منتشرشده", className: "active-badge" },
  DRAFT: { label: "پیش‌نویس", className: "draft-status-badge" },
  INACTIVE: { label: "غیرفعال", className: "inactive-badge" },
} as const;
export function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    metal: "",
    status: "",
    page: 1,
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
  const patch = (value: Partial<ProductFilters>) =>
    setFilters((state) => ({ ...state, ...value, page: value.page ?? 1 }));
  const pageCount = Math.max(1, Math.ceil((data?.totalCount ?? 0) / 10));
  const visiblePages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (page) => Math.abs(page - filters.page) <= 2,
  );
  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <div className="breadcrumb">
            <span>محصولات</span>
            <span>‹</span>
            <span>همه محصولات</span>
          </div>
          <h2>همه محصولات</h2>
          <p>لیست تمام محصولات فروشگاه</p>
        </div>
        <div>
          <ProductsExcelExport products={data?.items ?? []} />
          <Link to="/products/new" className="button button--primary">
            <Plus />
            افزودن محصول جدید
          </Link>
        </div>
      </div>
      <section className="products-box">
        <div className="product-filters">
          <label className="search">
            <Search />
            <input
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
              placeholder="جستجو بر اساس نام یا کد محصول..."
            />
          </label>
          <select
            value={filters.status}
            onChange={(e) => patch({ status: e.target.value })}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="PUBLISHED">منتشرشده</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="INACTIVE">غیرفعال</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => patch({ category: e.target.value })}
          >
            <option value="">همه دسته‌ها</option>
            <option value="JEWELRY">جواهرات</option>
            <option value="COIN">سکه</option>
            <option value="BULLION">شمش</option>
          </select>
          <select
            value={filters.metal}
            onChange={(e) => patch({ metal: e.target.value })}
          >
            <option value="">همه فلزها</option>
            <option value="GOLD">طلا</option>
            <option value="SILVER">نقره</option>
            <option value="COPPER">مس</option>
          </select>
          <button className="button button--secondary">
            <SlidersHorizontal />
            فیلترها
          </button>
        </div>
        {isLoading ? (
          <div className="list-state">در حال دریافت محصولات...</div>
        ) : isError ? (
          <div className="list-state list-state--error">
            دریافت محصولات ناموفق بود.
          </div>
        ) : (
          <>
            <div className="products-table-wrap">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>تصویر</th>
                    <th>نام محصول</th>
                    <th>کد محصول</th>
                    <th>فلز</th>
                    <th>دسته‌بندی</th>
                    <th>وزن</th>
                    <th>وضعیت</th>
                    <th>پلن‌ها</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <span className="table-image">
                          {productImage(product) ? (
                            <img
                              src={productImage(product)}
                              alt={product.title}
                            />
                          ) : (
                            <Gem />
                          )}
                        </span>
                      </td>
                      <td>
                        <strong className="product-name-cell">
                          {product.title}
                        </strong>
                      </td>
                      <td>GLD-{product.id}</td>
                      <td>
                        <i
                          className={`metal-dot metal-dot--${product.metal.toLowerCase()}`}
                        />
                        {metalLabel[product.metal]}
                      </td>
                      <td>{categoryLabel[product.category]}</td>
                      <td>{product.variants[0]?.weight ?? "—"}</td>
                      <td>
                        <span className={statusView[product.status].className}>
                          {statusView[product.status].label}
                        </span>
                      </td>
                      <td>
                        <ProductPlanPills
                          plans={product.productPlans.map((item) => item.plan)}
                        />
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link
                            to={`/products/${product.id}`}
                            aria-label="مشاهده"
                          >
                            <Eye />
                          </Link>
                          <Link
                            to={`/products/${product.id}/edit`}
                            aria-label="ویرایش"
                          >
                            <Edit3 />
                          </Link>
                          <button aria-label="کپی">
                            <Copy />
                          </button>
                          <button aria-label="بیشتر">
                            <MoreHorizontal />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                نمایش {data?.items.length ?? 0} از {data?.totalCount ?? 0} مورد
              </span>
              <div>
                <button
                  disabled={filters.page === 1}
                  onClick={() => patch({ page: filters.page - 1 })}
                >
                  ‹
                </button>
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    className={page === filters.page ? "current" : ""}
                    onClick={() => patch({ page })}
                  >
                    {new Intl.NumberFormat("fa-IR").format(page)}
                  </button>
                ))}
                <button
                  disabled={!data?.hasMore}
                  onClick={() => patch({ page: filters.page + 1 })}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
