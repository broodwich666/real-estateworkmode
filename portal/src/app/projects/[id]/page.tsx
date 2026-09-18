"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CsvImport } from "@/components/CsvImport";
import { RecordForm } from "@/components/RecordForm";
import { RecordTable } from "@/components/RecordTable";
import type { Project, RecordRow } from "@/lib/types";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Number(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [editing, setEditing] = useState<RecordRow | null | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [projectRes, recordsRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`, { cache: "no-store" }),
      fetch(`/api/projects/${projectId}/records`, { cache: "no-store" }),
    ]);
    const projectBody = (await projectRes.json()) as { project?: Project; error?: string };
    const recordsBody = (await recordsRes.json()) as { records?: RecordRow[]; error?: string };
    if (!projectRes.ok || !projectBody.project) {
      setError(projectBody.error || "Project not found.");
      setProject(null);
      return;
    }
    setError("");
    setProject(projectBody.project);
    setRecords(recordsBody.records ?? []);
  }, [projectId]);

  useEffect(() => {
    if (Number.isFinite(projectId)) {
      void load();
    }
  }, [load, projectId]);

  async function saveRecord(data: Record<string, string>) {
    setPending(true);
    try {
      const isEdit = Boolean(editing);
      const url = isEdit ? `/api/records/${editing?.id}` : `/api/projects/${projectId}/records`;
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Could not save record.");
      }
      setEditing(undefined);
      await load();
    } finally {
      setPending(false);
    }
  }

  async function deleteRecord(record: RecordRow) {
    if (!window.confirm("Delete this record?")) return;
    const response = await fetch(`/api/records/${record.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "Could not delete record.");
      return;
    }
    await load();
  }

  async function deleteProject() {
    if (!project) return;
    if (!window.confirm(`Delete project “${project.name}” and all of its records?`)) return;
    const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "Could not delete project.");
      return;
    }
    router.push("/");
  }

  if (error && !project) {
    return (
      <div className="rounded-3xl border border-line bg-card p-6">
        <p className="text-red-700">{error}</p>
        <Link href="/" className="mt-3 inline-block text-sm text-pine hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return <p className="text-muted">Loading project…</p>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-pine hover:underline">
            ← Projects
          </Link>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-muted">{project.description}</p>
          <p className="mt-2 text-sm text-muted">
            {project.record_count} record{project.record_count === 1 ? "" : "s"}
            {project.fields.length > 0 ? ` · ${project.fields.join(" · ")}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(null)}
            className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-card hover:bg-pine-dark"
          >
            Add record
          </button>
          <button
            onClick={() => void deleteProject()}
            className="rounded-full border border-line px-4 py-2 text-sm text-red-700 hover:border-red-300"
          >
            Delete project
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <CsvImport projectId={project.id} onImported={load} />
      <RecordTable fields={project.fields} records={records} onEdit={setEditing} onDelete={deleteRecord} />

      {editing !== undefined ? (
        <RecordForm
          fields={project.fields}
          record={editing}
          pending={pending}
          onClose={() => setEditing(undefined)}
          onSave={saveRecord}
        />
      ) : null}
    </div>
  );
}
