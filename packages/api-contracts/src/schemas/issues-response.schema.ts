import { z } from "zod";

import { githubIssueSchema } from "./github-issue.schema.js";
import { issueStatsSchema } from "./issue-stats.schema.js";

export const issueFilterOptionsSchema = z.object({
  authors: z.array(z.string()),
  assignees: z.array(z.string()),
  labels: z.array(z.string()),
});

export const issuesResponseSchema = z.object({
  issues: z.array(githubIssueSchema),
  stats: issueStatsSchema,
  total: z.number(),
  filterOptions: issueFilterOptionsSchema,
});
