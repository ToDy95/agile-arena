"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { motionTransitions } from "@/lib/animations/presets";
import { STORY_POINT_LEGEND } from "@/lib/constants/planning";
import { cn } from "@/lib/utils/cn";

export function PlanningLegend() {
  const { reducedMotion } = useMotionPreferences();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs text-muted-foreground"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Sparkles className="size-3.5" aria-hidden />
        Story Point Legend
        <motion.span
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={motionTransitions.fast}
        >
          <ChevronDown className="size-3.5" aria-hidden />
        </motion.span>
      </Button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
            transition={motionTransitions.base}
            className="overflow-hidden"
          >
            <div className="grid gap-1.5 sm:grid-cols-2">
              {STORY_POINT_LEGEND.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm",
                    item.toneClassName,
                  )}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-[11px] opacity-90">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
