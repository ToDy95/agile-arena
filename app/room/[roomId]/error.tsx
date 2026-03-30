"use client";

import { Button } from "@/components/ui/button";

type RoomErrorProps = {
  error: Error;
  reset: () => void;
};

export default function RoomError({ error, reset }: RoomErrorProps) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
        <h1 className="text-lg font-semibold">Could not load room</h1>
        <p className="text-sm text-rose-100/90">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex justify-center">
          <Button variant="secondary" onClick={reset}>
            Retry
          </Button>
        </div>
      </div>
    </main>
  );
}
