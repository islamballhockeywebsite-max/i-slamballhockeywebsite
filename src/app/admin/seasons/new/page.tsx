import { createSeason } from "@/actions/seasons";
import { SeasonForm } from "@/components/admin/seasons/season-form";

export default function NewSeasonPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Create Season</h1>
      <SeasonForm action={createSeason} />
    </div>
  );
}
