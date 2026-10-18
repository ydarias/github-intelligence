import { z } from "zod";

// Must list every field `CycleTimeService` produces: z.object strips unknown keys.
export const cycleTimeItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  repository: z.string(),
  type: z.enum(["issue", "pr"]),
  closeDate: z.string(),
  cycleDays: z.number(),
});

export const cycleTimeResponseSchema = z.object({
  items: z.array(cycleTimeItemSchema),
});
