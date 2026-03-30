import type { PlanningEstimate, RetroNote } from "@/lib/types/domain";
import {
  calculatePlanningAverages,
  derivePlanningMood,
  formatVoteAverage,
} from "@/lib/utils/votes";

type SessionExportPlayer = {
  userId: string;
  nickname: string;
  vote: PlanningEstimate | null;
};

export type SessionExportSnapshot = {
  roomId: string;
  roomOwnerId: string | null;
  roomOwnerName: string;
  exportedAt: number;
  planning: {
    taskInput: string;
    issueKey: string | null;
    isRevealed: boolean;
    votes: ReadonlyMap<string, PlanningEstimate>;
    players: SessionExportPlayer[];
  };
  retro: {
    anonymousMode: boolean;
    sessionNotes: string;
    notes: RetroNote[];
  };
};

const EXPORT_COLUMNS = [
  "section",
  "recordType",
  "roomId",
  "roomOwner",
  "exportedAt",
  "taskIssueKey",
  "taskInput",
  "planningRevealed",
  "avgStoryPoints",
  "avgComplexity",
  "avgTimeConsuming",
  "taskMood",
  "participantId",
  "participantName",
  "participantStoryPoints",
  "participantComplexity",
  "participantTimeConsuming",
  "retroAnonymousMode",
  "sessionNotes",
  "noteId",
  "noteColumn",
  "noteText",
  "noteStatus",
  "noteUpvotes",
  "noteAuthor",
  "noteCreatedAt",
  "noteUpdatedAt",
  "actionItems",
] as const;

type ExportRow = Partial<Record<(typeof EXPORT_COLUMNS)[number], string | number | boolean | null>>;

function toIso(value: number): string {
  return new Date(value).toISOString();
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value);

  if (!/[",\n]/.test(normalized)) {
    return normalized;
  }

  return `"${normalized.replace(/"/g, '""')}"`;
}

function rowToCsv(row: ExportRow): string {
  return EXPORT_COLUMNS.map((column) => csvEscape(row[column])).join(",");
}

export function buildSessionExportCsv(snapshot: SessionExportSnapshot): string {
  const rows: ExportRow[] = [];
  const planningVotes = Array.from(snapshot.planning.votes.values());
  const planningAverages = calculatePlanningAverages(planningVotes);
  const actionItems = snapshot.retro.notes
    .filter((note) => note.column === "actionItems")
    .map((note) => note.text)
    .join(" | ");

  rows.push({
    section: "grooming",
    recordType: "summary",
    roomId: snapshot.roomId,
    roomOwner: snapshot.roomOwnerName,
    exportedAt: toIso(snapshot.exportedAt),
    taskIssueKey: snapshot.planning.issueKey,
    taskInput: snapshot.planning.taskInput,
    planningRevealed: snapshot.planning.isRevealed,
    avgStoryPoints: formatVoteAverage(planningAverages.storyPoints),
    avgComplexity: formatVoteAverage(planningAverages.complexity),
    avgTimeConsuming: formatVoteAverage(planningAverages.timeConsuming),
    taskMood: derivePlanningMood(planningAverages),
  });

  snapshot.planning.players.forEach((player) => {
    rows.push({
      section: "grooming",
      recordType: "participant",
      roomId: snapshot.roomId,
      roomOwner: snapshot.roomOwnerName,
      exportedAt: toIso(snapshot.exportedAt),
      taskIssueKey: snapshot.planning.issueKey,
      taskInput: snapshot.planning.taskInput,
      planningRevealed: snapshot.planning.isRevealed,
      participantId: player.userId,
      participantName: player.nickname,
      participantStoryPoints: player.vote?.storyPoints ?? "",
      participantComplexity: player.vote?.complexity ?? "",
      participantTimeConsuming: player.vote?.timeConsuming ?? "",
    });
  });

  rows.push({
    section: "retro",
    recordType: "settings",
    roomId: snapshot.roomId,
    roomOwner: snapshot.roomOwnerName,
    exportedAt: toIso(snapshot.exportedAt),
    retroAnonymousMode: snapshot.retro.anonymousMode,
    sessionNotes: snapshot.retro.sessionNotes,
    actionItems,
  });

  snapshot.retro.notes.forEach((note) => {
    rows.push({
      section: "retro",
      recordType: "note",
      roomId: snapshot.roomId,
      roomOwner: snapshot.roomOwnerName,
      exportedAt: toIso(snapshot.exportedAt),
      retroAnonymousMode: snapshot.retro.anonymousMode,
      sessionNotes: snapshot.retro.sessionNotes,
      noteId: note.id,
      noteColumn: note.column,
      noteText: note.text,
      noteStatus: note.status,
      noteUpvotes: Object.keys(note.upvotes).length,
      noteAuthor: note.authorNickname,
      noteCreatedAt: toIso(note.createdAt),
      noteUpdatedAt: toIso(note.updatedAt),
      actionItems,
    });
  });

  const header = EXPORT_COLUMNS.join(",");
  const body = rows.map(rowToCsv).join("\n");

  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.setAttribute("href", url);
  anchor.setAttribute("download", filename);
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => URL.revokeObjectURL(url), 200);
}

export function createSessionExportFilename(roomId: string): string {
  const suffix = new Date().toISOString().replace(/[:.]/g, "-");
  return `agile-arena-${roomId}-${suffix}.csv`;
}
