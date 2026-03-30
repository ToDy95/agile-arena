"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AvatarEditor } from "@/components/avatar/avatar-editor";
import { AvatarPreview } from "@/components/avatar/avatar-preview";
import { AvatarRandomizeButton } from "@/components/avatar/avatar-randomize-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  getCardInteractionProps,
  getContainerStaggerVariants,
  getItemRevealVariants,
} from "@/lib/animations/presets";
import { generateRandomAvatarConfig } from "@/lib/avatar/avatar-randomizer";
import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { roomIdSchema } from "@/lib/schemas/room";
import { generateRandomColor, normalizeHexColor } from "@/lib/utils/color";
import { resolveJoinIdentity } from "@/lib/utils/identity";

type JoinRoomPayload = {
  nickname: string;
  color: string;
  avatar: AvatarConfig;
  roomId: string;
};

type JoinRoomFormProps = {
  roomIdFromUrl: string;
  initialNickname: string;
  initialColor: string;
  initialAvatar: AvatarConfig;
  onJoin: (payload: JoinRoomPayload) => void;
};

export function JoinRoomForm({
  roomIdFromUrl,
  initialNickname,
  initialColor,
  initialAvatar,
  onJoin,
}: JoinRoomFormProps) {
  const { reducedMotion } = useMotionPreferences();
  const itemReveal = getItemRevealVariants(reducedMotion);
  const containerVariants = getContainerStaggerVariants(reducedMotion);
  const cardInteraction = getCardInteractionProps(reducedMotion);

  const [nicknameInput, setNicknameInput] = useState(initialNickname);
  const [roomIdInput, setRoomIdInput] = useState(roomIdFromUrl);
  const [colorInput, setColorInput] = useState(
    normalizeHexColor(initialColor) ?? generateRandomColor(initialColor),
  );
  const [avatarInput, setAvatarInput] = useState(initialAvatar);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);

  useEffect(() => {
    setRoomIdInput(roomIdFromUrl);
  }, [roomIdFromUrl]);

  const handleJoin = () => {
    const parsedIdentity = resolveJoinIdentity({
      nickname: nicknameInput,
      color: colorInput,
      avatar: avatarInput,
    });

    if (!parsedIdentity.success) {
      setErrorMessage(parsedIdentity.error);
      return;
    }

    const parsedRoomId = roomIdSchema.safeParse(roomIdInput);

    if (!parsedRoomId.success) {
      setErrorMessage(
        parsedRoomId.error.issues[0]?.message ??
          "Room ID must contain 3-40 letters, numbers, or dashes.",
      );
      return;
    }

    setErrorMessage(null);
    onJoin({
      nickname: parsedIdentity.data.nickname,
      color: parsedIdentity.data.color,
      avatar: parsedIdentity.data.avatar,
      roomId: parsedRoomId.data,
    });
  };

  return (
    <motion.div variants={itemReveal} initial="hidden" animate="show" className="mx-auto max-w-xl">
      <motion.div {...cardInteraction} className="overflow-hidden rounded-2xl">
        <Card className="border-border/75 bg-card/90 p-5 backdrop-blur-sm sm:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-5"
          >
            <motion.div variants={itemReveal} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/90">
                Direct invite
              </p>
              <h1 className="text-2xl font-semibold text-foreground">Join room</h1>
              <p className="text-sm text-muted-foreground">
                Enter a nickname and color to join this shared arena instantly.
              </p>
            </motion.div>

            <motion.div variants={itemReveal} className="space-y-2">
              <label
                htmlFor="join-room-nickname"
                className="text-sm font-medium text-foreground/90"
              >
                Nickname
              </label>
              <Input
                id="join-room-nickname"
                value={nicknameInput}
                maxLength={32}
                autoComplete="nickname"
                placeholder="Type your arena name"
                className="h-11"
                onChange={(event) => setNicknameInput(event.target.value)}
              />
            </motion.div>

            <motion.div variants={itemReveal} className="space-y-2">
              <label htmlFor="join-room-color" className="text-sm font-medium text-foreground/90">
                Player color
              </label>
              <div className="flex gap-2">
                <Input
                  id="join-room-color"
                  type="color"
                  value={normalizeHexColor(colorInput) ?? "#38BDF8"}
                  className="h-11 w-14 cursor-pointer rounded-lg border-input p-1"
                  onChange={(event) => setColorInput(event.target.value)}
                />
                <Input
                  value={colorInput}
                  maxLength={7}
                  className="h-11 font-mono"
                  onChange={(event) => setColorInput(event.target.value)}
                />
                <Button
                  variant="secondary"
                  size="lg"
                  className="min-w-28"
                  onClick={() => setColorInput(generateRandomColor(colorInput))}
                >
                  Randomize
                </Button>
              </div>
            </motion.div>

            <motion.div variants={itemReveal} className="space-y-2">
              <label htmlFor="join-room-id" className="text-sm font-medium text-foreground/90">
                Room ID
              </label>
              <Input
                id="join-room-id"
                value={roomIdInput}
                placeholder={roomIdFromUrl}
                className="h-11"
                onChange={(event) => setRoomIdInput(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Invite links prefill this value. You can still switch to a different room.
              </p>
            </motion.div>

            <motion.div variants={itemReveal} className="space-y-2">
              <p className="text-sm font-medium text-foreground/90">Avatar</p>
              <div className="flex items-center gap-3 rounded-xl border border-border/75 bg-surface-1/70 p-2.5">
                <AvatarPreview config={avatarInput} size="sm" />
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <AvatarRandomizeButton
                      onClick={() => setAvatarInput(generateRandomAvatarConfig())}
                    />
                    <Dialog open={avatarEditorOpen} onOpenChange={setAvatarEditorOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Customize
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Avatar Workshop</DialogTitle>
                          <DialogDescription>
                            Configure your avatar for this browser profile.
                          </DialogDescription>
                        </DialogHeader>
                        <AvatarEditor
                          value={avatarInput}
                          onChange={setAvatarInput}
                          onRandomize={() => setAvatarInput(generateRandomAvatarConfig())}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved locally and ready for future multiplayer avatar views.
                  </p>
                </div>
              </div>
            </motion.div>

            <AnimatePresence initial={false} mode="popLayout">
              {errorMessage ? (
                <motion.p
                  key={errorMessage}
                  variants={itemReveal}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
                  animate={
                    reducedMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          x: [0, -2, 2, -1, 1, 0],
                        }
                  }
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
                  transition={{ duration: reducedMotion ? 0 : 0.24 }}
                  className="overflow-hidden rounded-lg border border-destructive/35 bg-destructive/12 px-3 py-2 text-sm text-destructive"
                >
                  {errorMessage}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <motion.div variants={itemReveal} className="grid gap-2 sm:grid-cols-2">
              <Button size="lg" onClick={handleJoin}>
                Join room
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/">Back to lobby</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
