import type { PlanningMetricValue, PlanningVoteValue } from "@/lib/types/domain";

export const PLANNING_DECK: PlanningVoteValue[] = [
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
];

export const PLANNING_METRIC_DECK: PlanningMetricValue[] = [1, 2, 3, 4, 5];

export const STORY_POINT_LEGEND: Array<{
  label: string;
  description: string;
  toneClassName: string;
}> = [
  {
    label: "1 SP",
    description: "Easy or trivial work.",
    toneClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  {
    label: "2 SP",
    description: "Small and straightforward.",
    toneClassName: "border-teal-500/30 bg-teal-500/10 text-teal-200",
  },
  {
    label: "3 SP",
    description: "Moderate implementation effort.",
    toneClassName: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  },
  {
    label: "5 SP",
    description: "Time-consuming with noticeable scope.",
    toneClassName: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
  {
    label: "8 SP",
    description: "Complex with multiple moving parts.",
    toneClassName: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  },
  {
    label: "13+ SP",
    description: "High risk. Usually a split candidate.",
    toneClassName: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  },
];
