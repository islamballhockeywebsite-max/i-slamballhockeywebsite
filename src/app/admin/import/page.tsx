import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UploadForm } from "@/components/admin/import/upload-form";
import { IMPORT_TYPE_LABELS, type ImportType } from "@/lib/import/field-defs";

const TYPES: ImportType[] = ["players", "historical_skaters", "historical_goalies"];

const STATUS_STEP: Record<string, string> = {
  uploaded: "map",
  mapped: "review",
  reviewed: "review",
  committed: "results",
  failed: "review",
};

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: typeParam } = await searchParams;
  const type: ImportType = TYPES.includes(typeParam as ImportType) ? (typeParam as ImportType) : "players";

  const supabase = await createClient();
  const { data: batches } = await supabase
    .from("import_batches")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">CSV Import</h1>

      <div className="flex gap-2">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/import?type=${t}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              t === type ? "bg-brand-lime text-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {IMPORT_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      <UploadForm type={type} />

      <div className="space-y-3">
        <h2 className="text-xl">Recent Batches</h2>
        {batches?.length === 0 && <p className="text-sm text-muted-foreground">No imports yet.</p>}
        {batches?.map((b) => (
          <Link
            key={b.id}
            href={`/admin/import/${b.id}/${STATUS_STEP[b.status] ?? "map"}`}
            className="flex items-center justify-between gap-4 rounded-2xl border-2 border-foreground bg-card p-4 hover:bg-muted"
          >
            <div>
              <span className="font-heading">{b.filename}</span>
              <p className="text-sm text-muted-foreground">
                {b.total_rows} rows — {new Date(b.created_at).toLocaleString()}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {b.status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
