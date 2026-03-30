import { STORAGE_KEYS } from "@/lib/constants/app";
import { storedIdentitySchema } from "@/lib/schemas/identity";
import { parseRoomId } from "@/lib/schemas/room";
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
    const parsed = storedIdentitySchema.safeParse(JSON.parse(rawValue));

    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function writeIdentity(identity: StoredIdentity): void {
  if (!canUseStorage()) {
    return;
  }

  const parsed = storedIdentitySchema.safeParse(identity);

  if (!parsed.success) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.identity, JSON.stringify(parsed.data));
}

export function readLastRoomId(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const roomId = window.localStorage.getItem(STORAGE_KEYS.lastRoomId);

  if (!roomId) {
    return null;
  }

  return parseRoomId(roomId);
}

export function writeLastRoomId(roomId: string): void {
  if (!canUseStorage()) {
    return;
  }

  const parsedRoomId = parseRoomId(roomId);

  if (!parsedRoomId) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.lastRoomId, parsedRoomId);
}
