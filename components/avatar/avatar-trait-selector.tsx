"use client";

import { cn } from "@/lib/utils/cn";

export type AvatarTraitOption = {
  value: string;
  label: string;
  swatch?: string;
};

type AvatarTraitSelectorProps = {
  label: string;
  value: string;
  options: AvatarTraitOption[];
  onChange: (value: string) => void;
  dense?: boolean;
};

export function AvatarTraitSelector({
  label,
  value,
  options,
  onChange,
  dense = false,
}: AvatarTraitSelectorProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 font-medium transition",
                dense ? "h-8 text-[11px]" : "h-9 text-xs",
                isActive
                  ? "border-primary/45 bg-primary/16 text-foreground"
                  : "border-border/75 bg-surface-2/70 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {option.swatch ? (
                <span
                  className="h-3 w-3 rounded-full border border-border/75"
                  style={{ backgroundColor: option.swatch }}
                />
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
