import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  CirclePower,
  Filter,
  FolderTree,
  Grid2X2,
  Info,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  XCircle,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "@/stores/toast.store";
import {
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategoryStatus,
} from "../categories.api";
import { CategoryEditModal } from "../edit/CategoryEditModal";
import type { Category } from "../categories.types";
import "./categories.css";
import "./categories-reference.css";
import "../edit/category-edit-modal.css";

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const productLabels = { JEWELRY: "جواهر", COIN: "سکه", BULLION: "شمش" };
const metalLabels = {
  GOLD: "طلا",
  SILVER: "نقره",
  COPPER: "مس",
  PLATINUM: "پلاتین",
  IMITATION: "بدلیجات",
};

export function CategoriesPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [metal, setMetal] = useState("");
  const [productType, setProductType] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories", page, search, status, metal, productType],
    queryFn: () => getCategories({ page, search, isActive: status, metal, productType }),
  });
  const toggle = useMutation({
    mutationFn: updateCategoryStatus,
    onSuccess: () => {
      toast.success("وضعیت دسته‌بندی تغییر کرد");
      client.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("تغییر وضعیت انجام نشد"),
  });
  const edit = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("دسته‌بندی ویرایش شد");
      setEditing(null);
      client.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("ویرایش انجام نشد", "نام یا اسلاگ تکراری است."),
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("دسته‌بندی حذف شد");
      setConfirm(null);
      client.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () =>
      toast.error(
        "حذف دسته‌بندی انجام نشد",
        "دسته‌بندی دارای محصول یا زیرمجموعه قابل حذف نیست.",
      ),
  });
  const items = data?.items ?? [];
  const pages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / 20));
  const related = items.reduce((sum, item) => sum + item._count.jewelries, 0);
  return (
    <div className="categories-page">
      <header className="category-heading">
        <div>
          <div className="breadcrumb">
            <span>محصولات</span>
            <span>‹</span>
            <span>دسته‌بندی‌ها</span>
          </div>
          <h2>دسته‌بندی‌های محصولات</h2>
          <p>دسته‌بندی‌ها را بر اساس نوع محصول و فلز مدیریت کنید.</p>
        </div>
        <Link to="/categories/new" className="button button--primary">
          <Plus />
          افزودن دسته‌بندی جدید
        </Link>
      </header>
      <div className="category-stats">
        <Stat
          Icon={Tag}
          tone="gold"
          label="کل دسته‌بندی‌ها"
          value={data?.totalCount ?? 0}
          note="در مجموعه همه نوع محصول"
        />
        <Stat
          Icon={CheckCircle2}
          tone="green"
          label="دسته‌بندی‌های فعال"
          value={items.filter((item) => item.isActive).length}
          note="در نتایج این صفحه"
        />
        <Stat
          Icon={XCircle}
          tone="red"
          label="دسته‌بندی‌های غیرفعال"
          value={items.filter((item) => !item.isActive).length}
          note="در نتایج این صفحه"
        />
        <Stat
          Icon={Grid2X2}
          tone="blue"
          label="محصولات مرتبط"
          value={related}
          note="در این دسته‌بندی‌ها"
        />
      </div>
      <div className="category-content">
        <aside className="category-guide">
          <section>
            <Info />
            <h3>راهنما</h3>
            <p>
              دسته‌بندی‌ها به شما کمک می‌کنند محصولات را ساختارمند کنید و پلن‌ها
              را دقیقاً روی گروه موردنظر اعمال کنید.
            </p>
          </section>
          <section>
            <h3>ساختار دسته‌بندی</h3>
            <div className="structure-level gold">
              نوع فلز<small>طلا، نقره، مس</small>
            </div>
            <span>↓</span>
            <div className="structure-level blue">
              نوع محصول<small>جواهر، سکه، شمش</small>
            </div>
            <span>↓</span>
            <div className="structure-level green">
              دسته‌بندی<small>انگشتر، النگو، تمام سکه و…</small>
            </div>
          </section>
          <section>
            <h3>نکات مهم</h3>
            <p>دسته‌بندی را قبل از افزودن محصول ایجاد کنید.</p>
            <p>دسته دارای محصول قابل حذف نیست.</p>
          </section>
        </aside>
        <main>
          <div className="category-filters">
            <label>
              <Search />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="جستجو در دسته‌بندی‌ها..."
              />
            </label>
            <select value={metal} onChange={(event) => { setMetal(event.target.value); setPage(1); }}>
              <option value="">همه فلزها</option>
              {Object.entries(metalLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={productType} onChange={(event) => { setProductType(event.target.value); setPage(1); }}>
              <option value="">همه انواع محصول</option>
              {Object.entries(productLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1); }}
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
            <button className="button button--secondary" onClick={() => { setSearch(""); setMetal(""); setProductType(""); setStatus(""); setPage(1); }}>
              <Filter />
              پاک‌کردن فیلترها
            </button>
          </div>
          <div className="category-table-card">
            {isLoading ? (
              <div className="list-state">در حال دریافت دسته‌بندی‌ها...</div>
            ) : isError ? (
              <div className="list-state list-state--error">
                دریافت دسته‌بندی‌ها ناموفق بود.
              </div>
            ) : (
              <div className="category-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>دسته‌بندی</th>
                      <th>اسلاگ</th>
                      <th>نوع محصول</th>
                      <th>نوع فلز</th>
                      <th>تعداد محصولات</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="category-name">
                            <i>
                              {item.image?.preview ? (
                                <img src={item.image.preview} alt="" />
                              ) : (
                                <FolderTree />
                              )}
                            </i>
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>
                          <code dir="ltr">{item.slug}</code>
                        </td>
                        <td>{productLabels[item.productType]}</td>
                        <td>
                          <span
                            className={`metal-dot metal-dot--${item.metal.toLowerCase()}`}
                          />
                          {metalLabels[item.metal]}
                        </td>
                        <td>
                          <span className="product-count">
                            {fa(item._count.jewelries)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              item.isActive
                                ? "category-state active"
                                : "category-state inactive"
                            }
                          >
                            {item.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td>
                          <div className="category-actions">
                            <button
                              title={
                                item.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"
                              }
                              onClick={() =>
                                toggle.mutate({
                                  id: item.id,
                                  isActive: !item.isActive,
                                })
                              }
                            >
                              <CirclePower />
                            </button>
                            <button
                              title="ویرایش نام و اسلاگ"
                              onClick={() => setEditing(item)}
                            >
                              <Pencil />
                            </button>
                            <button
                              disabled={item._count.jewelries > 0}
                              title={
                                item._count.jewelries
                                  ? "دسته‌بندی دارای محصول است"
                                  : "حذف"
                              }
                              onClick={() => setConfirm(item)}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <footer className="category-pagination">
              <span>
                نمایش {fa(items.length)} از {fa(data?.totalCount ?? 0)} مورد
              </span>
              <div>
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ‹
                </button>
                {Array.from({ length: pages }, (_, index) => index + 1)
                  .slice(0, 6)
                  .map((value) => (
                    <button
                      key={value}
                      className={page === value ? "current" : ""}
                      onClick={() => setPage(value)}
                    >
                      {fa(value)}
                    </button>
                  ))}
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  ›
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>
      <ConfirmModal
        open={Boolean(confirm)}
        title="حذف دسته‌بندی"
        description={`دسته‌بندی «${confirm?.name ?? ""}» برای همیشه حذف می‌شود.`}
        confirmLabel="حذف دسته‌بندی"
        tone="danger"
        loading={remove.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && remove.mutate(confirm.id)}
      />
      <CategoryEditModal
        category={editing}
        loading={edit.isPending}
        onClose={() => setEditing(null)}
        onSave={(payload) =>
          editing && edit.mutate({ id: editing.id, payload })
        }
      />
    </div>
  );
}

function Stat({
  Icon,
  tone,
  label,
  value,
  note,
}: {
  Icon: typeof Tag;
  tone: string;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <section className="category-stat">
      <i className={tone}>
        <Icon />
      </i>
      <div>
        <span>{label}</span>
        <strong>{fa(value)}</strong>
        <small>{note}</small>
      </div>
    </section>
  );
}
