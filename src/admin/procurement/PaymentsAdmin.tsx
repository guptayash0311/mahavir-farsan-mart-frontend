import { type FormEvent } from "react";

import { api } from "../../shared/api/http";
import { formatInr } from "../../shared/format";
import { Notice, buttonClass, inputClass, usePageMeta } from "../../shared/ui";
import { useLoad } from "../shell/load";

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
