import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import type { PlanningEstimate } from "@/lib/types/domain";

export type RoomPlayer = {
  connectionId: number;
  userId: string;
  nickname: string;
  color: string;
  avatar: AvatarConfig;
  isSelf: boolean;
  isOwner: boolean;
  hasVoted: boolean;
  vote: PlanningEstimate | null;
};
