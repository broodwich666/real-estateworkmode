"use client";

import { FormEvent, useState } from "react";

type Props = {
  projectId: number;
  onImported: () => Promise<void> | void;
};

export function CsvImport({ projectId, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/projects/${projectId}/import`, {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as { imported?: number; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Import failed.");
      }
      setMessage(`Imported ${payload.imported} row${payload.imported === 1 ? "" : "s"}.`);
      setFile(null);
      await onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-dashed border-line bg-card/70 p-4">
      <p className="text-sm font-medium">CSV import</p>
      <p className="mt-1 text-sm text-muted">
        First row becomes columns. Existing fields stay; new headers are added to this project.
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-4 py-2 text-sm text-card hover:bg-pine-dark disabled:opacity-60"
        >
          {pending ? "Importing…" : "Import CSV"}
        </button>
      </div>
      {file ? <p className="mt-2 text-sm text-muted">{file.name}</p> : null}
      {message ? <p className="mt-2 text-sm text-pine">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
