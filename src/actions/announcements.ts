"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { announcementFormSchema } from "@/lib/validation/announcement";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createAnnouncement(prevState: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const parsed = announcementFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("announcements").insert({
    ...parsed.data,
    author_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing announcement id." };

  const parsed = announcementFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("announcements").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function setAnnouncementPublished(id: string, published: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  if (published) {
    const { data: current } = await supabase
      .from("announcements")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase
      .from("announcements")
      .update({ is_published: true, published_at: current?.published_at ?? new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("announcements").update({ is_published: false }).eq("id", id);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/announcements");
  return {};
}

export async function setAnnouncementPinned(id: string, pinned: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").update({ is_pinned: pinned }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return {};
}

export async function deleteAnnouncement(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return {};
}
