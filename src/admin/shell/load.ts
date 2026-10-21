import { useEffect, useState } from "react";

import { api } from "../../shared/api/http";

export function useLoad<T>(path: string) {
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
