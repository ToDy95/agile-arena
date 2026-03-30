import type { Transition, Variants } from "motion/react";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const motionDurations = {
  instant: 0,
  fast: 0.12,
  base: 0.18,
  slow: 0.24,
} as const;

export const motionTransitions = {
  fast: {
    duration: motionDurations.fast,
    ease: easeOutExpo,
  } satisfies Transition,
  base: {
    duration: motionDurations.base,
    ease: easeOutExpo,
  } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 33,
    mass: 0.8,
  } satisfies Transition,
  snappySpring: {
    type: "spring",
    stiffness: 500,
    damping: 36,
    mass: 0.68,
  } satisfies Transition,
};

export function getItemRevealVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: motionDurations.instant } },
      exit: { opacity: 0, transition: { duration: motionDurations.instant } },
    };
  }

  return {
    hidden: { opacity: 0, y: 10, scale: 0.992 },
    show: { opacity: 1, y: 0, scale: 1, transition: motionTransitions.base },
    exit: { opacity: 0, y: -4, scale: 0.992, transition: motionTransitions.fast },
  };
}

export function getContainerStaggerVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: {},
      show: { transition: { staggerChildren: 0 } },
    };
  }

  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.03,
      },
    },
  };
}

export function getCardInteractionProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: motionDurations.instant } satisfies Transition,
    };
  }

  return {
    whileHover: { y: -2, scale: 1.004 },
    whileTap: { scale: 0.99 },
    transition: motionTransitions.spring,
  };
}

export function getModeSwapVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: motionDurations.instant } },
      exit: { opacity: 0, transition: { duration: motionDurations.instant } },
    };
  }

  return {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1, transition: motionTransitions.base },
    exit: { opacity: 0, y: -4, scale: 0.995, transition: motionTransitions.fast },
  };
}

export function getVoteFlipVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: motionDurations.instant } },
      exit: { opacity: 0, transition: { duration: motionDurations.instant } },
    };
  }

  return {
    initial: { opacity: 0, rotateX: -72, y: 4 },
    animate: { opacity: 1, rotateX: 0, y: 0, transition: motionTransitions.snappySpring },
    exit: { opacity: 0, rotateX: 72, y: -4, transition: motionTransitions.fast },
  };
}

export function getPresencePulseAnimation(reducedMotion: boolean) {
  if (reducedMotion) {
    return {};
  }

  return {
    scale: [1, 1.012, 1],
    opacity: [1, 0.95, 1],
    transition: {
      duration: 0.8,
      ease: "easeOut",
    } satisfies Transition,
  };
}

export function getReadyPulseAnimation(reducedMotion: boolean) {
  if (reducedMotion) {
    return {};
  }

  return {
    scale: [1, 1.016, 1],
    boxShadow: [
      "0 0 0 0 rgba(125, 211, 252, 0.0)",
      "0 0 0 6px rgba(125, 211, 252, 0.14)",
      "0 0 0 0 rgba(125, 211, 252, 0.0)",
    ],
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 0.35,
      ease: "easeInOut",
    } satisfies Transition,
  };
}

export function getPageEnterVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: motionDurations.instant } },
    };
  }

  return {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: motionTransitions.base },
  };
}
