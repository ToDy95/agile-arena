import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";

import { normalizeHexColor } from "@/lib/utils/color";
import { normalizeRoomId } from "@/lib/utils/room";

type AuthRequestBody = {
  room?: unknown;
  userId?: unknown;
  nickname?: unknown;
  color?: unknown;
};

function readBodyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  // Set this in `.env.local` based on `.env.example`.
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "Missing LIVEBLOCKS_SECRET_KEY." },
      { status: 500 },
    );
  }

  if (!secret.startsWith("sk_")) {
    return NextResponse.json(
      {
        error:
          "LIVEBLOCKS_SECRET_KEY looks invalid. It must be a secret key that starts with 'sk_'.",
      },
      { status: 500 },
    );
  }

  const parsedBody = (await request
    .json()
    .catch(() => null)) as AuthRequestBody | null;

  const rawRoomId = readBodyString(parsedBody?.room);
  const roomId = rawRoomId ? normalizeRoomId(rawRoomId) : null;

  if (!roomId) {
    return NextResponse.json({ error: "Invalid room id." }, { status: 400 });
  }

  const userId = readBodyString(parsedBody?.userId) ?? crypto.randomUUID();
  const nickname = (readBodyString(parsedBody?.nickname) ?? "Player").slice(0, 32);
  const color = normalizeHexColor(readBodyString(parsedBody?.color) ?? "") ?? "#38BDF8";

  try {
    const liveblocks = new Liveblocks({ secret });
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        nickname,
        color,
      },
    });

    session.allow(roomId, session.FULL_ACCESS);

    const { body, status, error } = await session.authorize();

    if (error) {
      return NextResponse.json(
        {
          error: "Liveblocks authorization failed.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: status || 500 },
      );
    }

    return new Response(body, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected authorization error.";

    return NextResponse.json(
      {
        error: "Liveblocks authorization failed.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
