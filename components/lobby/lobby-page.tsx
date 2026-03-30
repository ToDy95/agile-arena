"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalIdentity } from "@/hooks/use-local-identity";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import {
  getCardInteractionProps,
  getContainerStaggerVariants,
  getItemRevealVariants,
  getPageEnterVariants,
} from "@/lib/animations/presets";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants/app";
import { nicknameSchema } from "@/lib/schemas/identity";
import { roomIdSchema } from "@/lib/schemas/room";
import { generateRandomColor, normalizeHexColor } from "@/lib/utils/color";
import { generateRoomId } from "@/lib/utils/room";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

export function LobbyPage() {
  const router = useRouter();
  const { identity, isReady, rememberRoomId, updateIdentity } = useLocalIdentity();
  const { reducedMotion } = useMotionPreferences();

  const [roomIdInput, setRoomIdInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageVariants = getPageEnterVariants(reducedMotion);
  const containerVariants = getContainerStaggerVariants(reducedMotion);
  const itemVariants = getItemRevealVariants(reducedMotion);
  const cardInteraction = getCardInteractionProps(reducedMotion);

  const navigateToRoom = (roomId: string) => {
    const targetPath = `/room/${roomId}`;
    const doc = document as ViewTransitionDocument;

    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => {
        router.push(targetPath);
      });
      return;
    }

    router.push(targetPath);
  };

  const prepareIdentity = () => {
    const parsedNickname = nicknameSchema.safeParse(identity.nickname);

    if (!parsedNickname.success) {
      setErrorMessage(parsedNickname.error.issues[0]?.message ?? "Nickname is required.");
      return null;
    }

    const resolvedColor = normalizeHexColor(identity.color) ?? generateRandomColor(identity.color);

    updateIdentity({
      nickname: parsedNickname.data,
      color: resolvedColor,
    });

    setErrorMessage(null);

    return {
      nickname: parsedNickname.data,
      color: resolvedColor,
    };
  };

  const createRoom = () => {
    if (!prepareIdentity()) {
      return;
    }

    const roomId = generateRoomId();
    rememberRoomId(roomId);
    navigateToRoom(roomId);
  };

  const joinRoom = () => {
    if (!prepareIdentity()) {
      return;
    }

    const candidateRoomId =
      roomIdInput.trim().length > 0 ? roomIdInput : (identity.lastRoomId ?? "");
    const parsedRoomId = roomIdSchema.safeParse(candidateRoomId);

    if (!parsedRoomId.success) {
      setErrorMessage(
        parsedRoomId.error.issues[0]?.message ??
          "Room ID must contain 3-40 letters, numbers, or dashes.",
      );
      return;
    }

    rememberRoomId(parsedRoomId.data);
    navigateToRoom(parsedRoomId.data);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={pageVariants}
      className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(244,63,94,0.12),transparent_40%)]" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-8"
      >
        <motion.div variants={itemVariants} className="mb-8 max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/80">
            Multiplayer Agile Room
          </p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-zinc-50 sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="text-base text-zinc-300 sm:text-lg">{APP_SUBTITLE}</p>
        </motion.div>

        <motion.div variants={itemVariants} {...cardInteraction}>
          <Card className="w-full max-w-xl border-zinc-700/80 bg-zinc-950/75 p-5 sm:p-6">
            <motion.div variants={containerVariants} className="space-y-5">
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium text-zinc-200">
                  Nickname
                </label>
                <Input
                  id="nickname"
                  value={identity.nickname}
                  maxLength={32}
                  autoComplete="nickname"
                  placeholder="Type your arena name"
                  className="h-11"
                  onChange={(event) => updateIdentity({ nickname: event.target.value })}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="color" className="text-sm font-medium text-zinc-200">
                  Player color
                </label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={normalizeHexColor(identity.color) ?? "#38BDF8"}
                    className="h-11 w-14 cursor-pointer rounded-lg border-zinc-700 p-1"
                    onChange={(event) => updateIdentity({ color: event.target.value })}
                  />
                  <Input
                    value={identity.color}
                    maxLength={7}
                    className="h-11 font-mono"
                    onChange={(event) => updateIdentity({ color: event.target.value })}
                  />
                  <Button
                    variant="secondary"
                    size="lg"
                    className="min-w-28"
                    onClick={() =>
                      updateIdentity({
                        color: generateRandomColor(identity.color),
                      })
                    }
                  >
                    Randomize
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="room-id" className="text-sm font-medium text-zinc-200">
                  Room ID
                </label>
                <Input
                  id="room-id"
                  value={roomIdInput}
                  placeholder={identity.lastRoomId ?? "arena-abc123ef"}
                  className="h-11"
                  onChange={(event) => setRoomIdInput(event.target.value)}
                />
                <p className="text-xs text-zinc-500">
                  Share the room ID with your team, or create a fresh arena.
                </p>
              </motion.div>

              <AnimatePresence initial={false} mode="popLayout">
                {errorMessage ? (
                  <motion.p
                    key={errorMessage}
                    variants={itemVariants}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                    animate={
                      reducedMotion
                        ? { opacity: 1 }
                        : {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            x: [0, -5, 5, -3, 3, 0],
                          }
                    }
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: reducedMotion ? 0 : 0.28 }}
                    className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
                  >
                    {errorMessage}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="grid gap-2 sm:grid-cols-2">
                <Button size="lg" onClick={createRoom} disabled={!isReady}>
                  Create room
                </Button>
                <Button size="lg" variant="secondary" onClick={joinRoom} disabled={!isReady}>
                  Join room
                </Button>
              </motion.div>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
