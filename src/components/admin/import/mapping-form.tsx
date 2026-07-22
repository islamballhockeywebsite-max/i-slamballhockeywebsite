"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveMapping } from "@/actions/import";
import type { TargetField } from "@/lib/import/field-defs";

const NONE = "__none__";

export function MappingForm({
  batchId,
  fields,
  headers,
  initialMapping,
}: {
  batchId: string;
  fields: TargetField[];
  headers: string[];
  initialMapping: Record<string, string | null>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initialMapping[f.key] ?? NONE])),
  );

  const headerOptions = [{ value: NONE, label: "— Not mapped —" }, ...headers.map((h) => ({ value: h, label: h }))];

  function handleContinue() {
    const missingRequired = fields.filter((f) => f.required && mapping[f.key] === NONE);
    if (missingRequired.length > 0) {
      alert(`Please map: ${missingRequired.map((f) => f.label).join(", ")}`);
      return;
    }

    startTransition(async () => {
      const cleanMapping = Object.fromEntries(
        Object.entries(mapping).map(([k, v]) => [k, v === NONE ? null : v]),
      );
      const result = await saveMapping(batchId, cleanMapping);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.push(`/admin/import/${batchId}/review`);
    });
  }

  return (
    <div className="max-w-xl space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="grid grid-cols-2 items-center gap-4">
          <Label>
            {field.label}
            {field.required ? "*" : ""}
          </Label>
          <Select
            value={mapping[field.key]}
            onValueChange={(v) => v && setMapping((prev) => ({ ...prev, [field.key]: v }))}
            items={headerOptions}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {headerOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button variant="create" disabled={pending} onClick={handleContinue}>
        {pending ? "Validating…" : "Continue to Review"}
      </Button>
    </div>
  );
}
