import { ROOM_ID_PREFIX } from "@/lib/constants/app";

const ROOM_ID_PATTERN = /^[a-z0-9-]{3,40}$/;

export function generateRoomId(): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `${ROOM_ID_PREFIX}-${suffix}`;
}

export function normalizeRoomId(value: string): string | null {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");

  if (!ROOM_ID_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function isValidRoomId(value: string): boolean {
  return normalizeRoomId(value) !== null;
}
