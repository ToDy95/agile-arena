import type { RoomPlayer } from "@/components/room/types";
import { Card } from "@/components/ui/card";

type PlayerStripProps = {
  players: RoomPlayer[];
  revealVotes: boolean;
};

export function PlayerStrip({ players, revealVotes }: PlayerStripProps) {
  if (players.length === 0) {
    return (
      <Card className="border-dashed border-zinc-700/70 bg-zinc-900/60 text-sm text-zinc-500">
        Waiting for players to enter the arena...
      </Card>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {players.map((player) => {
        const voteLabel = revealVotes
          ? (player.vote ?? "-")
          : player.hasVoted
            ? "Voted"
            : "Waiting";

        return (
          <Card key={player.connectionId} className="relative overflow-hidden p-3">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1"
              style={{ backgroundColor: player.color }}
            />
            <div className="pl-2">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {player.nickname}
                {player.isSelf ? " (You)" : ""}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-400">{voteLabel}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
