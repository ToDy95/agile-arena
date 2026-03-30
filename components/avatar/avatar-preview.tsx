"use client";

import dynamic from "next/dynamic";
import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { cn } from "@/lib/utils/cn";

const AvatarPreviewCanvas = dynamic(
  () =>
    import("@/components/avatar/avatar-preview-canvas").then(
      (module) => module.AvatarPreviewCanvas,
    ),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-surface-2/80" />,
  },
);

type AvatarPreviewProps = {
  config: AvatarConfig;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSNAME: Record<NonNullable<AvatarPreviewProps["size"]>, string> = {
  xs: "h-16 w-16",
  sm: "h-28 w-28",
  md: "h-36 w-36",
  lg: "h-44 w-44",
};

export function AvatarPreview({ config, size = "md", className }: AvatarPreviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/75 bg-[radial-gradient(circle_at_35%_20%,var(--arena-accent-soft),transparent_58%),radial-gradient(circle_at_72%_88%,rgba(34,211,238,0.16),transparent_54%),linear-gradient(180deg,rgba(14,23,40,0.72),rgba(7,10,18,0.94))] shadow-[0_0_0_1px_rgba(125,211,252,0.12),0_20px_32px_rgba(2,6,23,0.44)]",
        SIZE_CLASSNAME[size],
        className,
      )}
    >
      <AvatarPreviewCanvas config={config} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(255,255,255,0.22),transparent_38%),linear-gradient(to_top,rgba(8,11,20,0.34),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-x-3 bottom-2 h-[2px] rounded-full bg-primary/25 blur-[2px]" />
    </div>
  );
}
