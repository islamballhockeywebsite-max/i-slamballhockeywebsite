import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateDivision } from "@/actions/seasons";
import { DivisionForm } from "@/components/admin/seasons/division-form";

export default async function EditDivisionPage({
  params,
}: {
  params: Promise<{ divisionId: string }>;
}) {
  const { divisionId } = await params;
  const supabase = await createClient();
  const { data: division } = await supabase
    .from("divisions")
    .select("*")
    .eq("id", divisionId)
    .maybeSingle();

  if (!division) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Division</h1>
      <DivisionForm action={updateDivision} division={division} />
    </div>
  );
}
