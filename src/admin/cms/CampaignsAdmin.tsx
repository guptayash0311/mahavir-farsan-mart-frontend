import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function CampaignsAdmin() {
  const view = useLoad<{ id: string; name: string; slug: string; status: string; active: boolean }[]>("/api/v1/campaigns");
  usePageMeta("Campaigns · Admin", "Festival campaigns.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const created = await api<{ id: string }>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? ""),
        start_at: new Date(String(data.get("start_at") ?? "")).toISOString(),
        end_at: new Date(String(data.get("end_at") ?? "")).toISOString(),
      }),
    });
    await api(`/api/v1/campaigns/${created.id}/publish`, { method: "POST" });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Campaigns</h1>
      <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-2">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="description" placeholder="Description" className={inputClass} />
        <input name="start_at" type="datetime-local" required className={inputClass} />
        <input name="end_at" type="datetime-local" required className={inputClass} />
        <button className={buttonClass}>Create and publish</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.name} · {row.status}{row.active ? " · active" : ""}</li>)}</ul>
    </div>
  );
}
