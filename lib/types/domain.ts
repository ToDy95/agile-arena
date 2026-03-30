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

export const PLANNING_FINAL_ESTIMATE_VALUES = PLANNING_VOTE_VALUES.filter(
  (value) => value !== "taco",
) as readonly Exclude<PlanningVoteValue, "taco">[];

export type PlanningFinalEstimateValue = (typeof PLANNING_FINAL_ESTIMATE_VALUES)[number];

export const PLANNING_METRIC_VALUES = [1, 2, 3, 4, 5] as const;

export type PlanningMetricValue = (typeof PLANNING_METRIC_VALUES)[number];

export type PlanningEstimate = {
  storyPoints: PlanningVoteValue;
  complexity: PlanningMetricValue | null;
  timeConsuming: PlanningMetricValue | null;
  researchUnknowns?: PlanningMetricValue | null;
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
  issueUrl: string | null;
};

export type PlanningFinalizedTask = {
  id: string;
  taskKey: string | null;
  taskUrl: string | null;
  taskTitle: string;
  lowerBound: number | null;
  average: number | null;
  upperBound: number | null;
  finalEstimate: PlanningFinalEstimateValue;
  interpretationLabel: string;
  interpretationEmoji: string;
  finalizedAt: number;
  finalizedBy: string;
  finalizedByName: string;
};

export type PlanningRoomState = {
  task: PlanningTask;
  isRevealed: boolean;
  votes: Record<string, PlanningEstimate>;
  manualFinalEstimate: PlanningFinalEstimateValue | null;
  finalizedTasks: PlanningFinalizedTask[];
};

export type RetroNoteVoteMap = Record<string, true>;

export const RETRO_NOTE_STATUSES = ["open", "solved"] as const;

export type RetroNoteStatus = (typeof RETRO_NOTE_STATUSES)[number];

export type RetroNote = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  isAnonymous: boolean;
  column: RetroColumn;
  createdAt: number;
  updatedAt: number;
  status: RetroNoteStatus;
  upvotes: RetroNoteVoteMap;
};

export type RetroRoomState = {
  notes: RetroNote[];
};
