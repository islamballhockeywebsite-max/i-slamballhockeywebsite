import { createSponsor } from "@/actions/sponsors";
import { SponsorForm } from "@/components/admin/sponsors/sponsor-form";

export default function NewSponsorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Create Sponsor</h1>
      <SponsorForm action={createSponsor} />
    </div>
  );
}
