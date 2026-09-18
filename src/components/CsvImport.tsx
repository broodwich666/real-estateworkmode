"use client";

import { useState } from "react";
import { importListingsAction } from "@/app/actions";

export default function CsvImport() {
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      const next = await importListingsAction(formData);
      setResult(next);
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="card space-y-4 p-5">
      <div>
        <label className="label" htmlFor="file">
          CSV file
        </label>
        <input id="file" name="file" type="file" accept=".csv,text/csv" className="field bg-white" required />
      </div>
      <p className="text-sm text-ink/60">
        Columns: source, external_id, address, neighborhood, beds, baths, price, status, url,
        pets_allowed, amenities, notes, pulled_at. Duplicate source + external_id rows update the existing
        listing.
      </p>
      <button className="btn-accent w-full" disabled={pending}>
        {pending ? "Importing…" : "Import listings"}
      </button>
      {result ? (
        <div className="rounded-xl bg-paper p-4 text-sm">
          <p className="font-semibold text-navy">
            Imported {result.created} new listing{result.created === 1 ? "" : "s"}
            {result.updated ? `, updated ${result.updated}` : ""}.
          </p>
          {result.errors.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-800">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
