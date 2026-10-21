import { api } from "../../shared/api/http";
import { Panel, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function InquiriesAdmin() {
  const view = useLoad<{ id: string; name: string; status: string; message: string }[]>("/api/v1/inquiries");
  usePageMeta("Inquiries · Admin", "Order requests.");
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Inquiries</h1>
      {(view.data ?? []).map((row) => (
        <Panel key={row.id}>
          <p className="font-medium">{row.name} · {row.status}</p>
          <p className="text-sm text-stone-600">{row.message}</p>
          <button className="mt-2 text-sm" onClick={() => void api(`/api/v1/inquiries/${row.id}/order`, { method: "POST" }).then(view.reload)}>Create order</button>
        </Panel>
      ))}
    </div>
  );
}
