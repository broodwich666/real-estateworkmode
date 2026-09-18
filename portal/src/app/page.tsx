"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import type { Project } from "@/lib/types";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    const body = (await response.json()) as { projects?: Project[]; error?: string };
    if (!response.ok) {
      setError(body.error || "Could not load projects.");
      return;
    }
    setProjects(body.projects ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section>
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Projects</p>
          <h1 className="font-display text-4xl tracking-tight">Every dump in one place</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Real Estate is one project. Add others, keep columns flexible, and search across all of them.
          </p>
        </div>
        {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-3xl border border-line bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-pine"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-clay">
                {project.record_count} record{project.record_count === 1 ? "" : "s"}
              </p>
              <h2 className="mt-2 font-display text-2xl">{project.name}</h2>
              <p className="mt-2 text-sm text-muted">{project.description || "No description yet."}</p>
              {project.fields.length > 0 ? (
                <p className="mt-4 text-xs text-muted">{project.fields.slice(0, 4).join(" · ")}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
      <CreateProjectForm
        onCreated={(project) => {
          setProjects((current) => [...current, project]);
        }}
      />
    </div>
  );
}
