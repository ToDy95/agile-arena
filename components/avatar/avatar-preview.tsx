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
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSNAME: Record<NonNullable<AvatarPreviewProps["size"]>, string> = {
  sm: "h-28 w-28",
  md: "h-36 w-36",
  lg: "h-44 w-44",
};

export function AvatarPreview({ config, size = "md", className }: AvatarPreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/75 bg-[radial-gradient(circle_at_35%_25%,var(--arena-accent-soft),transparent_58%),linear-gradient(180deg,rgba(14,23,40,0.65),rgba(10,14,25,0.88))]",
        SIZE_CLASSNAME[size],
        className,
      )}
    >
      <AvatarPreviewCanvas config={config} />
    </div>
  );
}
