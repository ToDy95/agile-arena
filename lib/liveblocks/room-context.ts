"use client";

import { createRoomContext } from "@liveblocks/react";
import { liveblocksClient } from "@/lib/liveblocks/client";
import type { Presence, RoomStorage, RoomUserMeta } from "@/lib/liveblocks/types";

export const {
  RoomProvider,
  useMyPresence,
  useMutation,
  useOthers,
  useSelf,
  useStatus,
  useStorage,
  useUpdateMyPresence,
} = createRoomContext<Presence, RoomStorage, RoomUserMeta, never>(liveblocksClient);
