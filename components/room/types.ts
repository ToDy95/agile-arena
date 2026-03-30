import type { PlanningEstimate } from "@/lib/types/domain";

export type RoomPlayer = {
  connectionId: number;
  userId: string;
  nickname: string;
  color: string;
  isSelf: boolean;
  isOwner: boolean;
  hasVoted: boolean;
  vote: PlanningEstimate | null;
};
