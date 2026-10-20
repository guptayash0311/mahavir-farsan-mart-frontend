import { NavLink, Navigate, Outlet } from "react-router-dom";

import { useSession } from "../auth/session";

const items = [
  { to: "/admin", label: "Dashboard", permission: "user.read", end: true },
  { to: "/admin/products", label: "Products", permission: "product.update" },
  { to: "/admin/categories", label: "Categories", permission: "category.manage" },
  { to: "/admin/pages", label: "Pages", permission: "cms.manage" },
  { to: "/admin/campaigns", label: "Campaigns", permission: "campaign.manage" },
  { to: "/admin/documents", label: "Documents", permission: "document.read" },
  { to: "/admin/partners", label: "Partners", permission: "vendor.read" },
  { to: "/admin/purchases", label: "Purchases", permission: "purchase.manage" },
  { to: "/admin/payments", label: "Payments", permission: "payment.read" },
  { to: "/admin/reminders", label: "Reminders", permission: "reminder.manage" },
  { to: "/admin/users", label: "Users", permission: "user.read" },
  { to: "/admin/inquiries", label: "Inquiries", permission: "inquiry.manage" },
  { to: "/admin/audit", label: "Audit", permission: "audit.read" },
  { to: "/admin/settings", label: "Settings", permission: "settings.read" },
];

export function AdminLayout() {
  const { user, loading, logout } = useSession();
  if (loading) {
    return <p className="p-6">Loading…</p>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  const visible = items.filter((item) => user.permissions.includes(item.permission));
  if (visible.length === 0) {
    return <p className="p-6">You do not have access to the admin area.</p>;
  }
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 md:flex">
      <aside className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white p-3 md:w-56 md:flex-col md:border-b-0 md:border-r">
        <p className="hidden px-2 text-sm font-semibold text-amber-900 md:block">Admin</p>
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${isActive ? "bg-amber-800 text-white" : "text-stone-700"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button className="px-3 py-2 text-left text-sm text-stone-500" onClick={() => void logout()}>
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
