"use client";

import { FormEvent, useState } from "react";
import type { Project } from "@/lib/types";

type Props = {
  onCreated: (project: Project) => void;
};

export function CreateProjectForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          fields: fields
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean),
        }),
      });
      const body = (await response.json()) as { project?: Project; error?: string };
      if (!response.ok || !body.project) {
        throw new Error(body.error || "Could not create project.");
      }
      onCreated(body.project);
      setName("");
      setDescription("");
      setFields("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-card p-5 shadow-card">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">New project</p>
      <h2 className="mt-1 font-display text-2xl">Open another dump</h2>
      <div className="mt-4 grid gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          className="rounded-2xl border border-line bg-paper px-4 py-3 outline-none focus:border-pine"
          required
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What lives here?"
          rows={3}
          className="rounded-2xl border border-line bg-paper px-4 py-3 outline-none focus:border-pine"
        />
        <input
          value={fields}
          onChange={(event) => setFields(event.target.value)}
          placeholder="Optional columns, comma-separated"
          className="rounded-2xl border border-line bg-paper px-4 py-3 outline-none focus:border-pine"
        />
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-card hover:bg-pine-dark disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
