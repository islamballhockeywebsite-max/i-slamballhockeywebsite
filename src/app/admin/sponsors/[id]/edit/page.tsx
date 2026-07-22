import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSponsor } from "@/actions/sponsors";
import { SponsorForm } from "@/components/admin/sponsors/sponsor-form";

export default async function EditSponsorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sponsor } = await supabase.from("sponsors").select("*").eq("id", id).maybeSingle();

  if (!sponsor) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Sponsor</h1>
      <SponsorForm action={updateSponsor} sponsor={sponsor} />
    </div>
  );
}
