import type { z } from "zod";

import type { issuesByDaySchema } from "../schemas/issue-stats.schema.js";

export type IssuesByDay = z.infer<typeof issuesByDaySchema>;
