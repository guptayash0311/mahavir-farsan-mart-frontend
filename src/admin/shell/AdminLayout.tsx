import { NavLink, Navigate, Outlet } from "react-router-dom";

import { useSession } from "../../shared/auth/session";

type Item = { to: string; label: string; permission: string; end?: boolean };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Content",
    items: [
      { to: "/admin/pages", label: "Pages", permission: "cms.manage" },
      { to: "/admin/campaigns", label: "Campaigns", permission: "campaign.manage" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/admin/products", label: "Products", permission: "product.update" },
      { to: "/admin/categories", label: "Categories", permission: "category.manage" },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/admin/inquiries", label: "Enquiries", permission: "inquiry.manage" },
      { to: "/admin/orders", label: "Orders", permission: "order.read" },
    ],
  },
  {
    label: "Stock",
    items: [{ to: "/admin/inventory", label: "Inventory", permission: "user.read" }],
  },
  {
    label: "Compliance",
    items: [{ to: "/admin/documents", label: "Documents", permission: "document.read" }],
  },
  {
    label: "Procurement",
    items: [
      { to: "/admin/partners", label: "Partners", permission: "vendor.read" },
      { to: "/admin/purchases", label: "Purchases", permission: "purchase.manage" },
      { to: "/admin/payments", label: "Payments", permission: "payment.read" },
    ],
  },
  {
    label: "Messages",
    items: [
      { to: "/admin/reminders", label: "Reminders", permission: "reminder.manage" },
      { to: "/admin/inbox", label: "Inbox", permission: "user.read" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/users", label: "Users", permission: "user.read" },
      { to: "/admin/audit", label: "Audit", permission: "audit.read" },
      { to: "/admin/settings", label: "Settings", permission: "settings.read" },
    ],
  },
];

export function AdminLayout() {
  const { user, loading, logout } = useSession();
  if (loading) {
    return <p className="bg-cream p-6 text-ink">Loading…</p>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => user.permissions.includes(item.permission)) }))
    .filter((group) => group.items.length > 0);
  if (visibleGroups.length === 0) {
    return <p className="bg-cream p-6 text-ink">You do not have access to the admin area.</p>;
  }
  return (
    <div className="min-h-screen bg-cream text-ink md:flex">
      <aside className="border-b border-marigold/60 bg-saffron-deep p-3 text-cream md:w-60 md:border-b-0 md:border-r">
        <NavLink to="/admin" end className="mb-3 block px-2 text-sm font-semibold text-marigold">
          Mahavir applications
        </NavLink>
        <div className="flex gap-4 overflow-x-auto md:flex-col md:gap-5">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-xs uppercase tracking-wide text-marigold">{group.label}</p>
              <div className="mt-1 flex gap-2 md:flex-col">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${isActive ? "bg-marigold text-ink" : "text-cream hover:bg-saffron"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 px-3 py-2 text-left text-sm text-cream/80" onClick={() => void logout()}>
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
