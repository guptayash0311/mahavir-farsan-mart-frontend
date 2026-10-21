import { useEffect, useState } from "react";

import { api } from "../../shared/api/http";
import { Notice, usePageMeta } from "../../shared/ui";

export function DocumentsPage() {
  const [rows, setRows] = useState<{ id: string; title: string; category: string; file_url: string | null }[] | null>(null);
  const [error, setError] = useState("");
  usePageMeta("Documents · Mahavir Farsan Mart", "Published licenses and certificates.");
  useEffect(() => {
    api<{ id: string; title: string; category: string; file_url: string | null }[]>("/api/v1/documents/public", { auth: false })
      .then(setRows)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load documents"));
  }, []);
  if (error) return <Notice kind="error" message={error} />;
  if (!rows) return <Notice kind="loading" message="Loading documents…" />;
  if (rows.length === 0) return <Notice kind="empty" message="No public documents yet." />;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="rounded-2xl border border-marigold/50 bg-white p-4">
          <p className="font-medium">{row.title}</p>
          <p className="text-sm text-ink/60">{row.category}</p>
          {row.file_url ? <a className="text-sm text-saffron-deep" href={`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${row.file_url}`}>Open</a> : null}
        </li>
      ))}
    </ul>
  );
}
