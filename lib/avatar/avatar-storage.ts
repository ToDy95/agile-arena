import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { normalizeAvatarConfig } from "@/lib/avatar/avatar-utils";
import { STORAGE_KEYS } from "@/lib/constants/app";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readAvatarConfig(): AvatarConfig | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEYS.avatar);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeAvatarConfig(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function writeAvatarConfig(config: AvatarConfig): void {
  if (!canUseStorage()) {
    return;
  }

  const normalizedConfig = normalizeAvatarConfig(config);
  window.localStorage.setItem(STORAGE_KEYS.avatar, JSON.stringify(normalizedConfig));
}
