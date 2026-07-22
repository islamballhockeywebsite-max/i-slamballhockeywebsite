import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ReviewRow } from "@/components/admin/import/review-row";
import { CommitButton } from "@/components/admin/import/commit-button";
import { IMPORT_TYPE_LABELS, type ImportType } from "@/lib/import/field-defs";

export default async function ReviewImportPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const supabase = await createClient();

  const { data: batch } = await supabase.from("import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) notFound();

  const { data: rows } = await supabase
    .from("import_rows")
    .select("*")
    .eq("batch_id", batchId)
    .order("row_number");

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name")
    .order("last_name");

  const type = batch.type as ImportType;
  const isHistorical = type !== "players";

  const validCount = rows?.filter((r) => r.status === "valid" && !r.skip).length ?? 0;
  const invalidCount = rows?.filter((r) => r.status === "invalid").length ?? 0;
  const skippedCount = rows?.filter((r) => r.skip).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Review Import</h1>
        <p className="text-sm text-muted-foreground">
          {IMPORT_TYPE_LABELS[type]} — {batch.filename}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="default">{validCount} ready to commit</Badge>
        <Badge variant="destructive">{invalidCount} invalid</Badge>
        <Badge variant="outline">{skippedCount} skipped</Badge>
      </div>

      <CommitButton batchId={batchId} disabled={batch.status === "committed" || validCount === 0} />

      <div className="space-y-2">
        {rows?.map((row) => (
          <ReviewRow
            key={row.id}
            row={row}
            batchId={batchId}
            needsPlayerResolve={isHistorical}
            players={players ?? []}
          />
        ))}
        {rows?.length === 0 && <p className="text-sm text-muted-foreground">No rows in this batch.</p>}
      </div>
    </div>
  );
}
