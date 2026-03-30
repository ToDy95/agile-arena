import { LiveMap, LiveObject } from "@liveblocks/client";
import type {
  PlanningFinalizedTaskStorage,
  RetroNoteStorage,
  RoomStorage,
} from "@/lib/liveblocks/types";
import type { PlanningEstimate, RoomMode } from "@/lib/types/domain";

export function createInitialStorage(mode: RoomMode = "grooming"): RoomStorage {
  return {
    roomOwnerId: null,
    mode,
    planning: new LiveObject({
      taskInput: "",
      issueKey: null,
      taskUrl: null,
      isRevealed: false,
      manualFinalEstimate: null,
      votes: new LiveMap<string, PlanningEstimate>(),
      estimatedTasks: new LiveMap<string, LiveObject<PlanningFinalizedTaskStorage>>(),
    }),
    retro: new LiveObject({
      sessionNotes: "",
      notes: new LiveMap<string, LiveObject<RetroNoteStorage>>(),
    }),
  };
}
