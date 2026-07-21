import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createDivision } from "@/actions/seasons";
import { DivisionForm } from "@/components/admin/seasons/division-form";

export default async function NewDivisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: season } = await supabase.from("seasons").select("id, name").eq("id", id).maybeSingle();

  if (!season) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Add Division to {season.name}</h1>
      <DivisionForm action={createDivision} seasonId={season.id} />
    </div>
  );
}
