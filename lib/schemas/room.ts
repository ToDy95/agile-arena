import { z } from "zod";

export const ROOM_ID_PATTERN = /^[a-z0-9-]{3,40}$/;

export const roomIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/\s+/g, "-"))
  .refine((value) => ROOM_ID_PATTERN.test(value), {
    message: "Room ID must contain 3-40 letters, numbers, or dashes.",
  });

export function parseRoomId(value: string): string | null {
  const parsed = roomIdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
