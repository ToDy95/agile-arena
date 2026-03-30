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
} from "@/lib/animations/presets";

type PlayerStripProps = {
  players: RoomPlayer[];
  revealVotes: boolean;
};

function VoteStatus({ revealVotes, voteLabel }: { revealVotes: boolean; voteLabel: string }) {
  const { reducedMotion } = useMotionPreferences();
  const voteFlip = getVoteFlipVariants(reducedMotion);

  return (
    <div className="mt-2 [perspective:900px]">
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={`${revealVotes ? "revealed" : "hidden"}-${voteLabel}`}
          variants={voteFlip}
          initial="initial"
          animate="animate"
          exit="exit"
          className="text-xs uppercase tracking-[0.14em] text-zinc-400"
        >
          {voteLabel}
        </motion.p>
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
        className="rounded-2xl border border-dashed border-zinc-700/70 bg-zinc-900/60 p-4 text-sm text-zinc-500"
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
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <AnimatePresence initial={false}>
        {players.map((player) => {
          const voteLabel = revealVotes
            ? (player.vote ?? "-")
            : player.hasVoted
              ? "Voted"
              : "Waiting";
          const isRecentJoin = recentlyJoinedIds.has(player.connectionId);

          return (
            <motion.div
              key={player.connectionId}
              layout
              variants={itemReveal}
              initial="hidden"
              animate="show"
              exit="exit"
              {...cardInteraction}
            >
              <motion.div
                animate={isRecentJoin ? getPresencePulseAnimation(reducedMotion) : undefined}
              >
                <Card className="relative overflow-hidden p-3 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.32),0_10px_24px_rgba(2,6,23,0.38)]">
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
                    <VoteStatus revealVotes={revealVotes} voteLabel={voteLabel} />
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
