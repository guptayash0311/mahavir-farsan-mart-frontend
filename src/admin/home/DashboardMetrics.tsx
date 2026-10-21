import { formatInr } from "../../shared/format";
import { Notice, Panel } from "../../shared/ui";
import { useLoad } from "../shell/load";

export function DashboardPage() {
  const view = useLoad<{
    open_inquiries: number;
    active_campaigns: number;
    outstanding_total: string;
    documents_expiring: number;
    published_products: number;
    vendors: number;
  }>("/api/v1/admin/dashboard");
  if (view.error) return <Notice kind="error" message={view.error} />;
  if (!view.data) return <Notice kind="loading" message="Loading dashboard…" />;
  const cards = [
    ["Open inquiries", String(view.data.open_inquiries)],
    ["Active campaigns", String(view.data.active_campaigns)],
    ["Outstanding", formatInr(view.data.outstanding_total)],
    ["Documents expiring", String(view.data.documents_expiring)],
    ["Published products", String(view.data.published_products)],
    ["Vendors", String(view.data.vendors)],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(([label, value]) => (
        <Panel key={label}>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </Panel>
      ))}
    </div>
  );
}
