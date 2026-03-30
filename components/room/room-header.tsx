"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AvatarBadge } from "@/components/avatar/avatar-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getItemRevealVariants, motionTransitions } from "@/lib/animations/presets";
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
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const { reducedMotion } = useMotionPreferences();
  const revealVariants = getItemRevealVariants(reducedMotion);

  useEffect(() => {
    if (!isInviteOpen || typeof window === "undefined") {
      return;
    }

    setInviteUrl(window.location.href);
  }, [isInviteOpen]);

  const copyInvite = async () => {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={revealVariants}
      className="flex flex-col gap-4 rounded-2xl border border-border/75 bg-card/90 p-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between"
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

      <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
        <ThemeToggle className="max-w-full" />
        {isCurrentUserOwner ? <Badge variant="secondary">Owner controls</Badge> : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={status}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
            transition={motionTransitions.fast}
          >
            <Badge>{status}</Badge>
          </motion.div>
        </AnimatePresence>

        {isCurrentUserOwner ? (
          <Button variant="secondary" onClick={onExportCsv}>
            Export CSV
          </Button>
        ) : null}

        <Button variant="ghost" onClick={onLeaveRoom}>
          Leave room
        </Button>

        <Dialog open={isSessionOpen} onOpenChange={setIsSessionOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost">Session</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Session Controls</DialogTitle>
              <DialogDescription>
                Manage your local Agile Arena session data for this browser.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  setIsSessionOpen(false);
                  onLeaveRoom();
                }}
              >
                Leave room
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => {
                  setIsSessionOpen(false);
                  onResetIdentity();
                }}
              >
                Reset identity
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => {
                  setIsSessionOpen(false);
                  onLocalReset();
                }}
              >
                Local app reset
              </Button>
              <p className="text-xs text-muted-foreground">
                Reset identity clears nickname, color, avatar, and last room. Local app reset clears
                all Agile Arena local/session storage keys.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Invite</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Room Invite</DialogTitle>
              <DialogDescription>
                Send this link to teammates so they can join the same arena instantly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Input value={inviteUrl} readOnly className="font-mono text-xs" />
              <div className="flex justify-end">
                <Button variant="secondary" onClick={copyInvite}>
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.header>
  );
}
