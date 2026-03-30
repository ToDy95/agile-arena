"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RETRO_COLUMN_META } from "@/lib/constants/retro";
import type { RetroColumn, RetroNote } from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";

type RetroModeProps = {
  notes: RetroNote[];
  currentUserId: string;
  onAddNote: (column: RetroColumn, text: string) => void;
  onEditNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleUpvote: (noteId: string) => void;
};

export function RetroMode({
  notes,
  currentUserId,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onToggleUpvote,
}: RetroModeProps) {
  const [drafts, setDrafts] = useState<Record<RetroColumn, string>>({
    wentWell: "",
    toImprove: "",
    actionItems: "",
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const notesByColumn = useMemo(() => {
    return notes.reduce<Record<RetroColumn, RetroNote[]>>(
      (grouped, note) => {
        grouped[note.column].push(note);
        return grouped;
      },
      {
        wentWell: [],
        toImprove: [],
        actionItems: [],
      },
    );
  }, [notes]);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {(Object.keys(RETRO_COLUMN_META) as RetroColumn[]).map((column) => {
        const columnMeta = RETRO_COLUMN_META[column];
        const columnNotes = notesByColumn[column];

        return (
          <Card key={column} className={cn("space-y-3", columnMeta.toneClassName)}>
            <div>
              <p className="text-sm font-semibold text-zinc-100">{columnMeta.title}</p>
              <p className="text-xs text-zinc-400">{columnMeta.description}</p>
            </div>

            <div className="flex gap-2">
              <Input
                value={drafts[column]}
                placeholder="Add note"
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [column]: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  const trimmed = drafts[column].trim();

                  if (trimmed.length === 0) {
                    return;
                  }

                  onAddNote(column, trimmed);
                  setDrafts((current) => ({ ...current, [column]: "" }));
                }}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const trimmed = drafts[column].trim();

                  if (trimmed.length === 0) {
                    return;
                  }

                  onAddNote(column, trimmed);
                  setDrafts((current) => ({ ...current, [column]: "" }));
                }}
              >
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {columnNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700/80 p-3 text-sm text-zinc-500">
                  No notes yet.
                </div>
              ) : null}

              {columnNotes.map((note) => {
                const isAuthor = note.authorId === currentUserId;
                const isEditing = editingNoteId === note.id;
                const voteCount = Object.keys(note.upvotes).length;
                const hasUpvoted = Boolean(note.upvotes[currentUserId]);

                return (
                  <div
                    key={note.id}
                    className="rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-xs text-zinc-400">
                        <span style={{ color: note.authorColor }}>{note.authorNickname}</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant={hasUpvoted ? "primary" : "ghost"}
                          onClick={() => onToggleUpvote(note.id)}
                        >
                          +1 ({voteCount})
                        </Button>
                        {isAuthor ? (
                          <Button size="sm" variant="ghost" onClick={() => onDeleteNote(note.id)}>
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const trimmed = editingText.trim();

                              if (trimmed.length === 0) {
                                return;
                              }

                              onEditNote(note.id, trimmed);
                              setEditingNoteId(null);
                            }}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isAuthor}
                        className={cn(
                          "w-full text-left text-sm text-zinc-200",
                          isAuthor ? "cursor-pointer" : "cursor-default",
                        )}
                        onClick={() => {
                          if (!isAuthor) {
                            return;
                          }

                          setEditingNoteId(note.id);
                          setEditingText(note.text);
                        }}
                      >
                        {note.text}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
