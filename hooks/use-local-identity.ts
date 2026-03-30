"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createDefaultIdentity,
  readIdentity,
  readLastRoomId,
  writeIdentity,
  writeLastRoomId,
} from "@/lib/storage/identity-storage";
import type { UserIdentity } from "@/lib/types/domain";

type LocalIdentity = UserIdentity & {
  lastRoomId: string | null;
};

export function useLocalIdentity() {
  const [identity, setIdentity] = useState<LocalIdentity>({
    ...createDefaultIdentity(),
    lastRoomId: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedIdentity = readIdentity();
    const resolvedIdentity = storedIdentity ?? createDefaultIdentity();

    if (!storedIdentity) {
      writeIdentity(resolvedIdentity);
    }

    // Hydrate browser-only identity state from localStorage after mount.
    setIdentity({
      ...resolvedIdentity,
      lastRoomId: readLastRoomId(),
    });
    setIsReady(true);
  }, []);

  const updateIdentity = useCallback((patch: Partial<UserIdentity>) => {
    setIdentity((current) => {
      const nextIdentity = {
        ...current,
        ...patch,
      };

      writeIdentity(nextIdentity);
      return nextIdentity;
    });
  }, []);

  const rememberRoomId = useCallback((roomId: string) => {
    writeLastRoomId(roomId);
    setIdentity((current) => ({ ...current, lastRoomId: roomId }));
  }, []);

  return {
    identity,
    isReady,
    updateIdentity,
    rememberRoomId,
  };
}
