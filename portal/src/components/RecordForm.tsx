"use client";

import { FormEvent, useEffect, useState } from "react";
import type { RecordRow } from "@/lib/types";

type Props = {
  fields: string[];
  record?: RecordRow | null;
  pending: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
};

export function RecordForm({ fields, record, pending, onClose, onSave }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [extraField, setExtraField] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      next[field] = record?.data[field] ?? "";
    }
    if (record) {
      for (const [key, value] of Object.entries(record.data)) {
        if (!(key in next)) next[key] = value;
      }
    }
    setValues(next);
    setExtraField("");
    setError("");
  }, [fields, record]);

  const visibleFields = Object.keys(values);

  function addField() {
    const name = extraField.trim();
    if (!name || name in values) return;
    setValues((current) => ({ ...current, [name]: "" }));
    setExtraField("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record.");
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-end bg-ink/40 p-3 sm:items-center sm:p-6">
      <form
        onSubmit={onSubmit}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-auto rounded-3xl border border-line bg-card p-5 shadow-card"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {record ? "Edit record" : "Add record"}
            </p>
            <h2 className="font-display text-2xl">{record ? "Update row" : "New row"}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink">
            Close
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {visibleFields.length === 0 ? (
            <p className="text-sm text-muted">Add a column below, then fill in the row.</p>
          ) : null}
          {visibleFields.map((field) => (
            <label key={field} className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.14em] text-muted">{field}</span>
              <textarea
                value={values[field] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field]: event.target.value }))
                }
                rows={field.toLowerCase().includes("note") ? 3 : 2}
                className="rounded-2xl border border-line bg-paper px-4 py-3 outline-none focus:border-pine"
              />
            </label>
          ))}
          <div className="flex gap-2">
            <input
              value={extraField}
              onChange={(event) => setExtraField(event.target.value)}
              placeholder="Add a column"
              className="flex-1 rounded-2xl border border-line bg-paper px-4 py-3 outline-none focus:border-pine"
            />
            <button
              type="button"
              onClick={addField}
              className="rounded-2xl border border-line px-4 py-3 text-sm hover:border-pine"
            >
              Add
            </button>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-pine px-5 py-2 text-sm font-medium text-card hover:bg-pine-dark disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save record"}
          </button>
        </div>
      </form>
    </div>
  );
}
