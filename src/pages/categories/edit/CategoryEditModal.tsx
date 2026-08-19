import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "../categories.types";
export function CategoryEditModal({
  category,
  loading,
  onClose,
  onSave,
}: {
  category: Category | null;
  loading: boolean;
  onClose: () => void;
  onSave: (value: { name: string; slug: string }) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setErrors({});
  }, [category]);
  if (!category) return null;
  const submit = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "نام حداقل ۲ کاراکتر باشد.";
    if (!/^[a-z0-9-]{2,100}$/.test(slug))
      next.slug = "اسلاگ فقط حروف کوچک انگلیسی، عدد و خط تیره باشد.";
    setErrors(next);
    if (!Object.keys(next).length) onSave({ name: name.trim(), slug });
  };
  return (
    <div
      className="category-edit-backdrop"
      onMouseDown={() => !loading && onClose()}
    >
      <section
        className="category-edit-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="category-edit-close" onClick={onClose}>
          <X />
        </button>
        <h3>ویرایش دسته‌بندی</h3>
        <p>فقط نام و اسلاگ دسته‌بندی قابل تغییر است.</p>
        <label>
          <span>
            نام دسته‌بندی <b>*</b>
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name && <small>{errors.name}</small>}
        </label>
        <label>
          <span>
            اسلاگ <b>*</b>
          </span>
          <input
            dir="ltr"
            value={slug}
            onChange={(event) =>
              setSlug(
                event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              )
            }
            placeholder="gold-bangle"
          />
          {errors.slug && <small>{errors.slug}</small>}
        </label>
        <footer>
          <button
            className="button button--secondary"
            onClick={onClose}
            disabled={loading}
          >
            انصراف
          </button>
          <button
            className="button button--primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </footer>
      </section>
    </div>
  );
}
