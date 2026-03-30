export const ROOM_MODES = ["grooming", "retro"] as const;

export type RoomMode = (typeof ROOM_MODES)[number];

export const PLANNING_VOTE_VALUES = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "?",
  "taco",
] as const;

export type PlanningVoteValue = (typeof PLANNING_VOTE_VALUES)[number];

export const PLANNING_METRIC_VALUES = [1, 2, 3, 4, 5] as const;

export type PlanningMetricValue = (typeof PLANNING_METRIC_VALUES)[number];

export type PlanningEstimate = {
  storyPoints: PlanningVoteValue;
  complexity: PlanningMetricValue;
  timeConsuming: PlanningMetricValue;
  researchUnknowns?: PlanningMetricValue;
};

export const RETRO_COLUMNS = ["wentWell", "toImprove", "actionItems"] as const;

export type RetroColumn = (typeof RETRO_COLUMNS)[number];

export type UserIdentity = {
  userId: string;
  nickname: string;
  color: string;
};

export type RoomPresence = UserIdentity & {
  mode?: RoomMode;
  hasVoted: boolean;
};

export type PlanningTask = {
  input: string;
  issueKey: string | null;
};

export type PlanningRoomState = {
  task: PlanningTask;
  isRevealed: boolean;
  votes: Record<string, PlanningEstimate>;
};

export type RetroNoteVoteMap = Record<string, true>;

export type RetroNote = {
  id: string;
  text: string;
  authorId: string;
  authorNickname: string;
  authorColor: string;
  column: RetroColumn;
  createdAt: number;
  updatedAt: number;
  upvotes: RetroNoteVoteMap;
};

export type RetroRoomState = {
  notes: RetroNote[];
};
