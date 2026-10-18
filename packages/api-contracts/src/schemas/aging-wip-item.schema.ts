import { z } from "zod";

// Must list every field `AgingWipService` produces: z.object strips unknown keys.
export const agingWipItemSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  url: z.string(),
  repository: z.string(),
  type: z.enum(["issue", "pr"]),
  ageDays: z.number(),
  author: z.string(),
  assignees: z.array(z.string()),
  labels: z.array(z.string()),
});
