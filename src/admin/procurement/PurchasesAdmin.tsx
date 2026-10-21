import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import { formatInr } from "../../shared/format";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

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
