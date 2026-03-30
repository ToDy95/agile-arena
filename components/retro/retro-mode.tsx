"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import {
  getCardInteractionProps,
  getContainerStaggerVariants,
  getItemRevealVariants,
  motionTransitions,
} from "@/lib/animations/presets";
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

type RetroColumnLaneProps = {
  column: RetroColumn;
  notes: RetroNote[];
  currentUserId: string;
  draftText: string;
  composerOpen: boolean;
  editingNoteId: string | null;
  editingText: string;
  onDraftChange: (column: RetroColumn, value: string) => void;
  onToggleComposer: (column: RetroColumn, open: boolean) => void;
  onSubmitDraft: (column: RetroColumn) => void;
  onStartEdit: (noteId: string, text: string) => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  onSaveEdit: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleUpvote: (noteId: string) => void;
};

function RetroColumnLane({
  column,
  notes,
  currentUserId,
  draftText,
  composerOpen,
  editingNoteId,
  editingText,
  onDraftChange,
  onToggleComposer,
  onSubmitDraft,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onDeleteNote,
  onToggleUpvote,
}: RetroColumnLaneProps) {
  const { reducedMotion } = useMotionPreferences();
  const [notesParentRef] = useAutoAnimate<HTMLDivElement>({
    duration: reducedMotion ? 0 : 210,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  });
  const cardInteraction = getCardInteractionProps(reducedMotion);
  const columnMeta = RETRO_COLUMN_META[column];

  return (
    <Card className={cn("space-y-3", columnMeta.toneClassName)}>
      <div>
        <p className="text-sm font-semibold text-zinc-100">{columnMeta.title}</p>
        <p className="text-xs text-zinc-400">{columnMeta.description}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-400">{notes.length} notes</p>
        <motion.div {...cardInteraction}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onToggleComposer(column, !composerOpen)}
          >
            {composerOpen ? "Close" : "Add note"}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {composerOpen ? (
          <motion.div
            key="composer"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={motionTransitions.base}
            className="space-y-2 overflow-hidden"
          >
            <Textarea
              value={draftText}
              placeholder="Capture a quick note for this column"
              onChange={(event) => onDraftChange(column, event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  onSubmitDraft(column);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => onToggleComposer(column, false)}>
                Cancel
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onSubmitDraft(column)}>
                Add
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div ref={notesParentRef} className="space-y-2">
        {notes.length === 0 ? (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className="rounded-xl border border-dashed border-zinc-700/80 p-3 text-sm text-zinc-500"
          >
            No notes yet.
          </motion.div>
        ) : null}

        {notes.map((note) => {
          const isAuthor = note.authorId === currentUserId;
          const isEditing = editingNoteId === note.id;
          const voteCount = Object.keys(note.upvotes).length;
          const hasUpvoted = Boolean(note.upvotes[currentUserId]);

          return (
            <motion.div
              key={note.id}
              layout
              className="rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-3"
              {...cardInteraction}
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
                    +1
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={voteCount}
                        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                        transition={motionTransitions.fast}
                        className="tabular-nums"
                      >
                        ({voteCount})
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                  {isAuthor ? (
                    <Button size="sm" variant="ghost" onClick={() => onDeleteNote(note.id)}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>

              <AnimatePresence initial={false} mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    transition={motionTransitions.fast}
                    className="space-y-2"
                  >
                    <Textarea
                      value={editingText}
                      onChange={(event) => onEditChange(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onSaveEdit(note.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="read"
                    type="button"
                    disabled={!isAuthor}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    transition={motionTransitions.fast}
                    className={cn(
                      "w-full text-left text-sm text-zinc-200",
                      isAuthor ? "cursor-pointer" : "cursor-default",
                    )}
                    onClick={() => {
                      if (!isAuthor) {
                        return;
                      }

                      onStartEdit(note.id, note.text);
                    }}
                  >
                    {note.text}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export function RetroMode({
  notes,
  currentUserId,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onToggleUpvote,
}: RetroModeProps) {
  const { reducedMotion } = useMotionPreferences();
  const containerVariants = getContainerStaggerVariants(reducedMotion);
  const itemReveal = getItemRevealVariants(reducedMotion);

  const [drafts, setDrafts] = useState<Record<RetroColumn, string>>({
    wentWell: "",
    toImprove: "",
    actionItems: "",
  });
  const [composerOpen, setComposerOpen] = useState<Record<RetroColumn, boolean>>({
    wentWell: false,
    toImprove: false,
    actionItems: false,
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

  const handleSubmitDraft = (column: RetroColumn) => {
    const trimmed = drafts[column].trim();

    if (trimmed.length === 0) {
      return;
    }

    onAddNote(column, trimmed);
    setDrafts((current) => ({ ...current, [column]: "" }));
    setComposerOpen((current) => ({ ...current, [column]: false }));
  };

  const handleDeleteNote = (noteId: string) => {
    onDeleteNote(noteId);

    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingText("");
    }
  };

  const handleSaveEdit = (noteId: string) => {
    const trimmed = editingText.trim();

    if (trimmed.length === 0) {
      return;
    }

    onEditNote(noteId, trimmed);
    setEditingNoteId(null);
    setEditingText("");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-3 lg:grid-cols-3"
    >
      {(Object.keys(RETRO_COLUMN_META) as RetroColumn[]).map((column) => (
        <motion.div key={column} variants={itemReveal} layout>
          <RetroColumnLane
            column={column}
            notes={notesByColumn[column]}
            currentUserId={currentUserId}
            draftText={drafts[column]}
            composerOpen={composerOpen[column]}
            editingNoteId={editingNoteId}
            editingText={editingText}
            onDraftChange={(nextColumn, value) =>
              setDrafts((current) => ({
                ...current,
                [nextColumn]: value,
              }))
            }
            onToggleComposer={(nextColumn, open) =>
              setComposerOpen((current) => ({
                ...current,
                [nextColumn]: open,
              }))
            }
            onSubmitDraft={handleSubmitDraft}
            onStartEdit={(noteId, text) => {
              setEditingNoteId(noteId);
              setEditingText(text);
            }}
            onCancelEdit={() => {
              setEditingNoteId(null);
              setEditingText("");
            }}
            onEditChange={setEditingText}
            onSaveEdit={handleSaveEdit}
            onDeleteNote={handleDeleteNote}
            onToggleUpvote={onToggleUpvote}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
