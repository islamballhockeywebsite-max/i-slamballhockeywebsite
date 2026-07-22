import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  await requireAdmin();
  const { batchId } = await params;
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("import_rows")
    .select("row_number, status, skip, dedupe_match_player_id, validation_errors")
    .eq("batch_id", batchId)
    .order("row_number");

  const header = ["row_number", "status", "skipped", "matched_player_id", "errors"];
  const lines = [header.join(",")];
  for (const r of rows ?? []) {
    lines.push(
      [
        csvEscape(r.row_number),
        csvEscape(r.status),
        csvEscape(r.skip),
        csvEscape(r.dedupe_match_player_id ?? ""),
        csvEscape(((r.validation_errors as string[] | null) ?? []).join("; ")),
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="import-report-${batchId}.csv"`,
    },
  });
}
