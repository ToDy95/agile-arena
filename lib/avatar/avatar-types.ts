export const AVATAR_BODY_TYPES = ["compact", "classic", "heroic"] as const;
export const AVATAR_SKIN_TONES = ["porcelain", "warm", "golden", "brown", "deep"] as const;
export const AVATAR_HAIR_STYLES = ["buzz", "short", "curly", "ponytail", "mohawk"] as const;
export const AVATAR_HAIR_COLORS = ["ink", "brown", "ginger", "blonde", "teal"] as const;
export const AVATAR_HATS = ["none", "beanie", "cap", "party"] as const;
export const AVATAR_ACCESSORIES = ["none", "glasses", "visor", "monocle"] as const;
export const AVATAR_OUTFITS = ["hoodie", "tee", "jacket", "armor"] as const;
export const AVATAR_OUTFIT_COLORS = ["slate", "cyan", "mint", "coral", "violet"] as const;
export const AVATAR_EXPRESSIONS = ["smile", "focused", "wink", "surprised"] as const;
export const AVATAR_ACCENT_COLORS = ["cyan", "mint", "amber", "rose", "violet"] as const;

export type AvatarBodyType = (typeof AVATAR_BODY_TYPES)[number];
export type AvatarSkinTone = (typeof AVATAR_SKIN_TONES)[number];
export type AvatarHairStyle = (typeof AVATAR_HAIR_STYLES)[number];
export type AvatarHairColor = (typeof AVATAR_HAIR_COLORS)[number];
export type AvatarHat = (typeof AVATAR_HATS)[number];
export type AvatarAccessory = (typeof AVATAR_ACCESSORIES)[number];
export type AvatarOutfit = (typeof AVATAR_OUTFITS)[number];
export type AvatarOutfitColor = (typeof AVATAR_OUTFIT_COLORS)[number];
export type AvatarExpression = (typeof AVATAR_EXPRESSIONS)[number];
export type AvatarAccentColor = (typeof AVATAR_ACCENT_COLORS)[number];

export type AvatarConfig = {
  bodyType: AvatarBodyType;
  skinTone: AvatarSkinTone;
  hairStyle: AvatarHairStyle;
  hairColor: AvatarHairColor;
  hat: AvatarHat;
  accessory: AvatarAccessory;
  outfit: AvatarOutfit;
  outfitColor: AvatarOutfitColor;
  expression: AvatarExpression;
  accentColor: AvatarAccentColor;
};
