"use client";

import { motion } from "motion/react";
import { AvatarBadge } from "@/components/avatar/avatar-badge";
import { RoomActionsMenu } from "@/components/room/room-actions-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getItemRevealVariants } from "@/lib/animations/presets";
import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { APP_NAME } from "@/lib/constants/app";

type RoomHeaderProps = {
  roomId: string;
  currentAvatar: AvatarConfig;
  status: string;
  roomOwnerName: string;
  isCurrentUserOwner: boolean;
  onExportCsv: () => void;
  onLeaveRoom: () => void;
  onResetIdentity: () => void;
  onLocalReset: () => void;
};

export function RoomHeader({
  roomId,
  currentAvatar,
  status,
  roomOwnerName,
  isCurrentUserOwner,
  onExportCsv,
  onLeaveRoom,
  onResetIdentity,
  onLocalReset,
}: RoomHeaderProps) {
  const { reducedMotion } = useMotionPreferences();
  const revealVariants = getItemRevealVariants(reducedMotion);

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={revealVariants}
      className="flex items-start justify-between gap-3 rounded-2xl border border-border/75 bg-card/90 p-4 backdrop-blur-sm sm:gap-4"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <AvatarBadge config={currentAvatar} className="shrink-0" />
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {APP_NAME}
          </p>
          <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
            Room {roomId}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            Owner: <span className="font-semibold text-foreground">{roomOwnerName}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-2">
        <ThemeToggle className="hidden md:inline-flex" />
        <RoomActionsMenu
          roomId={roomId}
          status={status}
          isCurrentUserOwner={isCurrentUserOwner}
          onExportCsv={onExportCsv}
          onLeaveRoom={onLeaveRoom}
          onResetIdentity={onResetIdentity}
          onLocalReset={onLocalReset}
        />
      </div>
    </motion.header>
  );
}
