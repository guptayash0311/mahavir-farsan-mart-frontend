import type { PageResult } from "../../shared/api/types";
import { formatWhen } from "../../shared/format";
import { Notice, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function AuditAdmin() {
  const view = useLoad<PageResult<{ id: string; action: string; entity_type: string; created_at: string }>>("/api/v1/audit-logs");
  usePageMeta("Audit · Admin", "Sensitive changes.");
  if (view.error) return <Notice kind="error" message={view.error} />;
  if (!view.data) return <Notice kind="loading" message="Loading audit log…" />;
  if (view.data.items.length === 0) return <Notice kind="empty" message="No audit rows yet." />;
  return (
    <ul className="space-y-2">
      {view.data.items.map((row) => <li key={row.id}>{formatWhen(row.created_at)} · {row.action} · {row.entity_type}</li>)}
    </ul>
  );
}
