"use client";

import { useEffect, useState } from "react";

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
import { APP_NAME } from "@/lib/constants/app";

type RoomHeaderProps = {
  roomId: string;
  status: string;
};

export function RoomHeader({ roomId, status }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

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
    <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{APP_NAME}</p>
        <h1 className="text-lg font-semibold text-zinc-100 sm:text-xl">Room {roomId}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Badge className="border-zinc-700 bg-zinc-900 text-zinc-300">{status}</Badge>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Invite</Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
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
    </header>
  );
}
