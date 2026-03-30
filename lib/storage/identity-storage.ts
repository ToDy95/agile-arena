import { STORAGE_KEYS } from "@/lib/constants/app";
import type { UserIdentity } from "@/lib/types/domain";
import { generateRandomColor } from "@/lib/utils/color";

type StoredIdentity = UserIdentity;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function createDefaultIdentity(): StoredIdentity {
  return {
    userId: crypto.randomUUID(),
    nickname: "",
    color: generateRandomColor(),
  };
}

export function readIdentity(): StoredIdentity | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEYS.identity);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredIdentity>;

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.nickname !== "string" ||
      typeof parsed.color !== "string"
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      nickname: parsed.nickname,
      color: parsed.color,
    };
  } catch {
    return null;
  }
}

export function writeIdentity(identity: StoredIdentity): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.identity, JSON.stringify(identity));
}

export function readLastRoomId(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const roomId = window.localStorage.getItem(STORAGE_KEYS.lastRoomId);
  return roomId && roomId.trim().length > 0 ? roomId : null;
}

export function writeLastRoomId(roomId: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.lastRoomId, roomId);
}
