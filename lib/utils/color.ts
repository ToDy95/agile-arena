import { COLOR_PALETTE } from "@/lib/constants/colors";

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();

  if (isHexColor(trimmed)) {
    return trimmed.toUpperCase();
  }

  return null;
}

export function generateRandomColor(previous?: string): string {
  const alternatives = COLOR_PALETTE.filter((color) => color !== previous);

  if (alternatives.length === 0) {
    return COLOR_PALETTE[0];
  }

  const index = Math.floor(Math.random() * alternatives.length);
  return alternatives[index];
}
