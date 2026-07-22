"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { commitBatch } from "@/actions/import";

export function CommitButton({ batchId, disabled }: { batchId: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleCommit() {
    if (!confirm("Commit this import? Valid, non-skipped rows will be written to the database.")) return;
    startTransition(async () => {
      const result = await commitBatch(batchId);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.push(`/admin/import/${batchId}/results`);
    });
  }

  return (
    <Button variant="create" disabled={disabled || pending} onClick={handleCommit}>
      {pending ? "Committing…" : "Commit Import"}
    </Button>
  );
}
