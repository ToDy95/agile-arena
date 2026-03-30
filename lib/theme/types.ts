export const THEME_MODES = ["dark", "light", "random"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value !== undefined && value !== null && THEME_MODES.includes(value as ThemeMode);
}
