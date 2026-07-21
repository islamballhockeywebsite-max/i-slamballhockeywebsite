import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSeason } from "@/actions/seasons";
import { SeasonForm } from "@/components/admin/seasons/season-form";

export default async function EditSeasonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: season } = await supabase.from("seasons").select("*").eq("id", id).maybeSingle();

  if (!season) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Season</h1>
      <SeasonForm action={updateSeason} season={season} />
    </div>
  );
}
