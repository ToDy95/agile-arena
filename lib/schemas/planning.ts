import { z } from "zod";

export const MAX_TASK_INPUT_LENGTH = 200;

export const planningTaskInputSchema = z
  .string()
  .trim()
  .max(MAX_TASK_INPUT_LENGTH, `Task must be ${MAX_TASK_INPUT_LENGTH} characters or less.`);

export function normalizePlanningTaskInput(value: string): string {
  const candidate = value.trim().slice(0, MAX_TASK_INPUT_LENGTH);
  const parsed = planningTaskInputSchema.safeParse(candidate);

  return parsed.success ? parsed.data : "";
}
