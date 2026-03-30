"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { JoinRoomForm } from "@/components/room/join-room-form";
import { RoomExperience } from "@/components/room/room-experience";
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
  const router = useRouter();
  const { identity, isReady, rememberRoomId, updateIdentity, resetIdentity, resetLocalAppState } =
    useLocalIdentity();
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

  useEffect(() => {
    if (!isReady) {
      return;
    }

    rememberRoomId(roomId);
  }, [isReady, rememberRoomId, roomId]);

  const leaveRoom = () => {
    router.push("/");
  };

  const handleResetIdentity = () => {
    resetIdentity();
    router.push("/");
  };

  const handleLocalReset = () => {
    resetLocalAppState();
    router.push("/");
  };

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
      <main className="min-h-screen overflow-x-clip bg-background px-4 py-8 text-foreground sm:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--arena-accent-glow),transparent_35%),radial-gradient(circle_at_90%_20%,var(--arena-accent-soft),transparent_35%)]" />
        <motion.div
          variants={itemReveal}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-7xl"
        >
          <JoinRoomForm
            roomIdFromUrl={roomId}
            initialNickname={identity.nickname}
            initialColor={resolvedColor}
            onJoin={({ nickname: nextNickname, color: nextColor, roomId: nextRoomId }) => {
              updateIdentity({
                nickname: nextNickname,
                color: nextColor,
              });
              rememberRoomId(nextRoomId);

              if (nextRoomId !== roomId) {
                router.push(`/room/${nextRoomId}`);
              }
            }}
          />
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
            onLeaveRoom={leaveRoom}
            onResetIdentity={handleResetIdentity}
            onLocalReset={handleLocalReset}
          />
        </RoomProvider>
      </motion.div>
    </main>
  );
}
