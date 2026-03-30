import type { Transition, Variants } from "motion/react";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const motionDurations = {
  instant: 0,
  fast: 0.14,
  base: 0.2,
  slow: 0.28,
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
    stiffness: 360,
    damping: 28,
    mass: 0.82,
  } satisfies Transition,
  snappySpring: {
    type: "spring",
    stiffness: 460,
    damping: 32,
    mass: 0.72,
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
    hidden: { opacity: 0, y: 14, scale: 0.985 },
    show: { opacity: 1, y: 0, scale: 1, transition: motionTransitions.base },
    exit: { opacity: 0, y: -8, scale: 0.985, transition: motionTransitions.fast },
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
        staggerChildren: 0.055,
        delayChildren: 0.05,
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
    whileHover: { y: -3, scale: 1.01 },
    whileTap: { scale: 0.985 },
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
    initial: { opacity: 0, y: 12, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: motionTransitions.base },
    exit: { opacity: 0, y: -8, scale: 0.99, transition: motionTransitions.fast },
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
    initial: { opacity: 0, rotateX: -88, y: 6 },
    animate: { opacity: 1, rotateX: 0, y: 0, transition: motionTransitions.snappySpring },
    exit: { opacity: 0, rotateX: 88, y: -6, transition: motionTransitions.fast },
  };
}

export function getPresencePulseAnimation(reducedMotion: boolean) {
  if (reducedMotion) {
    return {};
  }

  return {
    boxShadow: [
      "0 0 0 0 rgba(56, 189, 248, 0.28)",
      "0 0 0 10px rgba(56, 189, 248, 0)",
      "0 0 0 0 rgba(56, 189, 248, 0)",
    ],
    transition: {
      duration: 1.1,
      ease: "easeOut",
    } satisfies Transition,
  };
}

export function getReadyPulseAnimation(reducedMotion: boolean) {
  if (reducedMotion) {
    return {};
  }

  return {
    scale: [1, 1.03, 1],
    boxShadow: [
      "0 0 0 0 rgba(56, 189, 248, 0.0)",
      "0 0 0 8px rgba(56, 189, 248, 0.15)",
      "0 0 0 0 rgba(56, 189, 248, 0.0)",
    ],
    transition: {
      duration: 1.2,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 0.25,
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: motionTransitions.base },
  };
}
