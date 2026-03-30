"use client";

import { AvatarPreview } from "@/components/avatar/avatar-preview";
import { AvatarRandomizeButton } from "@/components/avatar/avatar-randomize-button";
import {
  type AvatarTraitOption,
  AvatarTraitSelector,
} from "@/components/avatar/avatar-trait-selector";
import { Card } from "@/components/ui/card";
import {
  AVATAR_ACCENT_COLOR_OPTIONS,
  AVATAR_ACCENT_HEX,
  AVATAR_ACCESSORY_OPTIONS,
  AVATAR_BODY_TYPE_OPTIONS,
  AVATAR_EXPRESSION_OPTIONS,
  AVATAR_HAIR_COLOR_OPTIONS,
  AVATAR_HAIR_HEX,
  AVATAR_HAIR_STYLE_OPTIONS,
  AVATAR_HAT_OPTIONS,
  AVATAR_OUTFIT_COLOR_OPTIONS,
  AVATAR_OUTFIT_HEX,
  AVATAR_OUTFIT_OPTIONS,
  AVATAR_SKIN_HEX,
  AVATAR_SKIN_TONE_OPTIONS,
} from "@/lib/avatar/avatar-options";
import type { AvatarConfig } from "@/lib/avatar/avatar-types";
import { normalizeAvatarConfig } from "@/lib/avatar/avatar-utils";
import { cn } from "@/lib/utils/cn";

type AvatarEditorProps = {
  value: AvatarConfig;
  onChange: (nextValue: AvatarConfig) => void;
  onRandomize: () => void;
  className?: string;
};

function withSwatches<T extends string>(
  options: Array<{ value: T; label: string }>,
  swatches: Record<T, string>,
): AvatarTraitOption[] {
  return options.map((option) => ({
    ...option,
    swatch: swatches[option.value],
  }));
}

export function AvatarEditor({ value, onChange, onRandomize, className }: AvatarEditorProps) {
  const applyField =
    <K extends keyof AvatarConfig>(field: K) =>
    (nextValue: string) => {
      onChange(
        normalizeAvatarConfig({
          ...value,
          [field]: nextValue,
        }),
      );
    };

  return (
    <Card className={cn("space-y-4 border-border/80 bg-card/90", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Avatar Loadout
          </p>
          <p className="text-sm text-foreground/90">Build your arena persona.</p>
        </div>
        <AvatarRandomizeButton onClick={onRandomize} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto,1fr]">
        <AvatarPreview config={value} size="lg" className="mx-auto lg:mx-0" />
        <div className="space-y-3">
          <AvatarTraitSelector
            label="Body"
            value={value.bodyType}
            options={AVATAR_BODY_TYPE_OPTIONS}
            onChange={applyField("bodyType")}
          />
          <AvatarTraitSelector
            label="Expression"
            value={value.expression}
            options={AVATAR_EXPRESSION_OPTIONS}
            onChange={applyField("expression")}
          />
          <AvatarTraitSelector
            label="Skin"
            value={value.skinTone}
            options={withSwatches(AVATAR_SKIN_TONE_OPTIONS, AVATAR_SKIN_HEX)}
            onChange={applyField("skinTone")}
            dense
          />
          <AvatarTraitSelector
            label="Hair Style"
            value={value.hairStyle}
            options={AVATAR_HAIR_STYLE_OPTIONS}
            onChange={applyField("hairStyle")}
            dense
          />
          <AvatarTraitSelector
            label="Hair Color"
            value={value.hairColor}
            options={withSwatches(AVATAR_HAIR_COLOR_OPTIONS, AVATAR_HAIR_HEX)}
            onChange={applyField("hairColor")}
            dense
          />
          <AvatarTraitSelector
            label="Hat"
            value={value.hat}
            options={AVATAR_HAT_OPTIONS}
            onChange={applyField("hat")}
            dense
          />
          <AvatarTraitSelector
            label="Accessory"
            value={value.accessory}
            options={AVATAR_ACCESSORY_OPTIONS}
            onChange={applyField("accessory")}
            dense
          />
          <AvatarTraitSelector
            label="Outfit"
            value={value.outfit}
            options={AVATAR_OUTFIT_OPTIONS}
            onChange={applyField("outfit")}
            dense
          />
          <AvatarTraitSelector
            label="Outfit Color"
            value={value.outfitColor}
            options={withSwatches(AVATAR_OUTFIT_COLOR_OPTIONS, AVATAR_OUTFIT_HEX)}
            onChange={applyField("outfitColor")}
            dense
          />
          <AvatarTraitSelector
            label="Accent"
            value={value.accentColor}
            options={withSwatches(AVATAR_ACCENT_COLOR_OPTIONS, AVATAR_ACCENT_HEX)}
            onChange={applyField("accentColor")}
            dense
          />
        </div>
      </div>
    </Card>
  );
}
