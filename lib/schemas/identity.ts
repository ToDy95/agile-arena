import { z } from "zod";

export const MAX_NICKNAME_LENGTH = 32;

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, "Please enter a nickname before joining the arena.")
  .max(MAX_NICKNAME_LENGTH, `Nickname must be ${MAX_NICKNAME_LENGTH} characters or less.`);

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex value like #38BDF8.")
  .transform((value) => value.toUpperCase());

export const storedIdentitySchema = z.object({
  userId: z.string().trim().min(1).max(120),
  nickname: z.string().trim().max(MAX_NICKNAME_LENGTH),
  color: z.string().trim().min(1).max(32),
});
