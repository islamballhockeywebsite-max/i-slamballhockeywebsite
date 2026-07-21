"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRosterEntry, type FormState } from "@/actions/rosters";
import type { Database } from "@/lib/supabase/types";

type Roster = Database["public"]["Tables"]["rosters"]["Row"];

export function EditRosterDialog({ entry, playerName }: { entry: Roster; playerName: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const result = await updateRosterEntry(prev, formData);
      if (!result.error && !result.fieldErrors) {
        setOpen(false);
        router.refresh();
      }
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="edit" size="icon" title="Edit" />}>
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {playerName}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={entry.id} />

          <div className="space-y-2">
            <Label htmlFor="jersey_number">Jersey #</Label>
            <Input
              id="jersey_number"
              name="jersey_number"
              type="number"
              defaultValue={entry.jersey_number ?? undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select
              name="position"
              defaultValue={entry.position ?? undefined}
              items={{ forward: "Forward", defense: "Defense", goalie: "Goalie" }}
            >
              <SelectTrigger id="position" className="w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forward">Forward</SelectItem>
                <SelectItem value="defense">Defense</SelectItem>
                <SelectItem value="goalie">Goalie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              name="role"
              defaultValue={entry.role}
              items={{ player: "Player", captain: "Captain", assistant: "Assistant" }}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="captain">Captain</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" variant="create" disabled={pending}>
              {pending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
