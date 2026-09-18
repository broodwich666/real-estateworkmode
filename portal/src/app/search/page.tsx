"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { SearchHit } from "@/lib/types";

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [results, setResults] = useState<SearchHit[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    void (async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const body = (await response.json()) as { results?: SearchHit[]; error?: string };
      if (!response.ok) {
        setError(body.error || "Search failed.");
        return;
      }
      setError("");
      setResults(body.results ?? []);
    })();
  }, [query]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Global search</p>
      <h1 className="font-display text-4xl tracking-tight">
        {query ? `Results for “${query}”` : "Search every project"}
      </h1>
      <p className="mt-2 text-muted">
        Looks through record values and project names. Use the header box to run another query.
      </p>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {!query ? (
        <p className="mt-6 text-muted">Type a neighborhood, vendor, status, or any dumped field.</p>
      ) : results.length === 0 ? (
        <p className="mt-6 text-muted">No matching records.</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {results.map((hit) => (
            <Link
              key={hit.id}
              href={`/projects/${hit.project_id}`}
              className="rounded-3xl border border-line bg-card p-5 shadow-card hover:border-pine"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-clay">{hit.project_name}</p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(hit.data)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted">{key}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading search…</p>}>
      <SearchResults />
    </Suspense>
  );
}
