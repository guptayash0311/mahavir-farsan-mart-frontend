import { api } from "../../shared/api/http";
import type { PageResult } from "../../shared/api/types";
import { formatWhen } from "../../shared/format";
import { Notice, buttonClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function RemindersAdmin() {
  const view = useLoad<PageResult<{ id: string; entity_type: string; status: string; generated_at: string }>>("/api/v1/reminders");
  usePageMeta("Reminders · Admin", "Payment and document reminders.");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reminders</h1>
      <button className={buttonClass} onClick={() => void api("/api/v1/reminders/run", { method: "POST" }).then(view.reload)}>Run now</button>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {!view.data ? <Notice kind="loading" message="Loading reminders…" /> : null}
      {(view.data?.items ?? []).length === 0 && view.data ? <Notice kind="empty" message="No reminders yet." /> : null}
      <ul className="space-y-2">
        {(view.data?.items ?? []).map((row) => (
          <li key={row.id} className="flex justify-between rounded-xl bg-white px-4 py-3">
            <span>{row.entity_type} · {row.status} · {formatWhen(row.generated_at)}</span>
            {row.status === "open" ? <button onClick={() => void api(`/api/v1/reminders/${row.id}/acknowledge`, { method: "POST" }).then(view.reload)}>Acknowledge</button> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
