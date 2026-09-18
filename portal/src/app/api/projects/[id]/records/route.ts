import { NextResponse } from "next/server";
import { createRecord, getProject, listRecords } from "@/lib/db";
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
  return NextResponse.json({ records: listRecords(project.id) });
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { data?: Record<string, string> };
    const record = createRecord(Number(id), body.data ?? {});
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
