"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";

import { RoomExperience } from "@/components/room/room-experience";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalIdentity } from "@/hooks/use-local-identity";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { getItemRevealVariants } from "@/lib/animations/presets";
import { createInitialStorage } from "@/lib/liveblocks/initial-storage";
import { RoomProvider } from "@/lib/liveblocks/room-context";
import { nicknameSchema } from "@/lib/schemas/identity";
import { generateRandomColor, normalizeHexColor } from "@/lib/utils/color";

type RoomClientPageProps = {
  roomId: string;
};

export function RoomClientPage({ roomId }: RoomClientPageProps) {
  const { identity, isReady, updateIdentity } = useLocalIdentity();
  const { reducedMotion } = useMotionPreferences();
  const itemReveal = getItemRevealVariants(reducedMotion);

  const parsedNickname = nicknameSchema.safeParse(identity.nickname);
  const nickname = parsedNickname.success ? parsedNickname.data : "";
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
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
        <motion.div variants={itemReveal} initial="hidden" animate="show">
          <Card className="mx-auto max-w-md text-center text-muted-foreground">
            Loading room...
          </Card>
        </motion.div>
      </main>
    );
  }

  if (!nickname) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
        <motion.div variants={itemReveal} initial="hidden" animate="show">
          <Card className="mx-auto max-w-md space-y-4 text-center">
            <h1 className="text-lg font-semibold text-foreground">Nickname required</h1>
            <p className="text-sm text-muted-foreground">
              Set your nickname in the lobby before entering a room.
            </p>
            <Link href="/" className="inline-flex">
              <Button>Back to lobby</Button>
            </Link>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-background px-4 py-6 text-foreground sm:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--arena-accent-glow),transparent_35%),radial-gradient(circle_at_90%_20%,var(--arena-accent-soft),transparent_35%)]" />
      <motion.div
        variants={itemReveal}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-7xl"
      >
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
      </motion.div>
    </main>
  );
}
