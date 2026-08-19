import { Download } from "lucide-react";
import type { Product } from "../products.types";
export function ProductsExcelExport({ products }: { products: Product[] }) {
  const download = () => {
    const rows = [
      ["شناسه", "نام محصول", "فلز", "دسته", "عیار", "موجودی", "وضعیت"],
      ...products.map((item) => [
        item.id,
        item.title,
        item.metal,
        item.category,
        item.carat,
        item.totalStock,
        item.status === "PUBLISHED" ? "منتشرشده" : item.status === "DRAFT" ? "پیش‌نویس" : "غیرفعال",
      ]),
    ];
    const csv =
      "\ufeff" +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `goldino-products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      className="button button--secondary"
      onClick={download}
      disabled={!products.length}
    >
      <Download />
      خروجی Excel
    </button>
  );
}
