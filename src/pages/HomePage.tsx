import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/http";
import type { HomePageData } from "../api/types";
import { SectionView } from "../components/sections";
import { Notice, usePageMeta } from "../components/ui";

export function HomePage() {
  const [state, setState] = useState<"loading" | "empty" | "error" | "ready">("loading");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState<HomePageData | null>(null);
  usePageMeta("Mahavir Farsan Mart", "Fresh farsan, sweets, and festival specials from Mahavir Farsan Mart.");

  useEffect(() => {
    let cancelled = false;
    api<HomePageData>("/api/v1/pages/home", { auth: false })
      .then((data) => {
        if (!cancelled) {
          setPage(data);
          setState("ready");
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const text = error instanceof Error ? error.message : "Unable to load the homepage";
        if (text.toLowerCase().includes("not found")) {
          setState("empty");
          return;
        }
        setMessage(text);
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return <Notice kind="loading" message="Loading the homepage…" />;
  }
  if (state === "error") {
    return <Notice kind="error" message={message} />;
  }
  if (state === "empty" || !page) {
    return <Notice kind="empty" message="The homepage has not been published yet." />;
  }
  return (
    <div className="space-y-10">
      {page.active_campaign ? (
        <Link to={`/campaigns/${page.active_campaign.slug}`} className="block rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Now on</p>
          <p className="text-xl font-semibold">{page.active_campaign.name}</p>
          <p className="text-stone-600">{page.active_campaign.description}</p>
        </Link>
      ) : null}
      {page.sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}
    </div>
  );
}
