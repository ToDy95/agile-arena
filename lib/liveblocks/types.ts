import type { LiveMap, LiveObject } from "@liveblocks/client";

import type {
  PlanningEstimate,
  RetroColumn,
  RetroNoteStatus,
  RoomMode,
  RoomPresence,
  RoomSettings,
} from "@/lib/types/domain";

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
  votes: LiveMap<string, PlanningEstimate>;
}>;

export type RetroNoteStorage = {
  id: string;
  text: string;
  authorId: string;
  authorNickname: string;
  authorColor: string;
  column: RetroColumn;
  status: RetroNoteStatus;
  createdAt: number;
  updatedAt: number;
  upvotes: LiveMap<string, boolean>;
};

export type RetroStorage = LiveObject<{
  sessionNotes: string;
  notes: LiveMap<string, LiveObject<RetroNoteStorage>>;
}>;

export type RoomStorage = {
  roomOwnerId: string | null;
  settings: LiveObject<RoomSettings>;
  mode: RoomMode;
  planning: PlanningStorage;
  retro: RetroStorage;
};

export type Presence = RoomPresence;
