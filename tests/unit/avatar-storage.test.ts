import { beforeEach, describe, expect, it } from "vitest";

import { generateRandomAvatarConfig } from "@/lib/avatar/avatar-randomizer";
import { readAvatarConfig, writeAvatarConfig } from "@/lib/avatar/avatar-storage";
import { STORAGE_KEYS } from "@/lib/constants/app";

function createStorageMock(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.has(key) ? (values.get(key) ?? null) : null;
    },
    key(index: number) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

describe("avatar local storage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: createStorageMock(),
      configurable: true,
    });
  });

  it("writes and reads a normalized avatar config", () => {
    const config = generateRandomAvatarConfig();
    writeAvatarConfig(config);

    const restored = readAvatarConfig();

    expect(restored).toEqual(config);
  });

  it("returns null for malformed stored payload", () => {
    window.localStorage.setItem(STORAGE_KEYS.avatar, "{broken");
    expect(readAvatarConfig()).toBeNull();
  });
});
