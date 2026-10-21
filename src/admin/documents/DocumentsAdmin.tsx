import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function DocumentsAdmin() {
  const view = useLoad<{ id: string; title: string; visibility: string; expiry_date: string | null }[]>("/api/v1/documents");
  usePageMeta("Documents · Admin", "Upload licenses and certificates.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const created = await api<{ id: string }>("/api/v1/documents", { method: "POST", body: data });
    await api(`/api/v1/documents/${created.id}/publish`, { method: "POST" });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <form onSubmit={onSubmit} className="grid gap-2">
        <input name="title" required placeholder="Title" className={inputClass} />
        <input name="category" required placeholder="Category" className={inputClass} />
        <input name="expiry_date" type="date" className={inputClass} />
        <input name="file" type="file" required />
        <button className={buttonClass}>Upload and publish</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.title} · {row.visibility} · {row.expiry_date ?? "no expiry"}</li>)}</ul>
    </div>
  );
}
