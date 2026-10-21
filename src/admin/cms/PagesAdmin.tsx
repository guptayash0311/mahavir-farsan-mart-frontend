import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import type { HomePageData } from "../../shared/api/types";
import { Notice, Panel, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function PagesAdmin() {
  const view = useLoad<HomePageData[]>("/api/v1/admin/pages");
  usePageMeta("Pages · Admin", "Homepage sections.");
  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const page = await api<{ id: string }>("/api/v1/admin/pages", { method: "POST", body: JSON.stringify({ title: String(data.get("title") ?? ""), slug: String(data.get("slug") ?? "") || null }) });
    await api("/api/v1/admin/page-sections", { method: "POST", body: JSON.stringify({ page_id: page.id, type: String(data.get("type") ?? "hero"), title: String(data.get("section_title") ?? ""), subtitle: String(data.get("subtitle") ?? ""), sort_order: 1 }) });
    await api(`/api/v1/admin/pages/${page.id}/publish`, { method: "POST" });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pages</h1>
      <form onSubmit={createPage} className="grid gap-2 md:grid-cols-2">
        <input name="title" required placeholder="Page title" className={inputClass} />
        <input name="slug" placeholder="Slug, use home for the homepage" className={inputClass} />
        <input name="section_title" placeholder="Section title" className={inputClass} />
        <input name="subtitle" placeholder="Subtitle" className={inputClass} />
        <select name="type" className={inputClass}>
          {["hero", "banner", "product_grid", "category_grid", "rich_text", "image_text", "announcement", "campaign_highlight", "contact_cta"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <button className={buttonClass}>Create and publish</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {(view.data ?? []).map((page) => (
        <Panel key={page.id}>
          <p className="font-medium">{page.title} · {page.status}</p>
          <p className="text-sm text-stone-500">{page.sections.length} sections</p>
        </Panel>
      ))}
    </div>
  );
}
