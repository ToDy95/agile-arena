import { LiveMap, LiveObject } from "@liveblocks/client";

import type { RoomMode } from "@/lib/types/domain";
import type { RoomStorage } from "@/lib/liveblocks/types";

export function createInitialStorage(mode: RoomMode = "grooming"): RoomStorage {
  return {
    mode,
    planning: new LiveObject({
      taskInput: "",
      issueKey: null,
      isRevealed: false,
      votes: new LiveMap(),
    }),
    retro: new LiveObject({
      notes: new LiveMap(),
    }),
  };
}
