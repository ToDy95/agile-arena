import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-3 text-sm text-zinc-100",
        "placeholder:text-zinc-500 focus:border-sky-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
