import type { z } from "zod";

import type { issueStatsSchema } from "../schemas/issue-stats.schema.js";

export type IssueStats = z.infer<typeof issueStatsSchema>;
