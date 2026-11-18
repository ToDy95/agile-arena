import { describe, expect, it } from "vitest";

import { buildSessionExportCsv, type SessionExportSnapshot } from "@/lib/export/session-export";

function snapshot(): SessionExportSnapshot {
  return {
    roomId: "fixture-room",
    roomOwnerId: "owner",
    roomOwnerName: "Fixture owner",
    exportedAt: 1_700_000_000_000,
    planning: {
      taskInput: "Fixture task",
      issueKey: null,
      taskUrl: null,
      isRevealed: false,
      manualFinalEstimate: null,
      finalizedTasks: [],
      votes: new Map(),
      players: [],
    },
    retro: { sessionNotes: "", notes: [] },
  };
}

// Read the resulting document as CSV, so quoted CR/LF and separators cannot
// silently become extra records or columns in the assertions below.
function readCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (character === "\r" || character === "\n")) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
    } else cell += character;
  }
  expect(quoted).toBe(false);
  row.push(cell);
  rows.push(row);
  for (const record of rows) expect(record).toHaveLength(rows[0].length);
  return rows;
}

describe("session CSV export", () => {
  it.each([
    "=1+1",
    "+SUM(1,2)",
    "-1+2",
    "@SUM(1,2)",
    "  =1+1",
    "\tvalue",
    "\rvalue",
    "\nvalue",
    "＝1+1",
    "＋1",
    "－1",
    "＠SUM(1,2)",
  ])("exports formula/control-leading owner text as a quoted literal: %j", (text) => {
    const input = snapshot();
    input.roomOwnerName = text;
    const csv = buildSessionExportCsv(input);
    const rows = readCsv(csv);
    const ownerColumn = rows[0].indexOf("roomOwner");
    expect(rows.slice(1).map((row) => row[ownerColumn])).toEqual([`'${text}`, `'${text}`]);
    expect(csv).toContain(`"'${text.replace(/"/g, '""')}"`);
  });

  it("uses the same literal boundary for participants, tasks, notes and action items", () => {
    const input = snapshot();
    input.planning.taskInput = '=HYPERLINK("https://example.invalid","task")';
    input.planning.players = [{ userId: "participant", nickname: "+SUM(1,2)", vote: null }];
    input.retro.sessionNotes = "@SUM(1,2)";
    input.retro.notes = [
      {
        id: "note",
        text: "-1+2",
        authorId: "participant",
        authorName: "  =1+1",
        authorColor: "blue",
        isAnonymous: false,
        column: "actionItems",
        createdAt: input.exportedAt,
        updatedAt: input.exportedAt,
        status: "open",
        upvotes: {},
      },
    ];
    const rows = readCsv(buildSessionExportCsv(input));
    const records = rows
      .slice(1)
      .map((row) => Object.fromEntries(rows[0].map((key, index) => [key, row[index]])));
    expect(records.find((row) => row.recordType === "summary")?.taskInput).toBe(
      `'${input.planning.taskInput}`,
    );
    expect(records.find((row) => row.recordType === "participant")?.participantName).toBe(
      "'+SUM(1,2)",
    );
    expect(records.find((row) => row.recordType === "settings")?.sessionNotes).toBe("'@SUM(1,2)");
    const note = records.find((row) => row.recordType === "note");
    expect(note?.noteText).toBe("'-1+2");
    expect(note?.noteAuthor).toBe("'  =1+1");
    expect(note?.actionItems).toBe("'-1+2");
    expect(note?.noteUpvotes).toBe("0");
    expect(note?.noteIsAnonymous).toBe("false");
    expect(records[0].taskIssueKey).toBe("");
  });

  it("preserves CR-only text, delimiters, quotes and line breaks within one field", () => {
    const input = snapshot();
    input.planning.taskInput = 'Review\rcontinued, "quoted"\nlast line';
    const rows = readCsv(buildSessionExportCsv(input));
    expect(rows).toHaveLength(3);
    expect(rows[1][rows[0].indexOf("taskInput")]).toBe(input.planning.taskInput);
  });

  it("preserves plain text and numeric negative values rather than converting numbers to text", () => {
    const input = snapshot();
    input.planning.finalizedTasks = [
      {
        id: "finished-task",
        taskKey: null,
        taskUrl: null,
        taskTitle: "Normal task",
        lowerBound: -1,
        average: 1,
        upperBound: 2,
        finalEstimate: "1",
        interpretationEmoji: "",
        interpretationLabel: "Small",
        finalizedAt: input.exportedAt,
        finalizedBy: "owner",
        finalizedByName: "Fixture owner",
      },
    ];
    const rows = readCsv(buildSessionExportCsv(input));
    expect(rows[1][rows[0].indexOf("roomOwner")]).toBe("Fixture owner");
    expect(rows[2][rows[0].indexOf("finalizedLowerBound")]).toBe("-1");
    expect(rows[2][rows[0].indexOf("finalizedTaskTitle")]).toBe("Normal task");
  });
});
