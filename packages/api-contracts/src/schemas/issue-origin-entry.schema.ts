import { z } from "zod";

export const issueOriginEntrySchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  total: z.number(),
  open: z.number(),
  closed: z.number(),
  percentage: z.number(),
});
