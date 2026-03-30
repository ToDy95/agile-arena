import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}
