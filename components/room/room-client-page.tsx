"use client";

import Link from "next/link";
import { useEffect } from "react";

import { RoomExperience } from "@/components/room/room-experience";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalIdentity } from "@/hooks/use-local-identity";
import { createInitialStorage } from "@/lib/liveblocks/initial-storage";
import { RoomProvider } from "@/lib/liveblocks/room-context";
import { generateRandomColor, normalizeHexColor } from "@/lib/utils/color";

type RoomClientPageProps = {
  roomId: string;
};

export function RoomClientPage({ roomId }: RoomClientPageProps) {
  const { identity, isReady, updateIdentity } = useLocalIdentity();

  const nickname = identity.nickname.trim();
  const resolvedColor = normalizeHexColor(identity.color) ?? generateRandomColor();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (resolvedColor !== identity.color) {
      updateIdentity({ color: resolvedColor });
    }
  }, [identity.color, isReady, resolvedColor, updateIdentity]);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
        <Card className="mx-auto max-w-md text-center text-zinc-400">Loading room...</Card>
      </main>
    );
  }

  if (!nickname) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
        <Card className="mx-auto max-w-md space-y-4 text-center">
          <h1 className="text-lg font-semibold text-zinc-100">Nickname required</h1>
          <p className="text-sm text-zinc-400">
            Set your nickname in the lobby before entering a room.
          </p>
          <Link href="/" className="inline-flex">
            <Button>Back to lobby</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(244,63,94,0.12),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl">
        <RoomProvider
          id={roomId}
          initialPresence={{
            userId: identity.userId,
            nickname,
            color: resolvedColor,
            mode: "grooming",
            hasVoted: false,
          }}
          initialStorage={createInitialStorage()}
        >
          <RoomExperience
            roomId={roomId}
            currentUserId={identity.userId}
            currentNickname={nickname}
            currentColor={resolvedColor}
          />
        </RoomProvider>
      </div>
    </main>
  );
}
