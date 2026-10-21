import { Link } from "react-router-dom";

import { Panel, usePageMeta } from "../../shared/ui";
import { DashboardPage } from "./DashboardMetrics";

const cards = [
  { title: "Customer storefront", detail: "The shop homepage customers see.", to: "/" },
  { title: "CMS", detail: "Pages, sections, and festival campaigns.", to: "/admin/pages" },
  { title: "Catalog", detail: "Products, categories, brands, and packs.", to: "/admin/products" },
  { title: "Commerce", detail: "Customer orders after an enquiry is accepted.", to: "/admin/orders" },
  { title: "Enquiry", detail: "Order requests from the shop and the counter.", to: "/admin/inquiries" },
  { title: "Documents", detail: "Licenses and certificates.", to: "/admin/documents" },
  { title: "Inventory", detail: "Stock ledger. Not built yet.", to: "/admin/inventory" },
  { title: "Procurement", detail: "Partners, purchases, and payments.", to: "/admin/partners" },
  { title: "Notifications", detail: "Reminders today. Inbox is not built yet.", to: "/admin/reminders" },
  { title: "System", detail: "Users, audit, and settings.", to: "/admin/users" },
];

export function ApplicationHome() {
  usePageMeta("Applications · Admin", "Mahavir Farsan Mart applications.");
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-saffron-deep">Mahavir Farsan Mart</p>
        <h1 className="text-3xl font-semibold">Applications</h1>
        <p className="mt-2 max-w-2xl text-ink/70">Each card opens one application. The customer homepage stays on the shop site.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} to={card.to} className="block">
            <Panel>
              <p className="text-lg font-semibold text-saffron-deep">{card.title}</p>
              <p className="mt-1 text-sm text-ink/70">{card.detail}</p>
            </Panel>
          </Link>
        ))}
      </div>
      <div>
        <h2 className="mb-3 text-xl font-semibold">Operations</h2>
        <DashboardPage />
      </div>
    </div>
  );
}
