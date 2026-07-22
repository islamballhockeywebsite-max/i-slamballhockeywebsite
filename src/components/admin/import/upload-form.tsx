"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ImportType } from "@/lib/import/field-defs";

export function UploadForm({ type }: { type: ImportType }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("type", type);

    const res = await fetch("/api/import/upload", { method: "POST", body: formData });
    const body = await res.json();
    setPending(false);

    if (!res.ok) {
      setError(body.error ?? "Upload failed");
      return;
    }
    router.push(`/admin/import/${body.batchId}/map`);
  }

  return (
    <div className="max-w-md space-y-3">
      <div className="space-y-2">
        <Label htmlFor="csv-file">CSV file</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button variant="create" disabled={!file || pending} onClick={handleUpload}>
        {pending ? "Uploading…" : "Upload & Continue"}
      </Button>
    </div>
  );
}
