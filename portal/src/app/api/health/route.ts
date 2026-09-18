import { NextResponse } from "next/server";
import { listProjects } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const projects = listProjects();
  return NextResponse.json({
    ok: true,
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      record_count: project.record_count,
    })),
  });
}
