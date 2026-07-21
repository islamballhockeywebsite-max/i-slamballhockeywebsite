"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/** Labeled toggle matching the mockups' "Pinned?" / "Active?" / "Playoffs?" / "Spare?" fields. */
export function ToggleField({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
