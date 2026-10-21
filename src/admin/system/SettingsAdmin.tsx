import { useState, type FormEvent } from "react";

import { api } from "../../shared/api/http";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function SettingsAdmin() {
  const view = useLoad<{ key: string; value: unknown }[]>("/api/v1/settings");
  const [error, setError] = useState("");
  usePageMeta("Settings · Admin", "System settings.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api(`/api/v1/settings/${String(data.get("key") ?? "")}`, { method: "PATCH", body: JSON.stringify({ value: String(data.get("value") ?? "") }) });
      view.reload();
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    }
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input name="key" required placeholder="Key" className={inputClass} />
        <input name="value" required placeholder="Value" className={inputClass} />
        <button className={buttonClass}>Save</button>
      </form>
      {error ? <Notice kind="error" message={error} /> : null}
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.key}>{row.key}: {JSON.stringify(row.value)}</li>)}</ul>
    </div>
  );
}
