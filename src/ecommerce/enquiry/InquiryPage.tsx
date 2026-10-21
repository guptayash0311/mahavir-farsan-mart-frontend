import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../../shared/api/http";
import { Panel, buttonClass, inputClass, usePageMeta } from "../../shared/ui";

export function InquiryPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  usePageMeta("Inquiry · Mahavir Farsan Mart", "Ask about products or send an order request.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api("/api/v1/inquiries", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          from_cart: params.get("from") === "cart",
        }),
      });
      setMessage("Inquiry sent. We will confirm from the shop.");
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to send the inquiry");
    }
  }
  return (
    <Panel>
      <h1 className="text-2xl font-semibold">Inquiry</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input name="email" type="email" placeholder="Email" className={inputClass} />
        <textarea name="message" placeholder="Message" className={inputClass} />
        <button className={buttonClass}>Submit</button>
      </form>
      {message ? <p className="mt-3 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </Panel>
  );
}
