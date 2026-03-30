import { COLOR_PALETTE } from "@/lib/constants/colors";
import { hexColorSchema } from "@/lib/schemas/identity";

export function isHexColor(value: string): boolean {
  return hexColorSchema.safeParse(value).success;
}

export function normalizeHexColor(value: string): string | null {
  const parsed = hexColorSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function generateRandomColor(previous?: string): string {
  const previousColor = normalizeHexColor(previous ?? "");
  const alternatives = COLOR_PALETTE.filter((color) => color !== previousColor);

  if (alternatives.length === 0) {
    return COLOR_PALETTE[0];
  }

  const index = Math.floor(Math.random() * alternatives.length);
  return alternatives[index];
}
