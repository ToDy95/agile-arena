"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { RoomPlayer } from "@/components/room/types";
import { Card } from "@/components/ui/card";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import {
  getCardInteractionProps,
  getItemRevealVariants,
  getPresencePulseAnimation,
  getVoteFlipVariants,
  motionTransitions,
} from "@/lib/animations/presets";
import type { PlanningEstimate } from "@/lib/types/domain";

type PlayerStripProps = {
  players: RoomPlayer[];
  revealVotes: boolean;
};

function RevealedEstimate({ vote }: { vote: PlanningEstimate }) {
  const { reducedMotion } = useMotionPreferences();

  const breakdown = [
    { label: "SP", value: vote.storyPoints },
    { label: "Complexity", value: vote.complexity },
    { label: "Time", value: vote.timeConsuming },
  ] as const;

  return (
    <div className="mt-2 grid grid-cols-3 gap-1.5">
      {breakdown.map((entry, index) => (
        <motion.div
          key={entry.label}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 3, scale: 0.98 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={
            reducedMotion
              ? motionTransitions.fast
              : {
                  ...motionTransitions.fast,
                  delay: index * 0.04,
                }
          }
          className="rounded-md border border-border/70 bg-surface-2/85 px-1.5 py-1 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {entry.label}
          </p>
          <p className="text-xs font-semibold text-foreground">{entry.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function VoteStatus({
  revealVotes,
  vote,
  hasVoted,
}: {
  revealVotes: boolean;
  vote: PlanningEstimate | null;
  hasVoted: boolean;
}) {
  const { reducedMotion } = useMotionPreferences();
  const voteFlip = getVoteFlipVariants(reducedMotion);

  const waitingLabel = hasVoted ? "Estimate locked" : "Waiting";
  const hiddenLabel = revealVotes ? "No vote" : waitingLabel;

  return (
    <div className="mt-2 [perspective:900px]">
      <AnimatePresence initial={false} mode="wait">
        {revealVotes && vote ? (
          <motion.div
            key={`revealed-${vote.storyPoints}-${vote.complexity}-${vote.timeConsuming}`}
            variants={voteFlip}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <RevealedEstimate vote={vote} />
          </motion.div>
        ) : (
          <motion.p
            key={`hidden-${hiddenLabel}`}
            variants={voteFlip}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
          >
            {hiddenLabel}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlayerStrip({ players, revealVotes }: PlayerStripProps) {
  const { reducedMotion } = useMotionPreferences();

  const itemReveal = getItemRevealVariants(reducedMotion);
  const cardInteraction = getCardInteractionProps(reducedMotion);

  const [recentlyJoinedIds, setRecentlyJoinedIds] = useState<Set<number>>(new Set());
  const previousConnectionIdsRef = useRef<Set<number>>(new Set());
  const joinTimersRef = useRef<Map<number, number>>(new Map());
  const didMountRef = useRef(false);

  useEffect(() => {
    const currentConnectionIds = new Set(players.map((player) => player.connectionId));

    if (didMountRef.current) {
      const joinedConnectionIds = [...currentConnectionIds].filter(
        (connectionId) => !previousConnectionIdsRef.current.has(connectionId),
      );

      if (joinedConnectionIds.length > 0) {
        setRecentlyJoinedIds((current) => {
          const next = new Set(current);
          joinedConnectionIds.forEach((connectionId) => {
            next.add(connectionId);
          });
          return next;
        });

        joinedConnectionIds.forEach((connectionId) => {
          const existingTimer = joinTimersRef.current.get(connectionId);
          if (existingTimer) {
            window.clearTimeout(existingTimer);
          }

          const timeoutId = window.setTimeout(() => {
            setRecentlyJoinedIds((current) => {
              const next = new Set(current);
              next.delete(connectionId);
              return next;
            });
            joinTimersRef.current.delete(connectionId);
          }, 1100);

          joinTimersRef.current.set(connectionId, timeoutId);
        });
      }
    }

    didMountRef.current = true;
    previousConnectionIdsRef.current = currentConnectionIds;
  }, [players]);

  useEffect(() => {
    return () => {
      for (const timeoutId of joinTimersRef.current.values()) {
        window.clearTimeout(timeoutId);
      }
      joinTimersRef.current.clear();
    };
  }, []);

  if (players.length === 0) {
    return (
      <motion.div
        variants={itemReveal}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-dashed border-border/70 bg-card/72 p-4 text-sm text-muted-foreground"
      >
        <motion.p
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.7, 1, 0.7],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1.6,
                  ease: "easeInOut",
                }
          }
        >
          Waiting for players to enter the arena...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AnimatePresence initial={false}>
        {players.map((player) => {
          const isRecentJoin = recentlyJoinedIds.has(player.connectionId);

          return (
            <motion.div
              key={player.connectionId}
              layout
              variants={itemReveal}
              initial="hidden"
              animate="show"
              exit="exit"
              className="overflow-hidden rounded-2xl"
              {...cardInteraction}
            >
              <motion.div
                animate={isRecentJoin ? getPresencePulseAnimation(reducedMotion) : undefined}
              >
                <Card className="relative p-3 transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--arena-accent-soft),0_16px_28px_rgba(2,6,23,0.24)] dark:hover:shadow-[0_0_0_1px_var(--arena-accent-soft),0_16px_28px_rgba(2,6,23,0.5)]">
                  {isRecentJoin ? (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/55"
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0.55, scale: 0.98 }}
                      animate={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
                      transition={motionTransitions.base}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ backgroundColor: player.color }}
                  />
                  <div className="pl-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {player.nickname}
                      {player.isSelf ? " (You)" : ""}
                    </p>
                    <VoteStatus
                      revealVotes={revealVotes}
                      vote={player.vote}
                      hasVoted={player.hasVoted}
                    />
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
