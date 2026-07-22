"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { sponsorFormSchema } from "@/lib/validation/sponsor";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function uploadSponsorLogo(
  supabase: SupabaseServerClient,
  file: File,
  sponsorId: string,
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${sponsorId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from("sponsor-logos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from("sponsor-logos").getPublicUrl(path);
  return publicUrl;
}

export async function createSponsor(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = sponsorFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const logo = formData.get("logo");
  if (!(logo instanceof File) || logo.size === 0) {
    return { fieldErrors: { logo: "A logo image is required" } };
  }

  const { data: sponsor, error } = await supabase
    .from("sponsors")
    .insert({ ...parsed.data, logo_url: "" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const url = await uploadSponsorLogo(supabase, logo, sponsor.id);
  if (!url) {
    await supabase.from("sponsors").delete().eq("id", sponsor.id);
    return { error: "Logo upload failed" };
  }
  await supabase.from("sponsors").update({ logo_url: url }).eq("id", sponsor.id);

  revalidatePath("/admin/sponsors");
  redirect("/admin/sponsors");
}

export async function updateSponsor(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing sponsor id." };

  const parsed = sponsorFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("sponsors").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const url = await uploadSponsorLogo(supabase, logo, id);
    if (url) await supabase.from("sponsors").update({ logo_url: url }).eq("id", id);
  }

  revalidatePath("/admin/sponsors");
  redirect("/admin/sponsors");
}

export async function setSponsorActive(id: string, active: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").update({ is_active: active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sponsors");
  return {};
}

export async function deleteSponsor(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  if (error) return { error: error.message };

  const { data: files } = await supabase.storage.from("sponsor-logos").list(id);
  if (files && files.length > 0) {
    await supabase.storage.from("sponsor-logos").remove(files.map((f) => `${id}/${f.name}`));
  }

  revalidatePath("/admin/sponsors");
  return {};
}
