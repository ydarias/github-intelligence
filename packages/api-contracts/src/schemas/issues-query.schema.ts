import { z } from "zod";

const LABELS_SEPARATOR = ",";

const labelsSchema = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(LABELS_SEPARATOR)
      .map((label) => label.trim())
      .filter((label) => label !== ""),
  );

export const issuesQuerySchema = z.object({
  type: z.enum(["all", "issue", "pr"]).default("all"),
  title: z.string().default(""),
  state: z.enum(["all", "open", "closed"]).default("all"),
  author: z.string().default(""),
  assignee: z.string().default(""),
  labels: labelsSchema,
  oneDayOnly: z.stringbool().default(false),
});
