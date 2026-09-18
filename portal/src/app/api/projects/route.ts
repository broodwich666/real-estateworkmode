import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      fields?: string[];
    };
    const project = createProject({
      name: body.name ?? "",
      description: body.description,
      fields: body.fields,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
