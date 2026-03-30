import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-150 active:translate-y-px active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90",
        primary:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90",
        secondary:
          "border border-border/80 bg-surface-2/90 text-foreground shadow-sm shadow-black/5 hover:bg-surface-3",
        ghost: "bg-transparent text-foreground/85 hover:bg-accent hover:text-foreground",
        destructive:
          "bg-destructive text-white shadow-sm shadow-destructive/25 hover:bg-destructive/90",
        danger: "bg-destructive text-white shadow-sm shadow-destructive/25 hover:bg-destructive/90",
        outline: "border border-border bg-surface-1/90 text-foreground hover:bg-surface-2",
        link: "text-primary underline-offset-4 hover:underline",
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
