import type {
  AvatarAccentColor,
  AvatarAccessory,
  AvatarBodyType,
  AvatarExpression,
  AvatarHairColor,
  AvatarHairStyle,
  AvatarHat,
  AvatarOutfit,
  AvatarOutfitColor,
  AvatarSkinTone,
} from "@/lib/avatar/avatar-types";

type AvatarOption<T extends string> = {
  value: T;
  label: string;
};

export const AVATAR_BODY_TYPE_OPTIONS: AvatarOption<AvatarBodyType>[] = [
  { value: "compact", label: "Compact" },
  { value: "classic", label: "Classic" },
  { value: "heroic", label: "Heroic" },
];

export const AVATAR_SKIN_TONE_OPTIONS: AvatarOption<AvatarSkinTone>[] = [
  { value: "porcelain", label: "Porcelain" },
  { value: "warm", label: "Warm" },
  { value: "golden", label: "Golden" },
  { value: "brown", label: "Brown" },
  { value: "deep", label: "Deep" },
];

export const AVATAR_HAIR_STYLE_OPTIONS: AvatarOption<AvatarHairStyle>[] = [
  { value: "buzz", label: "Buzz" },
  { value: "short", label: "Short" },
  { value: "curly", label: "Curly" },
  { value: "ponytail", label: "Ponytail" },
  { value: "mohawk", label: "Mohawk" },
];

export const AVATAR_HAIR_COLOR_OPTIONS: AvatarOption<AvatarHairColor>[] = [
  { value: "ink", label: "Ink" },
  { value: "brown", label: "Brown" },
  { value: "ginger", label: "Ginger" },
  { value: "blonde", label: "Blonde" },
  { value: "teal", label: "Teal" },
];

export const AVATAR_HAT_OPTIONS: AvatarOption<AvatarHat>[] = [
  { value: "none", label: "None" },
  { value: "beanie", label: "Beanie" },
  { value: "cap", label: "Cap" },
  { value: "party", label: "Party Hat" },
];

export const AVATAR_ACCESSORY_OPTIONS: AvatarOption<AvatarAccessory>[] = [
  { value: "none", label: "None" },
  { value: "glasses", label: "Glasses" },
  { value: "visor", label: "Visor" },
  { value: "monocle", label: "Monocle" },
];

export const AVATAR_OUTFIT_OPTIONS: AvatarOption<AvatarOutfit>[] = [
  { value: "hoodie", label: "Hoodie" },
  { value: "tee", label: "Tee" },
  { value: "jacket", label: "Jacket" },
  { value: "armor", label: "Arena Gear" },
];

export const AVATAR_OUTFIT_COLOR_OPTIONS: AvatarOption<AvatarOutfitColor>[] = [
  { value: "slate", label: "Slate" },
  { value: "cyan", label: "Cyan" },
  { value: "mint", label: "Mint" },
  { value: "coral", label: "Coral" },
  { value: "violet", label: "Violet" },
];

export const AVATAR_EXPRESSION_OPTIONS: AvatarOption<AvatarExpression>[] = [
  { value: "smile", label: "Smile" },
  { value: "focused", label: "Focused" },
  { value: "wink", label: "Wink" },
  { value: "surprised", label: "Surprised" },
];

export const AVATAR_ACCENT_COLOR_OPTIONS: AvatarOption<AvatarAccentColor>[] = [
  { value: "cyan", label: "Cyan" },
  { value: "mint", label: "Mint" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "violet", label: "Violet" },
];

export const AVATAR_SKIN_HEX: Record<AvatarSkinTone, string> = {
  porcelain: "#F8D7C4",
  warm: "#E9BC91",
  golden: "#D7A174",
  brown: "#9A6547",
  deep: "#6A4130",
};

export const AVATAR_HAIR_HEX: Record<AvatarHairColor, string> = {
  ink: "#1E293B",
  brown: "#5B3A2A",
  ginger: "#A94A25",
  blonde: "#C89D45",
  teal: "#0F766E",
};

export const AVATAR_OUTFIT_HEX: Record<AvatarOutfitColor, string> = {
  slate: "#334155",
  cyan: "#0891B2",
  mint: "#059669",
  coral: "#E76E5A",
  violet: "#6D28D9",
};

export const AVATAR_ACCENT_HEX: Record<AvatarAccentColor, string> = {
  cyan: "#22D3EE",
  mint: "#34D399",
  amber: "#FBBF24",
  rose: "#FB7185",
  violet: "#A78BFA",
};
