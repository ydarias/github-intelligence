import { z } from "zod";

// Must list every field `ReportService` produces: z.object strips unknown keys.
export const reportDaySchema = z.object({
  date: z.string(),
  issues: z.number(),
  prs: z.number(),
});

export const repositoryReportSchema = z.object({
  repository: z.string(),
  byDay: z.array(reportDaySchema),
});

export const reportResponseSchema = z.object({
  repositories: z.array(repositoryReportSchema),
});
