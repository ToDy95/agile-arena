"use client";

import {
  BadgeCheckIcon,
  DoorOpenIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Share2Icon,
  ShieldIcon,
  Trash2Icon,
  WifiIcon,
} from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RoomActionsMenuProps = {
  roomId: string;
  status: string;
  isCurrentUserOwner: boolean;
  onExportCsv: () => void;
  onLeaveRoom: () => void;
  onResetIdentity: () => void;
  onLocalReset: () => void;
};

export function RoomActionsMenu({
  roomId,
  status,
  isCurrentUserOwner,
  onExportCsv,
  onLeaveRoom,
  onResetIdentity,
  onLocalReset,
}: RoomActionsMenuProps) {
  const [copiedInvite, setCopiedInvite] = useState(false);

  const copyInviteLink = async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      setCopiedInvite(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-1.5">
          <MoreHorizontalIcon className="size-4" />
          <span className="hidden sm:inline">Room menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(92vw,21rem)]">
        <DropdownMenuLabel className="text-foreground">Room {roomId}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <WifiIcon className="text-muted-foreground" />
            <span>{status}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            {isCurrentUserOwner ? (
              <>
                <ShieldIcon className="text-primary" />
                <span>Owner controls enabled</span>
              </>
            ) : (
              <>
                <BadgeCheckIcon className="text-muted-foreground" />
                <span>Participant controls</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Room</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => void copyInviteLink()}>
            <Share2Icon />
            <span>{copiedInvite ? "Invite copied" : "Copy invite link"}</span>
          </DropdownMenuItem>
          {isCurrentUserOwner ? (
            <DropdownMenuItem onSelect={onExportCsv}>
              <DownloadIcon />
              <span>Export CSV</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="md:hidden" />
        <div className="space-y-2 px-2 py-2 md:hidden">
          <p className="text-xs font-semibold text-muted-foreground">Theme</p>
          <ThemeToggle className="w-full justify-start" />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Session</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onLeaveRoom}>
            <DoorOpenIcon />
            <span>Leave room</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onResetIdentity}>
            <RotateCcwIcon />
            <span>Reset identity</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onLocalReset}>
            <Trash2Icon />
            <span>Local app reset</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
