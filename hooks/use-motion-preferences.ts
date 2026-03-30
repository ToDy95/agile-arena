"use client";

import { useReducedMotion } from "motion/react";

export function useMotionPreferences() {
  const shouldReduceMotion = useReducedMotion();

  return {
    reducedMotion: shouldReduceMotion === true,
  };
}
