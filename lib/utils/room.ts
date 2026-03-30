import { ROOM_ID_PREFIX } from "@/lib/constants/app";
import { parseRoomId } from "@/lib/schemas/room";

export function generateRoomId(): string {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const candidate = `${ROOM_ID_PREFIX}-${suffix}`;
    const parsed = parseRoomId(candidate);

    if (parsed) {
      return parsed;
    }
  }

  return `${ROOM_ID_PREFIX}-${Date.now().toString(36)}`;
}

export function normalizeRoomId(value: string): string | null {
  return parseRoomId(value);
}

export function isValidRoomId(value: string): boolean {
  return parseRoomId(value) !== null;
}
