import { z } from "zod";

import {
  AVATAR_ACCENT_COLORS,
  AVATAR_ACCESSORIES,
  AVATAR_BODY_TYPES,
  AVATAR_EXPRESSIONS,
  AVATAR_HAIR_COLORS,
  AVATAR_HAIR_STYLES,
  AVATAR_HATS,
  AVATAR_OUTFIT_COLORS,
  AVATAR_OUTFITS,
  AVATAR_SKIN_TONES,
  type AvatarConfig,
} from "@/lib/avatar/avatar-types";

export const avatarConfigSchema = z.object({
  bodyType: z.enum(AVATAR_BODY_TYPES),
  skinTone: z.enum(AVATAR_SKIN_TONES),
  hairStyle: z.enum(AVATAR_HAIR_STYLES),
  hairColor: z.enum(AVATAR_HAIR_COLORS),
  hat: z.enum(AVATAR_HATS),
  accessory: z.enum(AVATAR_ACCESSORIES),
  outfit: z.enum(AVATAR_OUTFITS),
  outfitColor: z.enum(AVATAR_OUTFIT_COLORS),
  expression: z.enum(AVATAR_EXPRESSIONS),
  accentColor: z.enum(AVATAR_ACCENT_COLORS),
});

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  bodyType: "classic",
  skinTone: "warm",
  hairStyle: "short",
  hairColor: "ink",
  hat: "none",
  accessory: "none",
  outfit: "hoodie",
  outfitColor: "cyan",
  expression: "smile",
  accentColor: "mint",
};

function sanitizeAvatarConfig(config: AvatarConfig): AvatarConfig {
  const next = { ...config };

  if (next.hat !== "none" && next.hairStyle === "mohawk") {
    next.hairStyle = "short";
  }

  if (next.hat === "party" && next.accessory === "visor") {
    next.accessory = "none";
  }

  if (next.outfit === "armor" && next.bodyType === "compact") {
    next.bodyType = "classic";
  }

  if (next.accentColor === "amber" && next.outfitColor === "coral") {
    next.accentColor = "violet";
  }

  return next;
}

export function createDefaultAvatarConfig(): AvatarConfig {
  return { ...DEFAULT_AVATAR_CONFIG };
}

export function normalizeAvatarConfig(input: unknown): AvatarConfig {
  const parsed = avatarConfigSchema.safeParse(input);

  if (!parsed.success) {
    return createDefaultAvatarConfig();
  }

  return sanitizeAvatarConfig(parsed.data);
}
