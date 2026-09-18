import { NextResponse } from "next/server";
import { importCsv } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }
    const text = await file.text();
    const result = importCsv(Number(id), text);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
