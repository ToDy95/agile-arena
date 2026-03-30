"use client";

import { createClient } from "@liveblocks/client";

import {
  createDefaultIdentity,
  readIdentity,
  writeIdentity,
} from "@/lib/storage/identity-storage";

async function authEndpoint(room?: string) {
  const storedIdentity = readIdentity();
  const identity = storedIdentity ?? createDefaultIdentity();

  if (!storedIdentity) {
    writeIdentity(identity);
  }

  const response = await fetch("/api/liveblocks-auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room,
      userId: identity.userId,
      nickname: identity.nickname,
      color: identity.color,
    }),
  });

  if (!response.ok) {
    let details = "Could not authenticate with Liveblocks.";

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        details = payload.error;
      }
    } catch {
      // Ignore non-JSON auth errors.
    }

    throw new Error(`Liveblocks auth failed (${response.status}): ${details}`);
  }

  return response.json();
}

export const liveblocksClient = createClient({ authEndpoint });
