import { usePageMeta } from "../../shared/ui";

export function PlaceholderScreen({ title, detail }: { title: string; detail: string }) {
  usePageMeta(`${title} · Admin`, detail);
  return (
    <section className="rounded-2xl border border-dashed border-saffron bg-white p-6">
      <h1 className="text-2xl font-semibold text-saffron-deep">{title}</h1>
      <p className="mt-2 max-w-xl text-ink/80">{detail}</p>
    </section>
  );
}
