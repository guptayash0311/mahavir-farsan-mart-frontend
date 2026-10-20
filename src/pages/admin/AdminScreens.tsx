import { useEffect, useState, type FormEvent } from "react";

import { api } from "../../api/http";
import type { Category, HomePageData, Named, PageResult, ProductCard } from "../../api/types";
import { Notice, Panel, buttonClass, inputClass, usePageMeta } from "../../components/ui";
import { formatInr, formatWhen } from "../../lib/format";

function useLoad<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api<T>(path)
      .then((body) => {
        if (!cancelled) setData(body);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load");
      });
    return () => {
      cancelled = true;
    };
  }, [path, tick]);
  return { data, error, reload: () => setTick((value) => value + 1) };
}

export function DashboardPage() {
  const view = useLoad<{
    open_inquiries: number;
    active_campaigns: number;
    outstanding_total: string;
    documents_expiring: number;
    published_products: number;
    vendors: number;
  }>("/api/v1/admin/dashboard");
  usePageMeta("Dashboard · Admin", "Shop operations.");
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

export function ProductsAdmin() {
  const products = useLoad<PageResult<ProductCard>>("/api/v1/products?scope=manage");
  const categories = useLoad<Category[]>("/api/v1/categories");
  const brands = useLoad<Named[]>("/api/v1/brands");
  const manufacturers = useLoad<Named[]>("/api/v1/manufacturers");
  const [error, setError] = useState("");
  usePageMeta("Products · Admin", "Manage the catalog.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const categoryId = String(data.get("category_id") ?? "");
    try {
      const created = await api<{ id: string }>("/api/v1/products", {
        method: "POST",
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          sku: String(data.get("sku") ?? ""),
          price: String(data.get("price") ?? "0"),
          description: String(data.get("description") ?? ""),
          category_ids: categoryId ? [categoryId] : [],
          brand_id: String(data.get("brand_id") ?? "") || null,
          manufacturer_id: String(data.get("manufacturer_id") ?? "") || null,
        }),
      });
      const image = data.get("image");
      if (image instanceof File && image.size > 0) {
        const body = new FormData();
        body.append("file", image);
        await api(`/api/v1/products/${created.id}/media`, { method: "POST", body });
      }
      await api(`/api/v1/products/${created.id}/publish`, { method: "POST" });
      products.reload();
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to save the product");
    }
  }
  return (
    <div className="space-y-6">
      <Panel>
        <h1 className="text-2xl font-semibold">Products</h1>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Name" className={inputClass} />
          <input name="sku" required placeholder="SKU" className={inputClass} />
          <input name="price" required placeholder="Price" className={inputClass} />
          <input name="description" placeholder="Description" className={inputClass} />
          <select name="category_id" className={inputClass}><option value="">Category</option>{(categories.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <select name="brand_id" className={inputClass}><option value="">Brand</option>{(brands.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <select name="manufacturer_id" className={inputClass}><option value="">Manufacturer</option>{(manufacturers.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <button className={buttonClass}>Create and publish</button>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
        </form>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </Panel>
      {products.error ? <Notice kind="error" message={products.error} /> : null}
      {!products.data ? <Notice kind="loading" message="Loading products…" /> : null}
      <ul className="space-y-2">
        {(products.data?.items ?? []).map((row) => (
          <li key={row.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span>{row.name} · {formatInr(row.price)} · {row.status}</span>
            <button className="text-sm text-stone-600" onClick={() => void api(`/api/v1/products/${row.id}/archive`, { method: "POST" }).then(products.reload)}>Archive</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoriesAdmin() {
  const view = useLoad<Category[]>("/api/v1/categories");
  usePageMeta("Categories · Admin", "Manage categories.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api("/api/v1/categories", { method: "POST", body: JSON.stringify({ name: String(data.get("name") ?? ""), parent_id: String(data.get("parent_id") ?? "") || null }) });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input name="name" required className={inputClass} placeholder="Name" />
        <select name="parent_id" className={inputClass}><option value="">No parent</option>{(view.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
        <button className={buttonClass}>Add</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {!view.data ? <Notice kind="loading" message="Loading…" /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.name}</li>)}</ul>
    </div>
  );
}

export function PagesAdmin() {
  const view = useLoad<HomePageData[]>("/api/v1/admin/pages");
  usePageMeta("Pages · Admin", "Homepage sections.");
  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const page = await api<{ id: string }>("/api/v1/admin/pages", { method: "POST", body: JSON.stringify({ title: String(data.get("title") ?? ""), slug: String(data.get("slug") ?? "") || null }) });
    await api("/api/v1/admin/page-sections", { method: "POST", body: JSON.stringify({ page_id: page.id, type: String(data.get("type") ?? "hero"), title: String(data.get("section_title") ?? ""), subtitle: String(data.get("subtitle") ?? ""), sort_order: 1 }) });
    await api(`/api/v1/admin/pages/${page.id}/publish`, { method: "POST" });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pages</h1>
      <form onSubmit={createPage} className="grid gap-2 md:grid-cols-2">
        <input name="title" required placeholder="Page title" className={inputClass} />
        <input name="slug" placeholder="Slug, use home for the homepage" className={inputClass} />
        <input name="section_title" placeholder="Section title" className={inputClass} />
        <input name="subtitle" placeholder="Subtitle" className={inputClass} />
        <select name="type" className={inputClass}>
          {["hero", "banner", "product_grid", "category_grid", "rich_text", "image_text", "announcement", "campaign_highlight", "contact_cta"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <button className={buttonClass}>Create and publish</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {(view.data ?? []).map((page) => (
        <Panel key={page.id}>
          <p className="font-medium">{page.title} · {page.status}</p>
          <p className="text-sm text-stone-500">{page.sections.length} sections</p>
        </Panel>
      ))}
    </div>
  );
}

export function CampaignsAdmin() {
  const view = useLoad<{ id: string; name: string; slug: string; status: string; active: boolean }[]>("/api/v1/campaigns");
  usePageMeta("Campaigns · Admin", "Festival campaigns.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const created = await api<{ id: string }>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? ""),
        start_at: new Date(String(data.get("start_at") ?? "")).toISOString(),
        end_at: new Date(String(data.get("end_at") ?? "")).toISOString(),
      }),
    });
    await api(`/api/v1/campaigns/${created.id}/publish`, { method: "POST" });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Campaigns</h1>
      <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-2">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="description" placeholder="Description" className={inputClass} />
        <input name="start_at" type="datetime-local" required className={inputClass} />
        <input name="end_at" type="datetime-local" required className={inputClass} />
        <button className={buttonClass}>Create and publish</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.name} · {row.status}{row.active ? " · active" : ""}</li>)}</ul>
    </div>
  );
}

export function DocumentsAdmin() {
  const view = useLoad<{ id: string; title: string; visibility: string; expiry_date: string | null }[]>("/api/v1/documents");
  usePageMeta("Documents · Admin", "Upload licenses and certificates.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const created = await api<{ id: string }>("/api/v1/documents", { method: "POST", body: data });
    await api(`/api/v1/documents/${created.id}/publish`, { method: "POST" });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <form onSubmit={onSubmit} className="grid gap-2">
        <input name="title" required placeholder="Title" className={inputClass} />
        <input name="category" required placeholder="Category" className={inputClass} />
        <input name="expiry_date" type="date" className={inputClass} />
        <input name="file" type="file" required />
        <button className={buttonClass}>Upload and publish</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.title} · {row.visibility} · {row.expiry_date ?? "no expiry"}</li>)}</ul>
    </div>
  );
}

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

export function PurchasesAdmin() {
  const partners = useLoad<{ id: string; name: string }[]>("/api/v1/business-partners");
  const purchases = useLoad<{ id: string; partner_name: string; invoices: { invoice_number: string; outstanding: string }[] }[]>("/api/v1/purchases");
  usePageMeta("Purchases · Admin", "Purchases and invoices.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const purchase = await api<{ id: string }>("/api/v1/purchases", {
      method: "POST",
      body: JSON.stringify({
        partner_id: String(data.get("partner_id") ?? ""),
        purchased_on: String(data.get("purchased_on") ?? ""),
        items: [{ description: String(data.get("description") ?? ""), amount: String(data.get("amount") ?? "0") }],
      }),
    });
    await api(`/api/v1/purchases/${purchase.id}/invoices`, {
      method: "POST",
      body: JSON.stringify({ invoice_number: String(data.get("invoice_number") ?? ""), amount: String(data.get("amount") ?? "0"), due_date: String(data.get("due_date") ?? "") }),
    });
    purchases.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Purchases</h1>
      <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-2">
        <select name="partner_id" className={inputClass}>{(partners.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
        <input name="purchased_on" type="date" required className={inputClass} />
        <input name="description" required placeholder="Line description" className={inputClass} />
        <input name="amount" required placeholder="Amount" className={inputClass} />
        <input name="invoice_number" required placeholder="Invoice number" className={inputClass} />
        <input name="due_date" type="date" required className={inputClass} />
        <button className={buttonClass}>Record</button>
      </form>
      {purchases.error ? <Notice kind="error" message={purchases.error} /> : null}
      <ul>{(purchases.data ?? []).map((row) => <li key={row.id}>{row.partner_name} · {(row.invoices ?? []).map((invoice) => `${invoice.invoice_number} due ${formatInr(invoice.outstanding)}`).join(", ")}</li>)}</ul>
    </div>
  );
}

export function PaymentsAdmin() {
  const view = useLoad<{ id: string; invoice_number: string | null; amount: string; outstanding: string; paid_on: string }[]>("/api/v1/payments");
  usePageMeta("Payments · Admin", "Vendor payments and outstanding balances.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api("/api/v1/payments", {
      method: "POST",
      body: JSON.stringify({
        invoice_id: String(data.get("invoice_id") ?? ""),
        amount: String(data.get("amount") ?? ""),
        paid_on: String(data.get("paid_on") ?? ""),
        method: String(data.get("method") ?? ""),
      }),
    });
    view.reload();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-2">
        <input name="invoice_id" required placeholder="Invoice id" className={inputClass} />
        <input name="amount" required placeholder="Amount" className={inputClass} />
        <input name="paid_on" type="date" required className={inputClass} />
        <input name="method" placeholder="Method" className={inputClass} />
        <button className={buttonClass}>Record payment</button>
      </form>
      {view.error ? <Notice kind="error" message={view.error} /> : null}
      {!view.data ? <Notice kind="loading" message="Loading payments…" /> : null}
      {(view.data ?? []).length === 0 ? <Notice kind="empty" message="No payments yet." /> : null}
      <ul>{(view.data ?? []).map((row) => <li key={row.id}>{row.invoice_number} · {formatInr(row.amount)} · outstanding {formatInr(row.outstanding)} · {row.paid_on}</li>)}</ul>
    </div>
  );
}

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
