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
  buildSessionExportCsv,
  createSessionExportFilename,
  downloadCsv,
} from "@/lib/export/session-export";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useSelf,
  useStatus,
  useStorage,
  useUpdateMyPresence,
} from "@/lib/liveblocks/room-context";
import type { PlanningFinalizedTaskStorage, RetroNoteStorage } from "@/lib/liveblocks/types";
import { normalizePlanningTaskInput } from "@/lib/schemas/planning";
import {
  PLANNING_VOTE_VALUES,
  type PlanningEstimate,
  type PlanningFinalEstimateValue,
  type PlanningFinalizedTask,
  type PlanningMetricValue,
  type RetroNote,
  type RoomMode,
} from "@/lib/types/domain";
import { normalizeHexColor } from "@/lib/utils/color";
import { extractJiraIssueKey, extractJiraIssueUrl } from "@/lib/utils/jira";

type RoomExperienceProps = {
  roomId: string;
  currentUserId: string;
  currentNickname: string;
  currentColor: string;
  onLeaveRoom: () => void;
  onResetIdentity: () => void;
  onLocalReset: () => void;
};

function resolvePlayerColor(color: string | undefined): string {
  return normalizeHexColor(color ?? "") ?? "#38BDF8";
}

function isPlanningMetricValue(value: unknown): value is PlanningMetricValue {
  return typeof value === "number" && value >= 1 && value <= 5;
}

function isPlanningVoteValue(value: unknown): value is PlanningEstimate["storyPoints"] {
  return (
    typeof value === "string" &&
    PLANNING_VOTE_VALUES.includes(value as (typeof PLANNING_VOTE_VALUES)[number])
  );
}

function isPlanningFinalEstimateValue(value: unknown): value is PlanningFinalEstimateValue {
  return (
    typeof value === "string" &&
    value !== "taco" &&
    PLANNING_VOTE_VALUES.includes(value as (typeof PLANNING_VOTE_VALUES)[number])
  );
}

function normalizePlanningEstimate(value: unknown): PlanningEstimate | null {
  if (isPlanningVoteValue(value)) {
    const isPass = value === "taco";

    return {
      storyPoints: value,
      complexity: isPass ? null : 3,
      timeConsuming: isPass ? null : 3,
    };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    storyPoints?: unknown;
    complexity?: unknown;
    timeConsuming?: unknown;
    researchUnknowns?: unknown;
  };

  if (!isPlanningVoteValue(candidate.storyPoints)) {
    return null;
  }

  const isPass = candidate.storyPoints === "taco";
  const complexity =
    candidate.complexity === null
      ? isPass
        ? null
        : 3
      : isPlanningMetricValue(candidate.complexity)
        ? candidate.complexity
        : isPass
          ? null
          : 3;
  const timeConsuming =
    candidate.timeConsuming === null
      ? isPass
        ? null
        : 3
      : isPlanningMetricValue(candidate.timeConsuming)
        ? candidate.timeConsuming
        : isPass
          ? null
          : 3;

  return {
    storyPoints: candidate.storyPoints,
    complexity,
    timeConsuming,
    researchUnknowns:
      candidate.researchUnknowns === null
        ? null
        : isPlanningMetricValue(candidate.researchUnknowns)
          ? candidate.researchUnknowns
          : undefined,
  };
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
  onLeaveRoom,
  onResetIdentity,
  onLocalReset,
}: RoomExperienceProps) {
  const { reducedMotion } = useMotionPreferences();
  const itemReveal = getItemRevealVariants(reducedMotion);
  const modeSwap = getModeSwapVariants(reducedMotion);
  const status = useStatus();
  const roomMode = useStorage((root) => root.mode) ?? "grooming";
  const roomOwnerId = useStorage((root) => root.roomOwnerId) ?? null;
  const sessionNotes = useStorage((root) => root.retro.sessionNotes) ?? "";
  const planning = useStorage((root) => root.planning);
  const facilitatorParticipates =
    useStorage((root) => root.planning.facilitatorParticipates) ?? false;
  const manualFinalEstimateRaw = useStorage((root) => root.planning.manualFinalEstimate);
  const estimatedTasksMap = useStorage((root) => root.planning.estimatedTasks);
  const retroNotesMap = useStorage((root) => root.retro.notes);
  const others = useOthers();
  const self = useSelf();
  const [myPresence] = useMyPresence();
  const updateMyPresence = useUpdateMyPresence();

  const votes = useMemo(() => {
    const normalizedVotes = new Map<string, PlanningEstimate>();

    if (!planning?.votes) {
      return normalizedVotes as ReadonlyMap<string, PlanningEstimate>;
    }

    planning.votes.forEach((value, userId) => {
      const estimate = normalizePlanningEstimate(value);

      if (estimate) {
        normalizedVotes.set(userId, estimate);
      }
    });

    return normalizedVotes as ReadonlyMap<string, PlanningEstimate>;
  }, [planning?.votes]);

  const manualFinalEstimate = isPlanningFinalEstimateValue(manualFinalEstimateRaw)
    ? manualFinalEstimateRaw
    : null;

  const myVote = votes.get(currentUserId) ?? null;
  const storageReady = planning !== null && estimatedTasksMap !== null && retroNotesMap !== null;
  const isOwner = roomOwnerId === currentUserId;

  const setMode = useMutation(({ storage, setMyPresence }, nextMode: RoomMode) => {
    storage.set("mode", nextMode);
    setMyPresence({ mode: nextMode });
  }, []);

  const ensureRoomMetadata = useMutation(({ storage }, userId: string) => {
    if (!storage.get("roomOwnerId")) {
      storage.set("roomOwnerId", userId);
    }

    const planningRoot = storage.get("planning");
    if (planningRoot.get("taskUrl") === undefined) {
      planningRoot.set("taskUrl", null);
    }
    if (planningRoot.get("facilitatorParticipates") === undefined) {
      planningRoot.set("facilitatorParticipates", false);
    }
    if (planningRoot.get("manualFinalEstimate") === undefined) {
      planningRoot.set("manualFinalEstimate", null);
    }
    if (planningRoot.get("estimatedTasks") === undefined) {
      planningRoot.set(
        "estimatedTasks",
        new LiveMap<string, LiveObject<PlanningFinalizedTaskStorage>>(),
      );
    }

    const retroRoot = storage.get("retro");
    const notesMap = retroRoot.get("notes");

    if (retroRoot.get("sessionNotes") === undefined) {
      retroRoot.set("sessionNotes", "");
    }

    notesMap.forEach((note) => {
      if (note.get("status") === undefined) {
        note.set("status", "open");
      }

      if (note.get("isAnonymous") === undefined) {
        note.set("isAnonymous", true);
      }

      if (note.get("authorName") === undefined) {
        note.set("authorName", "Player");
      }
    });
  }, []);

  const updateTask = useMutation(({ storage }, input: string) => {
    const planningRoot = storage.get("planning");
    const normalizedInput = normalizePlanningTaskInput(input);
    planningRoot.set("taskInput", normalizedInput);
    planningRoot.set("issueKey", extractJiraIssueKey(normalizedInput));
    planningRoot.set("taskUrl", extractJiraIssueUrl(normalizedInput));
  }, []);

  const clearTask = useMutation(({ storage }, userId: string) => {
    if (storage.get("roomOwnerId") !== userId) {
      return;
    }

    const planningRoot = storage.get("planning");
    planningRoot.set("taskInput", "");
    planningRoot.set("issueKey", null);
    planningRoot.set("taskUrl", null);
    planningRoot.set("manualFinalEstimate", null);
  }, []);

  const castVote = useMutation(
    ({ storage, setMyPresence }, userId: string, vote: PlanningEstimate) => {
      const planningRoot = storage.get("planning");
      const voteMap = planningRoot.get("votes");
      const roomOwnerIdInStorage = storage.get("roomOwnerId");
      const facilitatorParticipatesInStorage = planningRoot.get("facilitatorParticipates") === true;
      const facilitatorVote: PlanningEstimate = {
        storyPoints: "taco",
        complexity: null,
        timeConsuming: null,
      };
      const normalizedVote =
        roomOwnerIdInStorage === userId && !facilitatorParticipatesInStorage
          ? facilitatorVote
          : vote;

      voteMap.set(userId, normalizedVote);
      planningRoot.set("isRevealed", false);
      planningRoot.set("manualFinalEstimate", null);
      setMyPresence({ hasVoted: true });
    },
    [],
  );

  const ensureFacilitatorPass = useMutation(({ storage, setMyPresence }, userId: string) => {
    const roomOwnerIdInStorage = storage.get("roomOwnerId");

    if (roomOwnerIdInStorage !== userId) {
      return;
    }

    const planningRoot = storage.get("planning");
    const facilitatorParticipatesInStorage = planningRoot.get("facilitatorParticipates") === true;

    if (facilitatorParticipatesInStorage) {
      return;
    }

    const voteMap = planningRoot.get("votes");
    const existingVote = normalizePlanningEstimate(voteMap.get(userId));

    if (
      existingVote?.storyPoints === "taco" &&
      existingVote.complexity === null &&
      existingVote.timeConsuming === null
    ) {
      setMyPresence({ hasVoted: true });
      return;
    }

    voteMap.set(userId, {
      storyPoints: "taco",
      complexity: null,
      timeConsuming: null,
    });
    planningRoot.set("manualFinalEstimate", null);
    setMyPresence({ hasVoted: true });
  }, []);

  const setFacilitatorParticipation = useMutation(
    ({ storage, setMyPresence }, payload: { userId: string; participates: boolean }) => {
      if (storage.get("roomOwnerId") !== payload.userId) {
        return;
      }

      const planningRoot = storage.get("planning");
      const voteMap = planningRoot.get("votes");
      planningRoot.set("facilitatorParticipates", payload.participates);
      planningRoot.set("isRevealed", false);
      planningRoot.set("manualFinalEstimate", null);

      if (payload.participates) {
        voteMap.delete(payload.userId);
        setMyPresence({ hasVoted: false });
        return;
      }

      voteMap.set(payload.userId, {
        storyPoints: "taco",
        complexity: null,
        timeConsuming: null,
      });
      setMyPresence({ hasVoted: true });
    },
    [],
  );

  const setManualFinalEstimate = useMutation(
    ({ storage }, payload: { userId: string; value: PlanningFinalEstimateValue | null }) => {
      if (storage.get("roomOwnerId") !== payload.userId) {
        return;
      }

      storage.get("planning").set("manualFinalEstimate", payload.value);
    },
    [],
  );

  const revealVotes = useMutation(({ storage }, userId: string) => {
    if (storage.get("roomOwnerId") !== userId) {
      return;
    }

    storage.get("planning").set("isRevealed", true);
  }, []);

  const resetRound = useMutation(({ storage, setMyPresence }, userId: string) => {
    if (storage.get("roomOwnerId") !== userId) {
      return;
    }

    const planningRoot = storage.get("planning");
    const voteMap = planningRoot.get("votes");
    const facilitatorParticipatesInStorage = planningRoot.get("facilitatorParticipates") === true;

    for (const key of voteMap.keys()) {
      voteMap.delete(key);
    }

    planningRoot.set("isRevealed", false);
    planningRoot.set("manualFinalEstimate", null);

    if (facilitatorParticipatesInStorage) {
      setMyPresence({ hasVoted: false });
      return;
    }

    voteMap.set(userId, {
      storyPoints: "taco",
      complexity: null,
      timeConsuming: null,
    });
    setMyPresence({ hasVoted: true });
  }, []);

  const nextTask = useMutation(({ storage, setMyPresence }, userId: string) => {
    if (storage.get("roomOwnerId") !== userId) {
      return;
    }

    const planningRoot = storage.get("planning");
    const voteMap = planningRoot.get("votes");
    const facilitatorParticipatesInStorage = planningRoot.get("facilitatorParticipates") === true;

    for (const key of voteMap.keys()) {
      voteMap.delete(key);
    }

    planningRoot.set("taskInput", "");
    planningRoot.set("issueKey", null);
    planningRoot.set("taskUrl", null);
    planningRoot.set("isRevealed", false);
    planningRoot.set("manualFinalEstimate", null);

    if (facilitatorParticipatesInStorage) {
      setMyPresence({ hasVoted: false });
      return;
    }

    voteMap.set(userId, {
      storyPoints: "taco",
      complexity: null,
      timeConsuming: null,
    });
    setMyPresence({ hasVoted: true });
  }, []);

  const finalizeTask = useMutation(
    (
      { storage, setMyPresence },
      payload: {
        userId: string;
        finalizedByName: string;
        finalEstimate: PlanningFinalEstimateValue;
        lowerBound: number | null;
        average: number | null;
        upperBound: number | null;
        interpretationLabel: string;
        interpretationEmoji: string;
      },
    ) => {
      if (storage.get("roomOwnerId") !== payload.userId) {
        return;
      }

      const planningRoot = storage.get("planning");

      if (!planningRoot.get("isRevealed")) {
        return;
      }

      const voteMap = planningRoot.get("votes");
      const taskId = crypto.randomUUID();
      const taskInput = planningRoot.get("taskInput").trim();
      const issueKey = planningRoot.get("issueKey");
      const taskUrl = planningRoot.get("taskUrl");
      const fallbackTitle =
        taskInput.length > 0 ? taskInput : (issueKey ?? `Task ${new Date().toISOString()}`);

      planningRoot.get("estimatedTasks").set(
        taskId,
        new LiveObject<PlanningFinalizedTaskStorage>({
          id: taskId,
          taskKey: issueKey,
          taskUrl,
          taskTitle: fallbackTitle,
          lowerBound: payload.lowerBound,
          average: payload.average,
          upperBound: payload.upperBound,
          finalEstimate: payload.finalEstimate,
          interpretationLabel: payload.interpretationLabel,
          interpretationEmoji: payload.interpretationEmoji,
          finalizedAt: Date.now(),
          finalizedBy: payload.userId,
          finalizedByName: payload.finalizedByName,
        }),
      );

      for (const key of voteMap.keys()) {
        voteMap.delete(key);
      }

      planningRoot.set("taskInput", "");
      planningRoot.set("issueKey", null);
      planningRoot.set("taskUrl", null);
      planningRoot.set("isRevealed", false);
      planningRoot.set("manualFinalEstimate", null);

      const facilitatorParticipatesInStorage = planningRoot.get("facilitatorParticipates") === true;

      if (facilitatorParticipatesInStorage) {
        setMyPresence({ hasVoted: false });
        return;
      }

      voteMap.set(payload.userId, {
        storyPoints: "taco",
        complexity: null,
        timeConsuming: null,
      });
      setMyPresence({ hasVoted: true });
    },
    [],
  );

  const updateSessionNotes = useMutation(
    ({ storage }, payload: { userId: string; value: string }) => {
      if (storage.get("roomOwnerId") !== payload.userId) {
        return;
      }

      storage.get("retro").set("sessionNotes", payload.value);
    },
    [],
  );

  const addRetroNote = useMutation(
    (
      { storage },
      note: {
        text: string;
        column: RetroNote["column"];
        isAnonymous: boolean;
        authorId: string;
        authorName: string;
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
          status: "open",
          isAnonymous: note.isAnonymous,
          authorId: note.authorId,
          authorName: note.authorName,
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

  const toggleRetroSolved = useMutation(
    ({ storage }, payload: { noteId: string; userId: string; solved: boolean }) => {
      if (storage.get("roomOwnerId") !== payload.userId) {
        return;
      }

      const note = storage.get("retro").get("notes").get(payload.noteId);

      if (!note) {
        return;
      }

      note.set("status", payload.solved ? "solved" : "open");
      note.set("updatedAt", Date.now());
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

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    ensureRoomMetadata(currentUserId);
  }, [currentUserId, ensureRoomMetadata, storageReady]);

  useEffect(() => {
    if (!storageReady || !isOwner || facilitatorParticipates) {
      return;
    }

    ensureFacilitatorPass(currentUserId);
  }, [currentUserId, ensureFacilitatorPass, facilitatorParticipates, isOwner, storageReady]);

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
          isOwner: roomOwnerId === userId,
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
  }, [others, roomOwnerId, self, votes]);

  const estimatedTasks = useMemo<PlanningFinalizedTask[]>(() => {
    if (!estimatedTasksMap) {
      return [];
    }

    return Array.from(estimatedTasksMap.values())
      .map((task) => ({
        id: task.id,
        taskKey: task.taskKey ?? null,
        taskUrl: task.taskUrl ?? null,
        taskTitle: task.taskTitle,
        lowerBound: task.lowerBound ?? null,
        average: task.average ?? null,
        upperBound: task.upperBound ?? null,
        finalEstimate: task.finalEstimate,
        interpretationLabel: task.interpretationLabel,
        interpretationEmoji: task.interpretationEmoji,
        finalizedAt: task.finalizedAt,
        finalizedBy: task.finalizedBy,
        finalizedByName: task.finalizedByName,
      }))
      .sort((a, b) => a.finalizedAt - b.finalizedAt);
  }, [estimatedTasksMap]);

  const retroNotes = useMemo<RetroNote[]>(() => {
    if (!retroNotesMap) {
      return [];
    }

    return Array.from(retroNotesMap.values())
      .map((note) => {
        const upvotes: RetroNote["upvotes"] = {};
        const status: RetroNote["status"] = note.status === "solved" ? "solved" : "open";
        const isAnonymous = note.isAnonymous !== false;
        const authorName =
          typeof note.authorName === "string" && note.authorName.trim().length > 0
            ? note.authorName
            : "Player";

        note.upvotes.forEach((isUpvoted, userId) => {
          if (isUpvoted) {
            upvotes[userId] = true;
          }
        });

        return {
          id: note.id,
          text: note.text,
          authorId: note.authorId,
          authorName,
          authorColor: note.authorColor,
          isAnonymous,
          column: note.column,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          upvotes,
          status,
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [retroNotesMap]);

  const roomOwnerName = useMemo(() => {
    if (!roomOwnerId) {
      return "Unassigned";
    }

    const owner = players.find((player) => player.userId === roomOwnerId);

    if (owner) {
      return owner.nickname;
    }

    return roomOwnerId === currentUserId ? currentNickname : "Owner";
  }, [currentNickname, currentUserId, players, roomOwnerId]);

  const exportSessionCsv = () => {
    if (!isOwner) {
      return;
    }

    const csv = buildSessionExportCsv({
      roomId,
      roomOwnerId,
      roomOwnerName,
      exportedAt: Date.now(),
      planning: {
        taskInput: planning?.taskInput ?? "",
        issueKey: planning?.issueKey ?? null,
        taskUrl: planning?.taskUrl ?? null,
        isRevealed: planning?.isRevealed ?? false,
        facilitatorParticipates,
        manualFinalEstimate,
        finalizedTasks: estimatedTasks,
        votes,
        players: players.map((player) => ({
          userId: player.userId,
          nickname: player.nickname,
          vote: player.vote,
        })),
      },
      retro: {
        sessionNotes,
        notes: retroNotes,
      },
    });

    downloadCsv(createSessionExportFilename(roomId), csv);
  };

  return (
    <motion.div layout className="space-y-4 overflow-x-clip">
      <RoomHeader
        roomId={roomId}
        status={mapStatusLabel(status)}
        roomOwnerName={roomOwnerName}
        isCurrentUserOwner={isOwner}
        onExportCsv={exportSessionCsv}
        onLeaveRoom={onLeaveRoom}
        onResetIdentity={onResetIdentity}
        onLocalReset={onLocalReset}
      />
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
              canManageRound={isOwner}
              isCurrentUserFacilitator={isOwner}
              facilitatorParticipates={facilitatorParticipates}
              manualFinalEstimate={manualFinalEstimate}
              estimatedTasks={estimatedTasks}
              disabled={!storageReady}
              onTaskChange={updateTask}
              onVoteSelect={(vote) => castVote(currentUserId, vote)}
              onRevealVotes={() => revealVotes(currentUserId)}
              onResetRound={() => resetRound(currentUserId)}
              onClearTask={() => clearTask(currentUserId)}
              onNextTask={() => nextTask(currentUserId)}
              onFinalizeTask={(payload) =>
                finalizeTask({
                  userId: currentUserId,
                  finalizedByName: currentNickname,
                  ...payload,
                })
              }
              onFacilitatorParticipationChange={(participates) =>
                setFacilitatorParticipation({
                  userId: currentUserId,
                  participates,
                })
              }
              onManualFinalEstimateChange={(value) =>
                setManualFinalEstimate({
                  userId: currentUserId,
                  value,
                })
              }
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
              isOwner={isOwner}
              sessionNotes={sessionNotes}
              onAddNote={(column, text, isAnonymous) =>
                addRetroNote({
                  text,
                  column,
                  isAnonymous,
                  authorId: currentUserId,
                  authorName: currentNickname,
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
              onToggleSolved={(noteId, solved) =>
                toggleRetroSolved({
                  noteId,
                  userId: currentUserId,
                  solved,
                })
              }
              onUpdateSessionNotes={(value) =>
                updateSessionNotes({
                  userId: currentUserId,
                  value,
                })
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
