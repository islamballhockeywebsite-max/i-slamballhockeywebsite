"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlayerFormState } from "@/actions/players";
import type { Database } from "@/lib/supabase/types";

type Player = Database["public"]["Tables"]["players"]["Row"];

export function PlayerForm({
  action,
  player,
}: {
  action: (prevState: PlayerFormState, formData: FormData) => Promise<PlayerFormState>;
  player?: Player;
}) {
  const [state, formAction, pending] = useActionState<PlayerFormState, FormData>(action, {});

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {player && <input type="hidden" name="id" value={player.id} />}

      {player?.photo_url && (
        <Image
          src={player.photo_url}
          alt=""
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="photo">Photo</Label>
        <Input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name*</Label>
          <Input id="first_name" name="first_name" defaultValue={player?.first_name} required />
          {fieldError("first_name") && (
            <p className="text-sm text-destructive">{fieldError("first_name")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name*</Label>
          <Input id="last_name" name="last_name" defaultValue={player?.last_name} required />
          {fieldError("last_name") && (
            <p className="text-sm text-destructive">{fieldError("last_name")}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            defaultValue={player?.date_of_birth ?? undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_position">Position</Label>
          <Select name="default_position" defaultValue={player?.default_position ?? undefined}>
            <SelectTrigger id="default_position" className="w-full">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forward">Forward</SelectItem>
              <SelectItem value="defense">Defense</SelectItem>
              <SelectItem value="goalie">Goalie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={player?.email ?? undefined} />
          {fieldError("email") && (
            <p className="text-sm text-destructive">{fieldError("email")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={player?.phone ?? undefined} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_name">Emergency contact name</Label>
          <Input
            id="emergency_contact_name"
            name="emergency_contact_name"
            defaultValue={player?.emergency_contact_name ?? undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_phone">Emergency contact phone</Label>
          <Input
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            defaultValue={player?.emergency_contact_phone ?? undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={player?.status ?? "active"}>
          <SelectTrigger id="status" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : player ? "Save Changes" : "Create Player"}
      </Button>
    </form>
  );
}
