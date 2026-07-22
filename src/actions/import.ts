"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { findPlayerMatch } from "@/lib/import/dedupe";
import {
  historicalGoalieRowSchema,
  historicalSkaterRowSchema,
  playerRowSchema,
  type HistoricalGoalieRow,
  type HistoricalSkaterRow,
  type PlayerRow,
} from "@/lib/import/row-schemas";
import type { ImportType } from "@/lib/import/field-defs";

/**
 * Applies the confirmed column mapping to every raw row: re-keys raw[header] -> mapped[field],
 * validates via the type's zod schema, and runs dedupe matching against existing players.
 * Players rows that match an existing player default to skip=true (likely a duplicate);
 * historical-stat rows that DON'T match are marked invalid — their player_id FK has nothing
 * to resolve to until an admin picks one on the review screen.
 */
export async function saveMapping(
  batchId: string,
  mapping: Record<string, string | null>,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: batch } = await supabase.from("import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) return { error: "Batch not found" };

  const { data: rows } = await supabase
    .from("import_rows")
    .select("*")
    .eq("batch_id", batchId)
    .order("row_number");
  if (!rows) return { error: "No rows found" };

  const { data: players } = await supabase.from("players").select("id, first_name, last_name");

  const schema =
    batch.type === "players"
      ? playerRowSchema
      : batch.type === "historical_skaters"
        ? historicalSkaterRowSchema
        : historicalGoalieRowSchema;

  for (const row of rows) {
    const raw = row.raw as Record<string, string>;
    const mappedInput: Record<string, string> = {};
    for (const [field, header] of Object.entries(mapping)) {
      if (header) mappedInput[field] = raw[header] ?? "";
    }

    const parsed = schema.safeParse(mappedInput);
    let status: "valid" | "invalid" = parsed.success ? "valid" : "invalid";
    const errors: string[] = parsed.success
      ? []
      : parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`);
    let dedupeMatchId: string | null = null;
    let skip = false;

    if (parsed.success) {
      if (batch.type === "players") {
        const data = parsed.data as PlayerRow;
        const match = findPlayerMatch(data.first_name, data.last_name, players ?? []);
        if (match) {
          dedupeMatchId = match.id;
          skip = true;
        }
      } else {
        const data = parsed.data as HistoricalSkaterRow | HistoricalGoalieRow;
        const match = findPlayerMatch(data.player_first_name, data.player_last_name, players ?? []);
        if (match) {
          dedupeMatchId = match.id;
        } else {
          status = "invalid";
          errors.push("No matching player found — resolve manually or skip");
        }
      }
    }

    await supabase
      .from("import_rows")
      .update({
        mapped: parsed.success ? parsed.data : null,
        validation_errors: errors.length > 0 ? errors : null,
        status,
        dedupe_match_player_id: dedupeMatchId,
        skip,
      })
      .eq("id", row.id);
  }

  await supabase.from("import_batches").update({ status: "mapped", column_mapping: mapping }).eq("id", batchId);

  revalidatePath(`/admin/import/${batchId}/review`);
  return {};
}

export async function resolveRowPlayer(
  rowId: string,
  batchId: string,
  playerId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("import_rows")
    .select("validation_errors")
    .eq("id", rowId)
    .maybeSingle();
  if (!row) return { error: "Row not found" };

  const remainingErrors = ((row.validation_errors as string[] | null) ?? []).filter(
    (e) => !e.includes("No matching player"),
  );

  const { error } = await supabase
    .from("import_rows")
    .update({
      dedupe_match_player_id: playerId,
      status: remainingErrors.length > 0 ? "invalid" : "valid",
      validation_errors: remainingErrors.length > 0 ? remainingErrors : null,
    })
    .eq("id", rowId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/import/${batchId}/review`);
  return {};
}

export async function setRowSkip(rowId: string, batchId: string, skip: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("import_rows").update({ skip }).eq("id", rowId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/import/${batchId}/review`);
  return {};
}

export async function commitBatch(
  batchId: string,
): Promise<{ error?: string; committed?: number; skipped?: number }> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: batch } = await supabase.from("import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) return { error: "Batch not found" };

  const { data: allRows } = await supabase.from("import_rows").select("*").eq("batch_id", batchId);
  const rows = (allRows ?? []).filter((r) => r.status === "valid" && !r.skip);
  const skippedCount = (allRows?.length ?? 0) - rows.length;

  if (rows.length === 0) {
    await supabase
      .from("import_batches")
      .update({ status: "committed", committed_at: new Date().toISOString() })
      .eq("id", batchId);
    return { committed: 0, skipped: skippedCount };
  }

  let insertError: string | null = null;
  const type = batch.type as ImportType;

  if (type === "players") {
    const inserts = rows.map((r) => ({ ...(r.mapped as PlayerRow), source: "csv" as const }));
    const { error } = await supabase.from("players").insert(inserts);
    if (error) insertError = error.message;
  } else {
    const withPlayer = rows.filter((r) => r.dedupe_match_player_id);
    const table = type === "historical_skaters" ? "historical_player_season_stats" : "historical_goalie_season_stats";

    // A single upsert statement can't affect the same (player_id, year, team_name) row
    // twice — catch two rows resolving to the same key (e.g. two CSV names both matched
    // to one existing player) before Postgres rejects the whole batch with a cryptic error.
    const seenKeys = new Map<string, number>();
    const conflicts: string[] = [];
    for (const r of withPlayer) {
      const m = r.mapped as HistoricalSkaterRow | HistoricalGoalieRow;
      const key = `${r.dedupe_match_player_id}|${m.year}|${m.team_name ?? ""}`;
      const firstRow = seenKeys.get(key);
      if (firstRow !== undefined) {
        conflicts.push(`rows ${firstRow} and ${r.row_number} both resolve to the same player + year + team`);
      } else {
        seenKeys.set(key, r.row_number);
      }
    }
    if (conflicts.length > 0) {
      const message = `Duplicate rows within this batch: ${conflicts.join("; ")}. Skip or fix one of each pair before committing.`;
      await supabase.from("import_batches").update({ status: "failed", error_message: message }).eq("id", batchId);
      return { error: message };
    }

    const inserts = withPlayer.map((r) => {
      const { player_first_name, player_last_name, ...rest } = r.mapped as
        | HistoricalSkaterRow
        | HistoricalGoalieRow;
      void player_first_name;
      void player_last_name;
      return { ...rest, player_id: r.dedupe_match_player_id as string, source: "import" as const, added_by: user.id };
    });

    const { error } = await supabase
      .from(table)
      .upsert(inserts, { onConflict: "player_id,year,team_name" });
    if (error) insertError = error.message;
  }

  if (insertError) {
    await supabase.from("import_batches").update({ status: "failed", error_message: insertError }).eq("id", batchId);
    return { error: insertError };
  }

  await supabase
    .from("import_rows")
    .update({ status: "committed" })
    .in("id", rows.map((r) => r.id));
  await supabase
    .from("import_batches")
    .update({ status: "committed", committed_at: new Date().toISOString() })
    .eq("id", batchId);

  revalidatePath(`/admin/import/${batchId}/results`);
  revalidatePath("/admin/players");
  revalidatePath("/admin/historical-stats");
  return { committed: rows.length, skipped: skippedCount };
}

export async function deleteBatch(batchId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("import_batches").delete().eq("id", batchId);
  if (error) return { error: error.message };
  revalidatePath("/admin/import");
  return {};
}
