import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import type { Category } from "../../shared/api/types";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function CategoriesAdmin() {
  const view = useLoad<Category[]>("/api/v1/categories");
  usePageMeta("Categories · Admin", "Manage categories.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api("/api/v1/categories", { method: "POST", body: JSON.stringify({ name: String(data.get("name") ?? ""), parent_id: String(data.get("parent_id") ?? "") || null }) });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input name="name" required className={inputClass} placeholder="Name" />
        <select name="parent_id" className={inputClass}><option value="">No parent</option>{(view.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
        <button className={buttonClass}>Add</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {!view.data ? <Notice kind="loading" message="Loading…" /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.name}</li>)}</ul>
    </div>
  );
}
