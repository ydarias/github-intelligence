import { z } from "zod";

// Must list every field `ThroughputService` produces: z.object strips unknown keys.
export const throughputItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  repository: z.string(),
  type: z.enum(["issue", "pr"]),
});

export const weeklyThroughputSchema = z.object({
  week: z.string(),
  issues: z.number(),
  prs: z.number(),
  items: z.array(throughputItemSchema),
});

export const throughputResponseSchema = z.object({
  byWeek: z.array(weeklyThroughputSchema),
});
