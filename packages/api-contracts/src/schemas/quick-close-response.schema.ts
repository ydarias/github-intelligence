import { z } from "zod";

// Must list every field `QuickCloseService` produces: z.object strips unknown keys.
export const quickCloseByDaySchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const quickCloseItemSchema = z.object({
  id: z.number(),
  number: z.number(),
  repository: z.string(),
  title: z.string(),
  url: z.string(),
});

export const quickCloseResponseSchema = z.object({
  byDay: z.array(quickCloseByDaySchema),
  items: z.array(quickCloseItemSchema),
});
