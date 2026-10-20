import { useEffect, type ReactNode } from "react";

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, [title, description]);
}

export function Panel({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">{children}</section>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass = "w-full rounded-lg border border-stone-300 px-3 py-2";
export const buttonClass = "rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60";
export const quietButton = "rounded-lg border border-stone-300 px-3 py-2 text-sm";

export function Notice({ kind, message }: { kind: "loading" | "error" | "empty"; message: string }) {
  const color = kind === "error" ? "text-red-700" : "text-stone-600";
  return <p className={color}>{message}</p>;
}
