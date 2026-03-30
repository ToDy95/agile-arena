"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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
import { APP_NAME } from "@/lib/constants/app";

type RoomHeaderProps = {
  roomId: string;
  status: string;
  roomOwnerName: string;
  isCurrentUserOwner: boolean;
  onExportCsv: () => void;
};

export function RoomHeader({
  roomId,
  status,
  roomOwnerName,
  isCurrentUserOwner,
  onExportCsv,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
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
      className="flex flex-col gap-4 rounded-2xl border border-border/75 bg-card/90 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{APP_NAME}</p>
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">Room {roomId}</h1>
        <p className="text-xs text-muted-foreground">
          Owner: <span className="font-semibold text-foreground">{roomOwnerName}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
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
