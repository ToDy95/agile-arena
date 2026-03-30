import { LiveMap, LiveObject } from "@liveblocks/client";
import type { RetroNoteStorage, RoomStorage } from "@/lib/liveblocks/types";
import type { PlanningEstimate, RoomMode } from "@/lib/types/domain";

export function createInitialStorage(mode: RoomMode = "grooming"): RoomStorage {
  return {
    mode,
    planning: new LiveObject({
      taskInput: "",
      issueKey: null,
      isRevealed: false,
      votes: new LiveMap<string, PlanningEstimate>(),
    }),
    retro: new LiveObject({
      notes: new LiveMap<string, LiveObject<RetroNoteStorage>>(),
    }),
  };
}
