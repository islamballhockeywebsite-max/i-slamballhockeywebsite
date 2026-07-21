"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { playerFormSchema } from "@/lib/validation/player";
import { flattenZodFieldErrors } from "@/lib/validation/shared";
import type { Database } from "@/lib/supabase/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PlayerFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Uploads to the player-photos bucket via the RLS-scoped client (not service role) — the
 * storage write policy already gates on is_admin(), so this keeps the same defense-in-depth
 * as every other admin write path. Overwrites any existing photo at a stable per-player path.
 */
async function uploadPlayerPhoto(
  supabase: SupabaseServerClient,
  file: File,
  playerId: string,
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${playerId}/photo.${ext}`;

  const { error } = await supabase.storage
    .from("player-photos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from("player-photos").getPublicUrl(path);
  return publicUrl;
}

export async function createPlayer(
  prevState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = playerFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenZodFieldErrors(parsed.error) };
  }

  const insert: Database["public"]["Tables"]["players"]["Insert"] = {
    ...parsed.data,
    source: "manual",
  };

  const { data: player, error } = await supabase
    .from("players")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { error: error.message };

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const url = await uploadPlayerPhoto(supabase, photo, player.id);
    if (url) {
      await supabase.from("players").update({ photo_url: url }).eq("id", player.id);
    }
  }

  revalidatePath("/admin/players");
  redirect("/admin/players");
}

export async function updatePlayer(
  prevState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing player id." };

  const parsed = playerFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenZodFieldErrors(parsed.error) };
  }

  const { error } = await supabase.from("players").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const url = await uploadPlayerPhoto(supabase, photo, id);
    if (url) {
      await supabase.from("players").update({ photo_url: url }).eq("id", id);
    }
  }

  revalidatePath("/admin/players");
  revalidatePath(`/admin/players/${id}`);
  redirect("/admin/players");
}

export async function setPlayerStatus(id: string, status: "active" | "inactive"): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("players").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/players");
}

export async function deletePlayer(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return { error: error.message };

  // Best-effort: clean up the player's photo folder so deleted players don't leave
  // orphaned files in Storage. Never blocks on failure — the player row is already gone.
  const { data: files } = await supabase.storage.from("player-photos").list(id);
  if (files && files.length > 0) {
    await supabase.storage
      .from("player-photos")
      .remove(files.map((f) => `${id}/${f.name}`));
  }

  revalidatePath("/admin/players");
  return {};
}
