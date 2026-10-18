import { z } from "zod";

import { issueOriginEntrySchema } from "./issue-origin-entry.schema.js";

// Must list every field `IssueStatsService` produces, plus `byAuthor`: z.object strips unknown keys.
export const timeToClosePercentilesSchema = z.object({
  p50: z.number(),
  p75: z.number(),
  p90: z.number(),
  p99: z.number(),
});

export const monthlyTimeToCloseSchema = timeToClosePercentilesSchema.extend({
  month: z.string(),
});

export const issuesByDaySchema = z.object({
  date: z.string(),
  issues: z.number(),
  prs: z.number(),
});

export const issueStatsSchema = z.object({
  total: z.number(),
  open: z.number(),
  closed: z.number(),
  totalPRs: z.number(),
  openPRs: z.number(),
  closedPRs: z.number(),
  avgIssuesPerDay: z.number(),
  avgPRsPerDay: z.number(),
  timeToClosePercentiles: timeToClosePercentilesSchema.nullable(),
  timeToCloseByMonth: z.array(monthlyTimeToCloseSchema),
  byAuthor: z.array(issueOriginEntrySchema),
  byDay: z.array(issuesByDaySchema),
});
