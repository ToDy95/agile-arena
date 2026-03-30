"use client";

import { LiveMap, LiveObject } from "@liveblocks/client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { PlanningMode } from "@/components/planning/planning-mode";
import { RetroMode } from "@/components/retro/retro-mode";
import { ModeSelector } from "@/components/room/mode-selector";
import { PlayerStrip } from "@/components/room/player-strip";
import { RoomHeader } from "@/components/room/room-header";
import type { RoomPlayer } from "@/components/room/types";
import { Card } from "@/components/ui/card";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getItemRevealVariants, getModeSwapVariants } from "@/lib/animations/presets";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useSelf,
  useStatus,
  useStorage,
  useUpdateMyPresence,
} from "@/lib/liveblocks/room-context";
import type { RetroNoteStorage } from "@/lib/liveblocks/types";
import { normalizePlanningTaskInput } from "@/lib/schemas/planning";
import type { PlanningVoteValue, RetroNote, RoomMode } from "@/lib/types/domain";
import { normalizeHexColor } from "@/lib/utils/color";
import { extractJiraIssueKey } from "@/lib/utils/jira";

type RoomExperienceProps = {
  roomId: string;
  currentUserId: string;
  currentNickname: string;
  currentColor: string;
};

function resolvePlayerColor(color: string | undefined): string {
  return normalizeHexColor(color ?? "") ?? "#38BDF8";
}

function mapStatusLabel(status: string): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "reconnecting":
      return "Reconnecting";
    case "disconnected":
      return "Disconnected";
    default:
      return "Initializing";
  }
}

export function RoomExperience({
  roomId,
  currentUserId,
  currentNickname,
  currentColor,
}: RoomExperienceProps) {
  const { reducedMotion } = useMotionPreferences();
  const itemReveal = getItemRevealVariants(reducedMotion);
  const modeSwap = getModeSwapVariants(reducedMotion);
  const status = useStatus();
  const roomMode = useStorage((root) => root.mode) ?? "grooming";
  const planning = useStorage((root) => root.planning);
  const retroNotesMap = useStorage((root) => root.retro.notes);
  const others = useOthers();
  const self = useSelf();
  const [myPresence] = useMyPresence();
  const updateMyPresence = useUpdateMyPresence();

  const votes = useMemo(
    () =>
      (planning?.votes ?? new Map<string, PlanningVoteValue>()) as ReadonlyMap<
        string,
        PlanningVoteValue
      >,
    [planning?.votes],
  );

  const myVote = votes.get(currentUserId) ?? null;
  const storageReady = planning !== null && retroNotesMap !== null;

  const setMode = useMutation(({ storage, setMyPresence }, nextMode: RoomMode) => {
    storage.set("mode", nextMode);
    setMyPresence({ mode: nextMode });
  }, []);

  const updateTask = useMutation(({ storage }, input: string) => {
    const planningRoot = storage.get("planning");
    const normalizedInput = normalizePlanningTaskInput(input);
    planningRoot.set("taskInput", normalizedInput);
    planningRoot.set("issueKey", extractJiraIssueKey(normalizedInput));
  }, []);

  const clearTask = useMutation(({ storage }) => {
    const planningRoot = storage.get("planning");
    planningRoot.set("taskInput", "");
    planningRoot.set("issueKey", null);
  }, []);

  const castVote = useMutation(
    ({ storage, setMyPresence }, userId: string, vote: PlanningVoteValue) => {
      const planningRoot = storage.get("planning");
      planningRoot.get("votes").set(userId, vote);
      planningRoot.set("isRevealed", false);
      setMyPresence({ hasVoted: true });
    },
    [],
  );

  const revealVotes = useMutation(({ storage }) => {
    storage.get("planning").set("isRevealed", true);
  }, []);

  const resetRound = useMutation(({ storage, setMyPresence }) => {
    const planningRoot = storage.get("planning");
    const voteMap = planningRoot.get("votes");

    for (const key of voteMap.keys()) {
      voteMap.delete(key);
    }

    planningRoot.set("isRevealed", false);
    setMyPresence({ hasVoted: false });
  }, []);

  const addRetroNote = useMutation(
    (
      { storage },
      note: {
        text: string;
        column: RetroNote["column"];
        authorId: string;
        authorNickname: string;
        authorColor: string;
      },
    ) => {
      const notesMap = storage.get("retro").get("notes");
      const noteId = crypto.randomUUID();
      const now = Date.now();

      notesMap.set(
        noteId,
        new LiveObject<RetroNoteStorage>({
          id: noteId,
          text: note.text,
          column: note.column,
          authorId: note.authorId,
          authorNickname: note.authorNickname,
          authorColor: note.authorColor,
          createdAt: now,
          updatedAt: now,
          upvotes: new LiveMap<string, boolean>(),
        }),
      );
    },
    [],
  );

  const editRetroNote = useMutation(
    ({ storage }, payload: { noteId: string; userId: string; text: string }) => {
      const notesMap = storage.get("retro").get("notes");
      const note = notesMap.get(payload.noteId);

      if (!note || note.get("authorId") !== payload.userId) {
        return;
      }

      note.set("text", payload.text);
      note.set("updatedAt", Date.now());
    },
    [],
  );

  const deleteRetroNote = useMutation(
    ({ storage }, payload: { noteId: string; userId: string }) => {
      const notesMap = storage.get("retro").get("notes");
      const note = notesMap.get(payload.noteId);

      if (!note || note.get("authorId") !== payload.userId) {
        return;
      }

      notesMap.delete(payload.noteId);
    },
    [],
  );

  const toggleRetroUpvote = useMutation(
    ({ storage }, payload: { noteId: string; userId: string }) => {
      const note = storage.get("retro").get("notes").get(payload.noteId);

      if (!note) {
        return;
      }

      const upvotes = note.get("upvotes");
      const hasUpvoted = upvotes.get(payload.userId) === true;

      if (hasUpvoted) {
        upvotes.delete(payload.userId);
      } else {
        upvotes.set(payload.userId, true);
      }
    },
    [],
  );

  useEffect(() => {
    if (myPresence.mode === roomMode && myPresence.hasVoted === (myVote !== null)) {
      return;
    }

    updateMyPresence({
      mode: roomMode,
      hasVoted: myVote !== null,
    });
  }, [myPresence.hasVoted, myPresence.mode, myVote, roomMode, updateMyPresence]);

  const players = useMemo<RoomPlayer[]>(() => {
    const everyone = self ? [self, ...others] : [...others];

    return everyone
      .map((user) => {
        const userId = user.presence.userId || user.id;
        const nickname = user.presence.nickname || user.info?.nickname || "Player";
        const color = resolvePlayerColor(user.presence.color || user.info?.color);
        const vote = votes.get(userId) ?? null;

        return {
          connectionId: user.connectionId,
          userId,
          nickname,
          color,
          isSelf: self ? user.connectionId === self.connectionId : false,
          hasVoted: vote !== null,
          vote,
        };
      })
      .sort((a, b) => {
        if (a.isSelf) {
          return -1;
        }

        if (b.isSelf) {
          return 1;
        }

        return a.nickname.localeCompare(b.nickname);
      });
  }, [others, self, votes]);

  const retroNotes = useMemo<RetroNote[]>(() => {
    if (!retroNotesMap) {
      return [];
    }

    return Array.from(retroNotesMap.values())
      .map((note) => {
        const upvotes: RetroNote["upvotes"] = {};

        note.upvotes.forEach((isUpvoted, userId) => {
          if (isUpvoted) {
            upvotes[userId] = true;
          }
        });

        return {
          ...note,
          upvotes,
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [retroNotesMap]);

  return (
    <motion.div layout className="space-y-4 overflow-x-clip">
      <RoomHeader roomId={roomId} status={mapStatusLabel(status)} />
      <PlayerStrip
        players={players}
        revealVotes={roomMode === "grooming" && Boolean(planning?.isRevealed)}
      />
      <ModeSelector mode={roomMode} disabled={!storageReady} onModeChange={setMode} />

      {!storageReady ? (
        <motion.div variants={itemReveal} initial="hidden" animate="show">
          <Card className="space-y-2 border-amber-500/35 bg-amber-500/12 text-amber-200">
            <motion.p
              className="text-sm font-semibold"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={
                reducedMotion
                  ? undefined
                  : {
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }
              }
            >
              Waiting for realtime room state...
            </motion.p>
            <p className="text-sm text-amber-100/90">
              {status === "disconnected"
                ? "Room storage did not initialize. Check LIVEBLOCKS_SECRET_KEY in .env.local and restart dev server."
                : "Connecting to Liveblocks and loading shared storage."}
            </p>
          </Card>
        </motion.div>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {storageReady && roomMode === "grooming" ? (
          <motion.div
            key="mode-grooming"
            layout
            variants={modeSwap}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <PlanningMode
              players={players}
              taskInput={planning?.taskInput ?? ""}
              issueKey={planning?.issueKey ?? null}
              votes={votes}
              isRevealed={planning?.isRevealed ?? false}
              myVote={myVote}
              disabled={!storageReady}
              onTaskChange={updateTask}
              onVoteSelect={(vote) => castVote(currentUserId, vote)}
              onRevealVotes={revealVotes}
              onResetRound={resetRound}
              onClearTask={clearTask}
            />
          </motion.div>
        ) : null}

        {storageReady && roomMode === "retro" ? (
          <motion.div
            key="mode-retro"
            layout
            variants={modeSwap}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <RetroMode
              notes={retroNotes}
              currentUserId={currentUserId}
              onAddNote={(column, text) =>
                addRetroNote({
                  text,
                  column,
                  authorId: currentUserId,
                  authorNickname: currentNickname,
                  authorColor: currentColor,
                })
              }
              onEditNote={(noteId, text) =>
                editRetroNote({
                  noteId,
                  userId: currentUserId,
                  text,
                })
              }
              onDeleteNote={(noteId) =>
                deleteRetroNote({
                  noteId,
                  userId: currentUserId,
                })
              }
              onToggleUpvote={(noteId) =>
                toggleRetroUpvote({
                  noteId,
                  userId: currentUserId,
                })
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
