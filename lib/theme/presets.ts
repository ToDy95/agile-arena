export type RandomThemePreset = {
  id: string;
  label: string;
  description: string;
  accent: string;
  accentForeground: string;
  accentSoft: string;
  accentGlow: string;
};

export const RANDOM_THEME_PRESETS: readonly RandomThemePreset[] = [
  {
    id: "aurora",
    label: "Aurora",
    description: "Cool cyan with clean contrast.",
    accent: "oklch(0.74 0.14 235)",
    accentForeground: "oklch(0.17 0.02 262)",
    accentSoft: "oklch(0.74 0.14 235 / 0.19)",
    accentGlow: "oklch(0.74 0.14 235 / 0.3)",
  },
  {
    id: "ember",
    label: "Ember",
    description: "Warm coral accents with bold focus states.",
    accent: "oklch(0.72 0.16 28)",
    accentForeground: "oklch(0.17 0.02 262)",
    accentSoft: "oklch(0.72 0.16 28 / 0.17)",
    accentGlow: "oklch(0.72 0.16 28 / 0.28)",
  },
  {
    id: "verdant",
    label: "Verdant",
    description: "Fresh mint tone with soft glow.",
    accent: "oklch(0.78 0.14 162)",
    accentForeground: "oklch(0.17 0.02 262)",
    accentSoft: "oklch(0.78 0.14 162 / 0.17)",
    accentGlow: "oklch(0.78 0.14 162 / 0.27)",
  },
  {
    id: "nebula",
    label: "Nebula",
    description: "Deep violet for a richer lobby skin.",
    accent: "oklch(0.71 0.15 300)",
    accentForeground: "oklch(0.97 0.01 270)",
    accentSoft: "oklch(0.71 0.15 300 / 0.2)",
    accentGlow: "oklch(0.71 0.15 300 / 0.3)",
  },
] as const;

export const DEFAULT_RANDOM_THEME_PRESET = RANDOM_THEME_PRESETS[0];

export function getRandomThemePresetById(presetId: string | null | undefined): RandomThemePreset {
  if (!presetId) {
    return DEFAULT_RANDOM_THEME_PRESET;
  }

  return (
    RANDOM_THEME_PRESETS.find((preset) => preset.id === presetId) ?? DEFAULT_RANDOM_THEME_PRESET
  );
}

export function pickRandomThemePreset(excludeId?: string): RandomThemePreset {
  const pool = RANDOM_THEME_PRESETS.filter((preset) => preset.id !== excludeId);

  if (pool.length === 0) {
    return DEFAULT_RANDOM_THEME_PRESET;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);

  return pool[randomIndex] ?? DEFAULT_RANDOM_THEME_PRESET;
}
