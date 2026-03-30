import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500 text-sky-950 hover:bg-sky-400 focus-visible:ring-sky-400/70 disabled:bg-sky-500/40",
        primary:
          "bg-sky-500 text-sky-950 hover:bg-sky-400 focus-visible:ring-sky-400/70 disabled:bg-sky-500/40",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-zinc-500/70 disabled:bg-zinc-800/40",
        ghost:
          "bg-transparent text-zinc-200 hover:bg-zinc-800/80 focus-visible:ring-zinc-500/60 disabled:text-zinc-500",
        destructive:
          "bg-rose-500 text-rose-950 hover:bg-rose-400 focus-visible:ring-rose-400/70 disabled:bg-rose-500/40",
        danger:
          "bg-rose-500 text-rose-950 hover:bg-rose-400 focus-visible:ring-rose-400/70 disabled:bg-rose-500/40",
        outline:
          "border border-zinc-700 bg-zinc-900/80 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900 focus-visible:ring-zinc-500/70",
        link: "text-sky-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed",
        buttonVariants({ variant, size, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
