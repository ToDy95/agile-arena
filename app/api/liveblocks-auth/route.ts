import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { z } from "zod";

import { liveblocksAuthRequestSchema } from "@/lib/schemas/liveblocks-auth";
import { parseRoomId } from "@/lib/schemas/room";
import { normalizeHexColor } from "@/lib/utils/color";

const fallbackNicknameSchema = z.string().trim().min(1).max(32).catch("Player");

export async function POST(request: Request) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    return NextResponse.json({ error: "Missing LIVEBLOCKS_SECRET_KEY." }, { status: 500 });
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

  const rawBody = (await request.json().catch(() => null)) as unknown;
  const parsedBody = liveblocksAuthRequestSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid authentication payload." }, { status: 400 });
  }

  const roomId = parseRoomId(parsedBody.data.room ?? "");

  if (!roomId) {
    return NextResponse.json({ error: "Invalid room id." }, { status: 400 });
  }

  const userId = parsedBody.data.userId?.trim() || crypto.randomUUID();
  const nickname = fallbackNicknameSchema.parse(parsedBody.data.nickname);
  const color = normalizeHexColor(parsedBody.data.color ?? "") ?? "#38BDF8";

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
    const message = error instanceof Error ? error.message : "Unexpected authorization error.";

    return NextResponse.json(
      {
        error: "Liveblocks authorization failed.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
