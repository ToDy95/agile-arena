"use client";

import { motion } from "motion/react";

import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getCardInteractionProps, motionTransitions } from "@/lib/animations/presets";
import type { RoomMode } from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";

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

export function ModeSelector({ mode, onModeChange, disabled = false }: ModeSelectorProps) {
  const { reducedMotion } = useMotionPreferences();
  const cardInteraction = getCardInteractionProps(reducedMotion);

  return (
    <motion.div layout className="grid gap-3 sm:grid-cols-2">
      {MODE_META.map((entry) => {
        const isActive = mode === entry.id;

        return (
          <motion.button
            key={entry.id}
            type="button"
            layout
            disabled={disabled}
            className={cn(
              "relative h-full rounded-2xl border px-4 py-4 text-left transition",
              disabled && "cursor-not-allowed opacity-60",
              isActive
                ? "border-sky-500/70 bg-sky-500/10"
                : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700",
            )}
            onClick={() => onModeChange(entry.id)}
            {...cardInteraction}
          >
            {isActive ? (
              <motion.span
                layoutId="agile-arena-mode-active-pill"
                className="pointer-events-none absolute inset-0 rounded-2xl border border-sky-400/60"
                transition={motionTransitions.spring}
              />
            ) : null}

            <p className="relative text-sm font-semibold text-zinc-100">{entry.title}</p>
            <p className="relative mt-1 text-sm text-zinc-400">{entry.description}</p>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
