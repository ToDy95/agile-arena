import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-500 text-sky-950 hover:bg-sky-400 focus-visible:ring-sky-400/70 disabled:bg-sky-500/40",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-zinc-500/70 disabled:bg-zinc-800/40",
  ghost:
    "bg-transparent text-zinc-200 hover:bg-zinc-800/80 focus-visible:ring-zinc-500/60 disabled:text-zinc-500",
  danger:
    "bg-rose-500 text-rose-950 hover:bg-rose-400 focus-visible:ring-rose-400/70 disabled:bg-rose-500/40",
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      {...props}
    />
  );
}
