import { api } from "../../shared/api/http";
import type { PageResult } from "../../shared/api/types";
import { Notice, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function UsersAdmin() {
  const view = useLoad<PageResult<{ id: string; email: string; is_active: boolean; roles: string[] }>>("/api/v1/users");
  usePageMeta("Users · Admin", "Customer and staff accounts.");
  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {!view.data ? <Notice kind="loading" message="Loading users…" /> : null}
      <ul className="mt-4 space-y-2">
        {(view.data?.items ?? []).map((row) => (
          <li key={row.id} className="flex justify-between rounded-xl bg-white px-4 py-3">
            <span>{row.email} · {row.roles.join(", ")} · {row.is_active ? "active" : "inactive"}</span>
            {row.is_active ? <button onClick={() => void api(`/api/v1/users/${row.id}/deactivate`, { method: "POST" }).then(view.reload)}>Deactivate</button> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
