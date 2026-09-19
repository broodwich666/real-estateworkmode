"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { enrichListingAction } from "@/app/actions";

export default function PlutoEnrichButton({ listingId }: { listingId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await enrichListingAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-2">
      <input type="hidden" name="id" value={listingId} />
      <button className="btn-primary" disabled={pending} type="submit">
        {pending ? "Enriching…" : "Enrich from PLUTO"}
      </button>
      {error ? (
        <p className="rounded-md border border-ink bg-white px-3 py-2 text-[13px] text-ink">{error}</p>
      ) : null}
    </form>
  );
}
