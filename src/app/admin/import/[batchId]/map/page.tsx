import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MappingForm } from "@/components/admin/import/mapping-form";
import { FIELD_DEFS, IMPORT_TYPE_LABELS, type ImportType } from "@/lib/import/field-defs";

export default async function MapImportPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const supabase = await createClient();

  const { data: batch } = await supabase.from("import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) notFound();

  const { data: sampleRow } = await supabase
    .from("import_rows")
    .select("raw")
    .eq("batch_id", batchId)
    .order("row_number")
    .limit(1)
    .maybeSingle();

  const headers = sampleRow ? Object.keys(sampleRow.raw as Record<string, string>) : [];
  const type = batch.type as ImportType;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Map Columns</h1>
        <p className="text-sm text-muted-foreground">
          {IMPORT_TYPE_LABELS[type]} — {batch.filename} ({batch.total_rows} rows)
        </p>
      </div>
      <MappingForm
        batchId={batchId}
        fields={FIELD_DEFS[type]}
        headers={headers}
        initialMapping={(batch.column_mapping as Record<string, string | null>) ?? {}}
      />
    </div>
  );
}
