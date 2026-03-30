"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants/app";

type RoomHeaderProps = {
  roomId: string;
  status: string;
};

export function RoomHeader({ roomId, status }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyInvite = async () => {
    const inviteUrl = typeof window === "undefined" ? "" : window.location.href;

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
        <Button variant="secondary" onClick={copyInvite}>
          {copied ? "Copied" : "Invite"}
        </Button>
      </div>
    </header>
  );
}
