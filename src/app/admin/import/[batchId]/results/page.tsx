import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IMPORT_TYPE_LABELS, type ImportType } from "@/lib/import/field-defs";

export default async function ImportResultsPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const supabase = await createClient();

  const { data: batch } = await supabase.from("import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) notFound();

  const { data: rows } = await supabase.from("import_rows").select("status, skip").eq("batch_id", batchId);

  const committed = rows?.filter((r) => r.status === "committed").length ?? 0;
  const skipped = rows?.filter((r) => r.skip).length ?? 0;
  const invalid = rows?.filter((r) => r.status === "invalid").length ?? 0;

  const type = batch.type as ImportType;
  const targetHref = type === "players" ? "/admin/players" : "/admin/historical-stats";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Import Results</h1>
      <p className="text-sm text-muted-foreground">
        {IMPORT_TYPE_LABELS[type]} — {batch.filename}
      </p>

      <div className="flex items-center gap-2">
        <Badge variant={batch.status === "committed" ? "default" : "destructive"} className="capitalize">
          {batch.status}
        </Badge>
      </div>

      {batch.error_message && <p className="max-w-xl text-sm text-destructive">{batch.error_message}</p>}

      <div className="grid max-w-sm grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-heading text-2xl">{committed}</p>
          <p className="text-xs text-muted-foreground">Committed</p>
        </div>
        <div>
          <p className="font-heading text-2xl">{skipped}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </div>
        <div>
          <p className="font-heading text-2xl">{invalid}</p>
          <p className="text-xs text-muted-foreground">Invalid</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" nativeButton={false} render={<a href={`/api/import/${batchId}/report`} />}>
          <Download className="size-4" />
          Download Report
        </Button>
        <Button variant="create" nativeButton={false} render={<Link href={targetHref} />}>
          View {IMPORT_TYPE_LABELS[type]}
        </Button>
      </div>
    </div>
  );
}
