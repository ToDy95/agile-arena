import type { LiveMap, LiveObject } from "@liveblocks/client";

import type { PlanningVoteValue, RetroColumn, RoomMode, RoomPresence } from "@/lib/types/domain";

export type RoomUserInfo = {
  nickname: string;
  color: string;
};

export type RoomUserMeta = {
  id: string;
  info: RoomUserInfo;
};

export type PlanningStorage = LiveObject<{
  taskInput: string;
  issueKey: string | null;
  isRevealed: boolean;
  votes: LiveMap<string, PlanningVoteValue>;
}>;

export type RetroNoteStorage = {
  id: string;
  text: string;
  authorId: string;
  authorNickname: string;
  authorColor: string;
  column: RetroColumn;
  createdAt: number;
  updatedAt: number;
  upvotes: LiveMap<string, boolean>;
};

export type RetroStorage = LiveObject<{
  notes: LiveMap<string, LiveObject<RetroNoteStorage>>;
}>;

export type RoomStorage = {
  mode: RoomMode;
  planning: PlanningStorage;
  retro: RetroStorage;
};

export type Presence = RoomPresence;
