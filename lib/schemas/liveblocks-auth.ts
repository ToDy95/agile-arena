import { z } from "zod";

export const liveblocksAuthRequestSchema = z.object({
  room: z.string().optional(),
  userId: z.string().optional(),
  nickname: z.string().optional(),
  color: z.string().optional(),
});

export type LiveblocksAuthRequest = z.infer<typeof liveblocksAuthRequestSchema>;
