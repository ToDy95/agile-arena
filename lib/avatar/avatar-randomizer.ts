import {
  AVATAR_ACCENT_COLORS,
  AVATAR_ACCESSORIES,
  AVATAR_BODY_TYPES,
  AVATAR_EXPRESSIONS,
  AVATAR_HAIR_COLORS,
  AVATAR_HAIR_STYLES,
  AVATAR_OUTFIT_COLORS,
  AVATAR_OUTFITS,
  AVATAR_SKIN_TONES,
  type AvatarAccessory,
  type AvatarConfig,
  type AvatarHairStyle,
  type AvatarHat,
} from "@/lib/avatar/avatar-types";
import { normalizeAvatarConfig } from "@/lib/avatar/avatar-utils";

const AVATAR_STYLE_PRESETS: Array<
  Pick<
    AvatarConfig,
    "bodyType" | "outfit" | "outfitColor" | "hat" | "accessory" | "expression" | "accentColor"
  >
> = [
  {
    bodyType: "classic",
    outfit: "hoodie",
    outfitColor: "cyan",
    hat: "none",
    accessory: "glasses",
    expression: "smile",
    accentColor: "mint",
  },
  {
    bodyType: "heroic",
    outfit: "armor",
    outfitColor: "slate",
    hat: "cap",
    accessory: "visor",
    expression: "focused",
    accentColor: "amber",
  },
  {
    bodyType: "compact",
    outfit: "tee",
    outfitColor: "coral",
    hat: "beanie",
    accessory: "none",
    expression: "wink",
    accentColor: "rose",
  },
  {
    bodyType: "classic",
    outfit: "jacket",
    outfitColor: "violet",
    hat: "party",
    accessory: "monocle",
    expression: "surprised",
    accentColor: "cyan",
  },
];

function pickRandom<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

function resolveHat(): AvatarHat {
  const roll = Math.random();

  if (roll < 0.46) {
    return "none";
  }

  if (roll < 0.71) {
    return "beanie";
  }

  if (roll < 0.9) {
    return "cap";
  }

  return "party";
}

function resolveHairStyle(hat: AvatarHat): AvatarHairStyle {
  if (hat === "party") {
    return pickRandom(["buzz", "short", "curly"] as const);
  }

  return pickRandom(AVATAR_HAIR_STYLES);
}

function resolveAccessory(hat: AvatarHat): AvatarAccessory {
  if (hat === "party") {
    return pickRandom(["none", "glasses", "monocle"] as const);
  }

  return pickRandom(AVATAR_ACCESSORIES);
}

export function generateRandomAvatarConfig(seed?: Partial<AvatarConfig>): AvatarConfig {
  const preset = pickRandom(AVATAR_STYLE_PRESETS);
  const hat = seed?.hat ?? resolveHat();

  const randomConfig: AvatarConfig = {
    bodyType: seed?.bodyType ?? preset.bodyType ?? pickRandom(AVATAR_BODY_TYPES),
    skinTone: seed?.skinTone ?? pickRandom(AVATAR_SKIN_TONES),
    hairStyle: seed?.hairStyle ?? resolveHairStyle(hat),
    hairColor: seed?.hairColor ?? pickRandom(AVATAR_HAIR_COLORS),
    hat,
    accessory: seed?.accessory ?? resolveAccessory(hat),
    outfit: seed?.outfit ?? preset.outfit ?? pickRandom(AVATAR_OUTFITS),
    outfitColor: seed?.outfitColor ?? preset.outfitColor ?? pickRandom(AVATAR_OUTFIT_COLORS),
    expression: seed?.expression ?? preset.expression ?? pickRandom(AVATAR_EXPRESSIONS),
    accentColor: seed?.accentColor ?? preset.accentColor ?? pickRandom(AVATAR_ACCENT_COLORS),
  };

  return normalizeAvatarConfig(randomConfig);
}
