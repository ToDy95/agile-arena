"use client";

import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";

type AvatarRandomizeButtonProps = {
  onClick: () => void;
  label?: string;
};

export function AvatarRandomizeButton({
  onClick,
  label = "Randomize avatar",
}: AvatarRandomizeButtonProps) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={onClick}>
      <Dices className="h-4 w-4" />
      {label}
    </Button>
  );
}
