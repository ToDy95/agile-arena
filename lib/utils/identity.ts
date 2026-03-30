import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { normalizeAvatarConfig } from "@/lib/avatar/avatar-utils";
import { nicknameSchema } from "@/lib/schemas/identity";
import { generateRandomColor, normalizeHexColor } from "@/lib/utils/color";

export type ResolvedJoinIdentity = {
  nickname: string;
  color: string;
  avatar: AvatarConfig;
};

type JoinIdentityInput = {
  nickname: string;
  color: string;
  avatar: unknown;
};

type ResolvedJoinIdentityResult =
  | {
      success: true;
      data: ResolvedJoinIdentity;
    }
  | {
      success: false;
      error: string;
    };

export function resolveJoinIdentity(input: JoinIdentityInput): ResolvedJoinIdentityResult {
  const parsedNickname = nicknameSchema.safeParse(input.nickname);

  if (!parsedNickname.success) {
    return {
      success: false,
      error: parsedNickname.error.issues[0]?.message ?? "Nickname is required.",
    };
  }

  const resolvedColor = normalizeHexColor(input.color) ?? generateRandomColor(input.color);

  return {
    success: true,
    data: {
      nickname: parsedNickname.data,
      color: resolvedColor,
      avatar: normalizeAvatarConfig(input.avatar),
    },
  };
}
