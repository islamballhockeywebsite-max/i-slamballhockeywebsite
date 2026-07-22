import { NextResponse, type NextRequest } from "next/server";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { guessMapping, type ImportType } from "@/lib/import/field-defs";

const VALID_TYPES: ImportType[] = ["players", "historical_skaters", "historical_goalies"];

/**
 * Upload is a route handler (not a Server Action) so CSV parsing can stream and avoid the
 * Server Action body-size ceiling, matching the plan's CSV import architecture.
 */
export async function POST(request: NextRequest) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("type");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof type !== "string" || !VALID_TYPES.includes(type as ImportType)) {
    return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const headers = parsed.meta.fields ?? [];

  if (headers.length === 0 || parsed.data.length === 0) {
    return NextResponse.json({ error: "CSV has no rows or headers" }, { status: 400 });
  }

  const mapping = guessMapping(headers, type as ImportType);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .insert({
      type: type as ImportType,
      filename: file.name,
      total_rows: parsed.data.length,
      column_mapping: mapping,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 });

  const rowInserts = parsed.data.map((raw, i) => ({
    batch_id: batch.id,
    row_number: i + 1,
    raw,
  }));

  const CHUNK = 500;
  for (let i = 0; i < rowInserts.length; i += CHUNK) {
    const { error } = await supabase.from("import_rows").insert(rowInserts.slice(i, i + CHUNK));
    if (error) {
      await supabase.from("import_batches").delete().eq("id", batch.id);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ batchId: batch.id, headers });
}
