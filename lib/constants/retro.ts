import type { RetroColumn } from "@/lib/types/domain";

export const RETRO_COLUMN_META: Record<
  RetroColumn,
  { title: string; description: string; toneClassName: string }
> = {
  wentWell: {
    title: "Went Well",
    description: "Celebrate wins and bright spots.",
    toneClassName: "border-emerald-500/30 bg-emerald-500/10",
  },
  toImprove: {
    title: "To Improve",
    description: "Highlight friction and pain points.",
    toneClassName: "border-amber-500/30 bg-amber-500/10",
  },
  actionItems: {
    title: "Action Items",
    description: "Capture concrete next steps.",
    toneClassName: "border-sky-500/30 bg-sky-500/10",
  },
};
