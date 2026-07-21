import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";

type Season = Database["public"]["Tables"]["seasons"]["Row"];

export function SeasonPicker({ seasons, seasonId }: { seasons: Season[]; seasonId: string }) {
  return (
    <form className="flex items-end gap-3">
      <Select
        name="season"
        defaultValue={seasonId || undefined}
        items={seasons.map((s) => ({ value: s.id, label: s.name }))}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Select a season" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline">
        Go
      </Button>
    </form>
  );
}
