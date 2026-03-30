import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-[0_0_0_1px_rgba(24,24,27,0.7),0_12px_35px_rgba(2,6,23,0.45)]",
        className,
      )}
      {...props}
    />
  );
}
