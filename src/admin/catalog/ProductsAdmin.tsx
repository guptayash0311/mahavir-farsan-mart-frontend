import { useState, type FormEvent } from "react";

import { api } from "../../shared/api/http";
import type { Category, Named, PageResult, ProductCard } from "../../shared/api/types";
import { formatInr } from "../../shared/format";
import { Notice, Panel, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function ProductsAdmin() {
  const products = useLoad<PageResult<ProductCard>>("/api/v1/products?scope=manage");
  const categories = useLoad<Category[]>("/api/v1/categories");
  const brands = useLoad<Named[]>("/api/v1/brands");
  const manufacturers = useLoad<Named[]>("/api/v1/manufacturers");
  const [error, setError] = useState("");
  usePageMeta("Products · Admin", "Manage the catalog.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const categoryId = String(data.get("category_id") ?? "");
    try {
      const created = await api<{ id: string }>("/api/v1/products", {
        method: "POST",
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          sku: String(data.get("sku") ?? ""),
          price: String(data.get("price") ?? "0"),
          description: String(data.get("description") ?? ""),
          category_ids: categoryId ? [categoryId] : [],
          brand_id: String(data.get("brand_id") ?? "") || null,
          manufacturer_id: String(data.get("manufacturer_id") ?? "") || null,
        }),
      });
      const image = data.get("image");
      if (image instanceof File && image.size > 0) {
        const body = new FormData();
        body.append("file", image);
        await api(`/api/v1/products/${created.id}/media`, { method: "POST", body });
      }
      await api(`/api/v1/products/${created.id}/publish`, { method: "POST" });
      products.reload();
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to save the product");
    }
  }
  return (
    <div className="space-y-6">
      <Panel>
        <h1 className="text-2xl font-semibold">Products</h1>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Name" className={inputClass} />
          <input name="sku" required placeholder="SKU" className={inputClass} />
          <input name="price" required placeholder="Price" className={inputClass} />
          <input name="description" placeholder="Description" className={inputClass} />
          <select name="category_id" className={inputClass}><option value="">Category</option>{(categories.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <select name="brand_id" className={inputClass}><option value="">Brand</option>{(brands.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <select name="manufacturer_id" className={inputClass}><option value="">Manufacturer</option>{(manufacturers.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <button className={buttonClass}>Create and publish</button>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
        </form>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </Panel>
      {products.error ? <Notice kind="error" message={products.error} /> : null}
      {!products.data ? <Notice kind="loading" message="Loading products…" /> : null}
      <ul className="space-y-2">
        {(products.data?.items ?? []).map((row) => (
          <li key={row.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span>{row.name} · {formatInr(row.price)} · {row.status}</span>
            <button className="text-sm text-stone-600" onClick={() => void api(`/api/v1/products/${row.id}/archive`, { method: "POST" }).then(products.reload)}>Archive</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
