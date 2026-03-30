"use client";

import { MoonStar, Sparkles, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { useThemeMode } from "@/components/theme-provider";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import type { ThemeMode } from "@/lib/theme/types";
import { cn } from "@/lib/utils/cn";

const THEME_OPTION_LABELS: Array<{
  mode: ThemeMode;
  label: string;
  icon: typeof MoonStar;
}> = [
  { mode: "dark", label: "Dark", icon: MoonStar },
  { mode: "light", label: "Light", icon: Sun },
  { mode: "random", label: "Random", icon: Sparkles },
];

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { reducedMotion } = useMotionPreferences();
  const { activePreset, mode, randomizeTheme, setMode } = useThemeMode();
  const activeIndicatorId = useId();

  const onSelectMode = (nextMode: ThemeMode) => {
    if (nextMode === "random" && mode === "random") {
      randomizeTheme();
      return;
    }

    setMode(nextMode);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border/80 bg-surface-1/90 p-1 shadow-lg shadow-black/20 backdrop-blur-sm",
        className,
      )}
    >
      {THEME_OPTION_LABELS.map((option) => {
        const isActive = mode === option.mode;
        const Icon = option.icon;

        return (
          <motion.button
            key={option.mode}
            type="button"
            onClick={() => onSelectMode(option.mode)}
            whileHover={reducedMotion ? undefined : { y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={motionTransitions.fast}
            className={cn(
              "relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg px-2.5 text-xs font-medium transition-colors sm:text-sm",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={`${activeIndicatorId}-theme-pill`}
                className="absolute inset-0 -z-10 rounded-lg bg-primary"
                transition={motionTransitions.spring}
              />
            ) : null}
            <Icon className="size-3.5" aria-hidden />
            <span>{option.label}</span>
          </motion.button>
        );
      })}

      <AnimatePresence initial={false} mode="wait">
        {mode === "random" ? (
          <motion.p
            key={activePreset.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
            transition={motionTransitions.fast}
            className="hidden rounded-md border border-border/70 bg-surface-2/80 px-2 py-1 text-xs font-medium text-foreground/90 md:inline-flex"
          >
            {activePreset.label}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
