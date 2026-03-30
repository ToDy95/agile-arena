import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { RoomMode } from "@/lib/types/domain";

type ModeSelectorProps = {
  mode: RoomMode;
  onModeChange: (mode: RoomMode) => void;
  disabled?: boolean;
};

const MODE_META: Array<{ id: RoomMode; title: string; description: string }> = [
  {
    id: "retro",
    title: "Retro",
    description: "Run a fast retrospective board with live notes.",
  },
  {
    id: "grooming",
    title: "Grooming",
    description: "Estimate stories together with planning poker.",
  },
];

export function ModeSelector({
  mode,
  onModeChange,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MODE_META.map((entry) => {
        const isActive = mode === entry.id;

        return (
          <button
            key={entry.id}
            type="button"
            disabled={disabled}
            className={cn(disabled && "cursor-not-allowed opacity-60")}
            onClick={() => onModeChange(entry.id)}
          >
            <Card
              className={cn(
                "h-full text-left transition",
                isActive
                  ? "border-sky-500/70 bg-sky-500/10"
                  : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700",
              )}
            >
              <p className="text-sm font-semibold text-zinc-100">{entry.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{entry.description}</p>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
