import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

export function PlayerFilters({
  search,
  status,
  position,
}: {
  search: string;
  status: string;
  position: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-3">
      <div className="w-64">
        <Input
          name="search"
          placeholder="Search by name or email"
          defaultValue={search}
          aria-label="Search players"
        />
      </div>
      <Select name="status" defaultValue={status || "all"}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select name="position" defaultValue={position || "all"}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any position</SelectItem>
          <SelectItem value="forward">Forward</SelectItem>
          <SelectItem value="defense">Defense</SelectItem>
          <SelectItem value="goalie">Goalie</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline" className="gap-1.5">
        <SearchIcon className="size-4" />
        Search
      </Button>
    </form>
  );
}
