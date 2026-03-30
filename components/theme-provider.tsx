"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_RANDOM_THEME_PRESET,
  getRandomThemePresetById,
  pickRandomThemePreset,
  RANDOM_THEME_PRESETS,
  type RandomThemePreset,
} from "@/lib/theme/presets";
import { isThemeMode, type ThemeMode } from "@/lib/theme/types";

const THEME_MODE_STORAGE_KEY = "agile-arena:theme-mode";
const RANDOM_THEME_STORAGE_KEY = "agile-arena:random-theme-preset";
const RANDOM_THEME_ATTRIBUTE = "data-random-theme";
const RANDOM_THEME_VARIABLES = [
  "--arena-accent",
  "--arena-accent-foreground",
  "--arena-accent-soft",
  "--arena-accent-glow",
] as const;

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  randomizeTheme: () => void;
  activePreset: RandomThemePreset;
  presets: readonly RandomThemePreset[];
  isRandomMode: boolean;
  isReady: boolean;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function ThemeModeStateProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [presetId, setPresetId] = useState<string>(DEFAULT_RANDOM_THEME_PRESET.id);
  const [isReady, setIsReady] = useState(false);

  const activePreset = useMemo(() => getRandomThemePresetById(presetId), [presetId]);

  const randomizeTheme = useCallback(() => {
    setPresetId((current) => pickRandomThemePreset(current).id);
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    if (nextMode === "random") {
      setPresetId((current) => pickRandomThemePreset(current).id);
    }

    setModeState(nextMode);
  }, []);

  useEffect(() => {
    const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    const storedPresetId = window.localStorage.getItem(RANDOM_THEME_STORAGE_KEY);

    if (isThemeMode(storedMode)) {
      setModeState(storedMode);
    }

    if (storedPresetId) {
      setPresetId(getRandomThemePresetById(storedPresetId).id);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    window.localStorage.setItem(RANDOM_THEME_STORAGE_KEY, presetId);
  }, [isReady, mode, presetId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const root = document.documentElement;
    const clearRandomThemeVariables = () => {
      for (const token of RANDOM_THEME_VARIABLES) {
        root.style.removeProperty(token);
      }
    };

    if (mode === "light") {
      setTheme("light");
      root.removeAttribute(RANDOM_THEME_ATTRIBUTE);
      clearRandomThemeVariables();
      return;
    }

    if (mode === "dark") {
      setTheme("dark");
      root.removeAttribute(RANDOM_THEME_ATTRIBUTE);
      clearRandomThemeVariables();
      return;
    }

    setTheme("dark");
    root.setAttribute(RANDOM_THEME_ATTRIBUTE, activePreset.id);
    root.style.setProperty("--arena-accent", activePreset.accent);
    root.style.setProperty("--arena-accent-foreground", activePreset.accentForeground);
    root.style.setProperty("--arena-accent-soft", activePreset.accentSoft);
    root.style.setProperty("--arena-accent-glow", activePreset.accentGlow);
  }, [
    activePreset.accent,
    activePreset.accentForeground,
    activePreset.accentGlow,
    activePreset.accentSoft,
    activePreset.id,
    isReady,
    mode,
    setTheme,
  ]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      setMode,
      randomizeTheme,
      activePreset,
      presets: RANDOM_THEME_PRESETS,
      isRandomMode: mode === "random",
      isReady,
    }),
    [activePreset, isReady, mode, randomizeTheme, setMode],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeModeStateProvider>{children}</ThemeModeStateProvider>
    </NextThemesProvider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return context;
}
