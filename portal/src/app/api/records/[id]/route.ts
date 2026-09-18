import { NextResponse } from "next/server";
import { deleteRecord, updateRecord } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { data?: Record<string, string> };
    const record = updateRecord(Number(id), body.data ?? {});
    return NextResponse.json({ record });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    deleteRecord(Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
