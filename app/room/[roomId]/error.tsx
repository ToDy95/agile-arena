"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getItemRevealVariants } from "@/lib/animations/presets";

type RoomErrorProps = {
  error: Error;
  reset: () => void;
};

export default function RoomError({ error, reset }: RoomErrorProps) {
  const { reducedMotion } = useMotionPreferences();
  const itemReveal = getItemRevealVariants(reducedMotion);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <motion.div
        variants={itemReveal}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-md space-y-3 rounded-2xl border border-destructive/35 bg-destructive/12 p-4 text-center"
      >
        <h1 className="text-lg font-semibold">Could not load room</h1>
        <p className="text-sm text-foreground/90">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex justify-center">
          <Button variant="secondary" onClick={reset}>
            Retry
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
