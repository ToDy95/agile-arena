import { generateRandomAvatarConfig } from "@/lib/avatar/avatar-randomizer";
import { readAvatarConfig, writeAvatarConfig } from "@/lib/avatar/avatar-storage";
import { normalizeAvatarConfig } from "@/lib/avatar/avatar-utils";
import { STORAGE_KEYS } from "@/lib/constants/app";
import { storedIdentitySchema } from "@/lib/schemas/identity";
import { parseRoomId } from "@/lib/schemas/room";
import type { UserIdentity } from "@/lib/types/domain";
import { generateRandomColor } from "@/lib/utils/color";

type StoredIdentity = UserIdentity;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function removeStorageKey(key: string): void {
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function createDefaultIdentity(): StoredIdentity {
  return {
    userId: crypto.randomUUID(),
    nickname: "",
    color: generateRandomColor(),
    avatar: generateRandomAvatarConfig(),
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

    const fallbackAvatar = readAvatarConfig() ?? generateRandomAvatarConfig();

    return {
      userId: parsed.data.userId,
      nickname: parsed.data.nickname,
      color: parsed.data.color,
      avatar: normalizeAvatarConfig(parsed.data.avatar ?? fallbackAvatar),
    };
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

  const normalizedIdentity: StoredIdentity = {
    userId: parsed.data.userId,
    nickname: parsed.data.nickname,
    color: parsed.data.color,
    avatar: normalizeAvatarConfig(parsed.data.avatar ?? identity.avatar),
  };

  window.localStorage.setItem(STORAGE_KEYS.identity, JSON.stringify(normalizedIdentity));
  writeAvatarConfig(normalizedIdentity.avatar);
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

export function clearIdentityStorage(): void {
  if (!canUseStorage()) {
    return;
  }

  removeStorageKey(STORAGE_KEYS.identity);
  removeStorageKey(STORAGE_KEYS.lastRoomId);
}

export function clearAppStorage(): void {
  if (!canUseStorage()) {
    return;
  }

  const appKeys = Object.values(STORAGE_KEYS);

  appKeys.forEach(removeStorageKey);

  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("agile-arena.") || key.startsWith("agile-arena:")) {
      removeStorageKey(key);
    }
  }

  for (const key of Object.keys(window.sessionStorage)) {
    if (key.startsWith("agile-arena.") || key.startsWith("agile-arena:")) {
      removeStorageKey(key);
    }
  }
}
