import { NextResponse } from "next/server";
import { deleteProject, getProject, updateProject } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const project = getProject(Number(id));
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      fields?: string[];
    };
    const project = updateProject(Number(id), body);
    return NextResponse.json({ project });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    deleteProject(Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
