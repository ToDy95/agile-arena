"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearAppStorage,
  clearIdentityStorage,
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

    writeIdentity(resolvedIdentity);

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
    setIdentity((current) =>
      current.lastRoomId === roomId ? current : { ...current, lastRoomId: roomId },
    );
  }, []);

  const resetIdentity = useCallback(() => {
    clearIdentityStorage();
    const freshIdentity = createDefaultIdentity();
    writeIdentity(freshIdentity);
    setIdentity({
      ...freshIdentity,
      lastRoomId: null,
    });
  }, []);

  const resetLocalAppState = useCallback(() => {
    clearAppStorage();
    const freshIdentity = createDefaultIdentity();
    writeIdentity(freshIdentity);
    setIdentity({
      ...freshIdentity,
      lastRoomId: null,
    });
  }, []);

  return {
    identity,
    isReady,
    updateIdentity,
    rememberRoomId,
    resetIdentity,
    resetLocalAppState,
  };
}
