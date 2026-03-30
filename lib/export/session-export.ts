import type {
  PlanningEstimate,
  PlanningFinalEstimateValue,
  PlanningFinalizedTask,
  RetroNote,
} from "@/lib/types/domain";
import {
  calculatePlanningAverages,
  calculateStoryPointSummary,
  derivePlanningMood,
  formatVoteAverage,
  resolveFinalEstimate,
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
    taskUrl: string | null;
    isRevealed: boolean;
    facilitatorParticipates: boolean;
    manualFinalEstimate: PlanningFinalEstimateValue | null;
    finalizedTasks: PlanningFinalizedTask[];
    votes: ReadonlyMap<string, PlanningEstimate>;
    players: SessionExportPlayer[];
  };
  retro: {
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
  "taskUrl",
  "planningRevealed",
  "facilitatorParticipates",
  "storyPointLower",
  "avgStoryPoints",
  "storyPointUpper",
  "suggestedEstimate",
  "manualFinalEstimate",
  "finalEstimate",
  "avgComplexity",
  "avgTimeConsuming",
  "taskMood",
  "finalizedTaskId",
  "finalizedTaskKey",
  "finalizedTaskUrl",
  "finalizedTaskTitle",
  "finalizedLowerBound",
  "finalizedAverage",
  "finalizedUpperBound",
  "finalizedEstimate",
  "finalizedInterpretation",
  "finalizedBy",
  "finalizedAt",
  "participantId",
  "participantName",
  "participantStoryPoints",
  "participantComplexity",
  "participantTimeConsuming",
  "sessionNotes",
  "noteId",
  "noteColumn",
  "noteText",
  "noteStatus",
  "noteIsAnonymous",
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
  const storyPointSummary = calculateStoryPointSummary(
    planningVotes.map((vote) => vote.storyPoints),
  );
  const finalEstimate = resolveFinalEstimate(
    storyPointSummary.suggestedEstimate,
    snapshot.planning.manualFinalEstimate,
  );
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
    taskUrl: snapshot.planning.taskUrl,
    planningRevealed: snapshot.planning.isRevealed,
    facilitatorParticipates: snapshot.planning.facilitatorParticipates,
    storyPointLower: storyPointSummary.lowerBound,
    avgStoryPoints: formatVoteAverage(planningAverages.storyPoints),
    storyPointUpper: storyPointSummary.upperBound,
    suggestedEstimate: storyPointSummary.suggestedEstimate,
    manualFinalEstimate: snapshot.planning.manualFinalEstimate,
    finalEstimate,
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
      taskUrl: snapshot.planning.taskUrl,
      planningRevealed: snapshot.planning.isRevealed,
      facilitatorParticipates: snapshot.planning.facilitatorParticipates,
      storyPointLower: storyPointSummary.lowerBound,
      avgStoryPoints: formatVoteAverage(planningAverages.storyPoints),
      storyPointUpper: storyPointSummary.upperBound,
      suggestedEstimate: storyPointSummary.suggestedEstimate,
      manualFinalEstimate: snapshot.planning.manualFinalEstimate,
      finalEstimate,
      participantId: player.userId,
      participantName: player.nickname,
      participantStoryPoints: player.vote?.storyPoints ?? "",
      participantComplexity: player.vote?.complexity ?? "",
      participantTimeConsuming: player.vote?.timeConsuming ?? "",
    });
  });

  snapshot.planning.finalizedTasks.forEach((task) => {
    rows.push({
      section: "grooming",
      recordType: "finalizedTask",
      roomId: snapshot.roomId,
      roomOwner: snapshot.roomOwnerName,
      exportedAt: toIso(snapshot.exportedAt),
      finalizedTaskId: task.id,
      finalizedTaskKey: task.taskKey,
      finalizedTaskUrl: task.taskUrl,
      finalizedTaskTitle: task.taskTitle,
      finalizedLowerBound: task.lowerBound,
      finalizedAverage:
        task.average === null
          ? ""
          : Number.isInteger(task.average)
            ? String(task.average)
            : task.average.toFixed(1),
      finalizedUpperBound: task.upperBound,
      finalizedEstimate: task.finalEstimate,
      finalizedInterpretation: `${task.interpretationEmoji} ${task.interpretationLabel}`,
      finalizedBy: task.finalizedByName,
      finalizedAt: toIso(task.finalizedAt),
    });
  });

  rows.push({
    section: "retro",
    recordType: "settings",
    roomId: snapshot.roomId,
    roomOwner: snapshot.roomOwnerName,
    exportedAt: toIso(snapshot.exportedAt),
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
      sessionNotes: snapshot.retro.sessionNotes,
      noteId: note.id,
      noteColumn: note.column,
      noteText: note.text,
      noteStatus: note.status,
      noteIsAnonymous: note.isAnonymous,
      noteUpvotes: Object.keys(note.upvotes).length,
      noteAuthor: note.authorName,
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
