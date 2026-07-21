import { createPlayer } from "@/actions/players";
import { PlayerForm } from "@/components/admin/players/player-form";

export default function NewPlayerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Create Player</h1>
      <PlayerForm action={createPlayer} />
    </div>
  );
}
