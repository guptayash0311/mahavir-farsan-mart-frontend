import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function PartnersAdmin() {
  const view = useLoad<{ id: string; name: string; roles: string[] }[]>("/api/v1/business-partners");
  usePageMeta("Partners · Admin", "Vendors, manufacturers, and suppliers.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api("/api/v1/business-partners", { method: "POST", body: JSON.stringify({ name: String(data.get("name") ?? ""), roles: [String(data.get("role") ?? "vendor")] }) });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Partners</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input name="name" required className={inputClass} placeholder="Name" />
        <select name="role" className={inputClass}><option value="vendor">Vendor</option><option value="manufacturer">Manufacturer</option><option value="raw_material_supplier">Raw material supplier</option></select>
        <button className={buttonClass}>Add</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.name} · {row.roles.join(", ")}</li>)}</ul>
    </div>
  );
}
