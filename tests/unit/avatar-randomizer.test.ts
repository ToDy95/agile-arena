import { describe, expect, it } from "vitest";

import { generateRandomAvatarConfig } from "@/lib/avatar/avatar-randomizer";
import { avatarConfigSchema } from "@/lib/avatar/avatar-utils";

describe("generateRandomAvatarConfig", () => {
  it("always returns a valid avatar config", () => {
    for (let index = 0; index < 120; index += 1) {
      const result = avatarConfigSchema.safeParse(generateRandomAvatarConfig());
      expect(result.success).toBe(true);
    }
  });

  it("sanitizes incompatible seeded combinations", () => {
    const seeded = generateRandomAvatarConfig({
      hat: "party",
      accessory: "visor",
      hairStyle: "mohawk",
    });

    expect(seeded.accessory).not.toBe("visor");
    expect(seeded.hairStyle).not.toBe("mohawk");
  });
});
