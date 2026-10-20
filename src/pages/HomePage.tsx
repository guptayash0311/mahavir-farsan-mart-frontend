import { useEffect, useState } from "react";

import { getHealth, type HealthResponse } from "../api/client";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; health: HealthResponse }
  | { kind: "error"; message: string };

export function HomePage() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((health) => {
        if (!cancelled) {
          setState({ kind: "ready", health });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unable to reach the API";
          setState({ kind: "error", message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium tracking-wide text-amber-800">Mahavir Farsan Mart</p>
        <h1 className="mt-2 text-3xl font-semibold">Platform status</h1>
        <p className="mt-2 text-stone-600">Customer site and admin will live in this app.</p>
        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          {state.kind === "loading" && <p>Checking the API…</p>}
          {state.kind === "error" && (
            <div>
              <p className="font-medium text-red-700">API unreachable</p>
              <p className="mt-2 text-sm text-stone-600">{state.message}</p>
            </div>
          )}
          {state.kind === "ready" && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Status</dt>
                <dd className="font-medium">{state.health.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Database</dt>
                <dd className="font-medium">{state.health.database}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Version</dt>
                <dd className="font-medium">{state.health.version}</dd>
              </div>
            </dl>
          )}
        </section>
      </div>
    </main>
  );
}
